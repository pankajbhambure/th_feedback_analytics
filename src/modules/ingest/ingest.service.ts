import crypto from 'crypto';
import Channel, { AuthType, PaginationType } from '../../models/channel.model';
import FeedbackRaw, { ProcessingStatus } from '../../models/feedbackRaw.model';
import { logger } from '../../utils/logger';

interface IngestionResult {
  inserted: number;
  skipped: number;
}

interface FeedbackItem {
  [key: string]: any;
}

export class IngestService {
  private async getChannelConfig(channelId: string): Promise<Channel> {
    const channel = await Channel.findOne({
      where: { channelId, isActive: true },
    });

    if (!channel) {
      throw new Error(`Channel '${channelId}' not found or inactive`);
    }

    return channel;
  }

  private generateSourceHash(channelId: string, externalId: string): string {
    return crypto
      .createHash('sha256')
      .update(`${channelId}:${externalId}`)
      .digest('hex');
  }

  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchWithAuth(
    url: string,
    channel: Channel,
    method: string = 'GET'
  ): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (channel.authType === AuthType.JWT && channel.authConfig) {
      const authHeaderName = channel.authConfig.authHeaderName || 'Authorization';
      const headerPrefix = channel.authConfig.headerPrefix || 'Bearer';
      const token = channel.authConfig.token;

      if (token) {
        headers[authHeaderName] = `${headerPrefix} ${token}`;
      }
    } else if (channel.authType === AuthType.API_KEY && channel.authConfig) {
      const apiKeyHeaderName = channel.authConfig.apiKeyHeaderName || 'x-api-key';
      const apiKey = channel.authConfig.apiKey;

      if (apiKey) {
        headers[apiKeyHeaderName] = apiKey;
      }
    }

    const options: RequestInit = {
      method,
      headers,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  private async fetchFeedbackForDate(
    channel: Channel,
    date: Date
  ): Promise<FeedbackItem[]> {
    const allFeedback: FeedbackItem[] = [];
    const formattedDate = this.formatDate(date, channel.dateFormat);

    if (channel.paginationType === PaginationType.NONE) {
      const url = new URL(channel.baseUrl);
      url.searchParams.set(channel.dateFromParam, formattedDate);
      url.searchParams.set(channel.dateToParam, formattedDate);

      logger.info(`Fetching from ${url.toString()}`);
      const data = await this.fetchWithAuth(url.toString(), channel, channel.httpMethod);

      await this.sleep(500);

      if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (data.feedbacks && Array.isArray(data.feedbacks)) {
        return data.feedbacks;
      }

      return [];
    }

    let currentPage = channel.startPage;
    let hasMorePages = true;

    while (hasMorePages) {
      const url = new URL(channel.baseUrl);
      url.searchParams.set(channel.dateFromParam, formattedDate);
      url.searchParams.set(channel.dateToParam, formattedDate);
      url.searchParams.set(channel.pageParam, String(currentPage));

      logger.info(`Fetching page ${currentPage} from ${url.toString()}`);

      try {
        const data = await this.fetchWithAuth(url.toString(), channel, channel.httpMethod);

        let feedbackItems: FeedbackItem[] = [];

        if (Array.isArray(data)) {
          feedbackItems = data;
        } else if (data.data && Array.isArray(data.data)) {
          feedbackItems = data.data;
        } else if (data.feedbacks && Array.isArray(data.feedbacks)) {
          feedbackItems = data.feedbacks;
        }

        if (feedbackItems.length === 0) {
          hasMorePages = false;
        } else {
          allFeedback.push(...feedbackItems);
          currentPage++;

          await this.sleep(100);
        }
      } catch (error) {
        logger.error(`Error fetching page ${currentPage}:`, error);
        throw error;
      }
    }

    return allFeedback;
  }

  private extractExternalId(feedback: FeedbackItem, channel: Channel): string {
    if (channel.responseSchema && channel.responseSchema.externalIdField) {
      const field = channel.responseSchema.externalIdField;
      return feedback[field] || feedback.id || feedback.feedback_id;
    }

    return feedback.id || feedback.feedback_id || feedback.externalId || feedback.external_id;
  }

  private extractFeedbackTimestamp(feedback: FeedbackItem, channel: Channel): Date {
    if (channel.responseSchema && channel.responseSchema.timestampField) {
      const field = channel.responseSchema.timestampField;
      return new Date(feedback[field]);
    }

    const timestampField = feedback.timestamp || feedback.created_at || feedback.createdAt || feedback.date;
    return timestampField ? new Date(timestampField) : new Date();
  }

  private async insertFeedback(
    channelId: string,
    externalFeedbackId: string,
    feedbackTimestamp: Date,
    rawPayload: Record<string, any>
  ): Promise<boolean> {
    const sourceHash = this.generateSourceHash(channelId, externalFeedbackId);

    try {
      await FeedbackRaw.create({
        channelId,
        externalFeedbackId,
        feedbackTimestamp,
        rawPayload,
        sourceHash,
        processingStatus: ProcessingStatus.NEW,
      });

      return true;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        logger.debug(
          `Duplicate feedback skipped: ${channelId}:${externalFeedbackId}`
        );
        return false;
      }
      throw error;
    }
  }

  async ingestInstoreFeedback(fromDate: string, toDate: string): Promise<IngestionResult> {
    const channel = await this.getChannelConfig('instore');

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (startDate > endDate) {
      throw new Error('fromDate must be before or equal to toDate');
    }

    let totalInserted = 0;
    let totalSkipped = 0;

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = this.formatDate(currentDate, 'YYYY-MM-DD');
      logger.info(`Processing feedbacks for date: ${dateStr}`);

      try {
        const feedbacks = await this.fetchFeedbackForDate(channel, currentDate);

        logger.info(`Found ${feedbacks.length} feedbacks for ${dateStr}`);

        for (const feedback of feedbacks) {
          const externalId = this.extractExternalId(feedback, channel);
          const timestamp = this.extractFeedbackTimestamp(feedback, channel);

          if (!externalId) {
            logger.warn('Feedback missing external ID, skipping:', feedback);
            totalSkipped++;
            continue;
          }

          const inserted = await this.insertFeedback(
            'instore',
            externalId,
            timestamp,
            feedback
          );

          if (inserted) {
            totalInserted++;
          } else {
            totalSkipped++;
          }
        }
      } catch (error) {
        logger.error(`Error processing date ${dateStr}:`, error);
        throw error;
      }

      currentDate = this.addDays(currentDate, 1);
    }

    logger.info(
      `Ingestion completed: ${totalInserted} inserted, ${totalSkipped} skipped`
    );

    return {
      inserted: totalInserted,
      skipped: totalSkipped,
    };
  }
}

export default new IngestService();
