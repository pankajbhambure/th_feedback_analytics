import { Op } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import FeedbackRaw, { ProcessingStatus } from '../../models/feedbackRaw.model';
import Store from '../../models/store.model';
import Customer from '../../models/customer.model';
import CustomerVisit, { Sentiment } from '../../models/customerVisit.model';
import Rating from '../../models/rating.model';
import Feedback, { FeedbackStatus } from '../../models/feedback.model';
import FeedbackResponse from '../../models/feedbackResponse.model';
import { sequelize } from '../../config/sequelize';
import { logger } from '../../utils/logger';

const FAMEPILOT_CHANNELS = ['swiggy', 'zomato', 'google', 'magicpin'];

interface SkippedRecord {
  feedbackRawId: string;
  externalFeedbackId: string;
  channelId: string;
  branchName: string;
  skipReason: 'STORE_NOT_FOUND' | 'MULTIPLE_STORE_MATCH';
  timestamp: Date;
}

interface ProcessingResult {
  processed: number;
  skipped: number;
  logFile: string;
}

export class FamepilotProcessService {
  private skippedRecords: SkippedRecord[] = [];
  private logFileName: string = '';

  private initializeLogFile(startDate: string, endDate: string): void {
    const now = new Date();
    const runDate = now.toISOString().split('T')[0];
    const runTime = now.toTimeString().split(' ')[0].replace(/:/g, '-');

    this.logFileName = `famepilot_${startDate}_${endDate}_${runDate}_${runTime}.log`;
    this.skippedRecords = [];
  }

  private writeLogFile(): void {
    if (this.skippedRecords.length === 0) {
      return;
    }

    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logPath = path.join(logsDir, this.logFileName);
    const logContent = this.skippedRecords
      .map(record => {
        return [
          `Feedback Raw ID: ${record.feedbackRawId}`,
          `External Feedback ID: ${record.externalFeedbackId}`,
          `Channel ID: ${record.channelId}`,
          `Branch Name: ${record.branchName}`,
          `Skip Reason: ${record.skipReason}`,
          `Timestamp: ${record.timestamp.toISOString()}`,
          '---',
        ].join('\n');
      })
      .join('\n');

    fs.writeFileSync(logPath, logContent, 'utf-8');
    logger.info(`Skip log written to: ${this.logFileName}`);
  }

  private extractFromPayload(payload: Record<string, any>, ...keys: string[]): any {
    for (const key of keys) {
      if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
        return payload[key];
      }
    }
    return null;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getQuarter(month: number): number {
    return Math.ceil(month / 3);
  }

  private getDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  private deriveSentiment(overallRating: number): Sentiment {
    if (overallRating >= 4) return Sentiment.POSITIVE;
    if (overallRating <= 2) return Sentiment.NEGATIVE;
    return Sentiment.NEUTRAL;
  }

  private async resolveStoreFamepilot(branchName: string): Promise<Store | null | 'MULTIPLE'> {
    const stores = await Store.findAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('store_location')),
        {
          [Op.like]: `%${branchName.toLowerCase()}%`
        }
      ),
    });

    if (stores.length === 0) {
      return null;
    }

    if (stores.length > 1) {
      return 'MULTIPLE';
    }

    return stores[0];
  }

  private async resolveOrCreateCustomerFamepilot(
    channelId: string,
    externalCustomerId: string,
    fullName: string | null,
    email: string | null,
    phone: string | null,
    customerType: string | null
  ): Promise<Customer> {
    const customerId = `${channelId}_${externalCustomerId}`;

    let customer = await Customer.findOne({
      where: { customerId },
    });

    if (customer) {
      return customer;
    }

    const repeatCustomer = customerType?.toLowerCase() === 'repeat';

    customer = await Customer.create({
      customerId,
      fullName,
      email,
      phone,
      repeatCustomer,
    });

    return customer;
  }

  private async processSingleFamepilotFeedback(
    feedbackRaw: FeedbackRaw
  ): Promise<'PROCESSED' | 'SKIPPED'> {
    const transaction = await sequelize.transaction();

    try {
      const payload = feedbackRaw.rawPayload;

      const existingVisit = await CustomerVisit.findOne({
        where: { feedbackRawId: feedbackRaw.id },
        transaction,
      });

      if (existingVisit) {
        logger.debug(`Customer visit already exists for feedback_raw ${feedbackRaw.id}, skipping`);
        await transaction.rollback();
        return 'SKIPPED';
      }

      const branchName = this.extractFromPayload(payload, 'branch');

      if (!branchName) {
        logger.error(`No branch name found in feedback ${feedbackRaw.id}`);
        this.skippedRecords.push({
          feedbackRawId: feedbackRaw.id,
          externalFeedbackId: feedbackRaw.externalFeedbackId,
          channelId: feedbackRaw.channelId,
          branchName: 'N/A',
          skipReason: 'STORE_NOT_FOUND',
          timestamp: new Date(),
        });
        await feedbackRaw.update(
          { processingStatus: ProcessingStatus.SKIPPED },
          { transaction }
        );
        await transaction.commit();
        return 'SKIPPED';
      }

      const storeResult = await this.resolveStoreFamepilot(branchName);

      if (storeResult === null) {
        logger.warn(`Store not found for branch: ${branchName} (feedback ${feedbackRaw.id})`);
        this.skippedRecords.push({
          feedbackRawId: feedbackRaw.id,
          externalFeedbackId: feedbackRaw.externalFeedbackId,
          channelId: feedbackRaw.channelId,
          branchName,
          skipReason: 'STORE_NOT_FOUND',
          timestamp: new Date(),
        });
        await feedbackRaw.update(
          { processingStatus: ProcessingStatus.SKIPPED },
          { transaction }
        );
        await transaction.commit();
        return 'SKIPPED';
      }

      if (storeResult === 'MULTIPLE') {
        logger.warn(`Multiple stores match branch: ${branchName} (feedback ${feedbackRaw.id})`);
        this.skippedRecords.push({
          feedbackRawId: feedbackRaw.id,
          externalFeedbackId: feedbackRaw.externalFeedbackId,
          channelId: feedbackRaw.channelId,
          branchName,
          skipReason: 'MULTIPLE_STORE_MATCH',
          timestamp: new Date(),
        });
        await feedbackRaw.update(
          { processingStatus: ProcessingStatus.SKIPPED },
          { transaction }
        );
        await transaction.commit();
        return 'SKIPPED';
      }

      const store = storeResult;

      const reviewer = payload.reviewer || {};
      const externalCustomerId = reviewer.user_id || feedbackRaw.externalFeedbackId;
      const fullName = reviewer.name || null;
      const customerType = reviewer.type || null;

      const customer = await this.resolveOrCreateCustomerFamepilot(
        feedbackRaw.channelId,
        externalCustomerId,
        fullName,
        null,
        null,
        customerType
      );

      const feedbackTimestamp = feedbackRaw.feedbackTimestamp;
      const visitDate = new Date(feedbackTimestamp);
      visitDate.setHours(0, 0, 0, 0);

      const overallRating = this.extractFromPayload(payload, 'rating', 'overall_rating');
      const sentiment = overallRating
        ? this.deriveSentiment(Number(overallRating))
        : Sentiment.NEUTRAL;

      const menuTags = payload.menu_tags || [];
      const hasFoodOrder = Array.isArray(menuTags) && menuTags.length > 0;

      const customerVisit = await CustomerVisit.create(
        {
          customerId: customer.id,
          storeId: store.id,
          channelId: feedbackRaw.channelId,
          feedbackRawId: feedbackRaw.id,
          feedbackDate: feedbackTimestamp,
          visitDate,
          visitDay: this.getDayName(visitDate),
          visitWeek: this.getWeekNumber(visitDate),
          visitMonth: visitDate.getMonth() + 1,
          visitQuarter: this.getQuarter(visitDate.getMonth() + 1),
          visitYear: visitDate.getFullYear(),
          sentiment,
          hasFoodOrder,
          hasBeverageOrder: false,
        },
        { transaction }
      );

      await Rating.create(
        {
          customerVisitId: customerVisit.id,
          overallRating: overallRating ? Number(overallRating) : 0,
          foodRating: null,
          beverageRating: null,
        },
        { transaction }
      );

      const reviewText = this.extractFromPayload(payload, 'review_text', 'review', 'text');
      const menuTagsString = Array.isArray(menuTags) ? menuTags.join(', ') : null;

      const feedback = await Feedback.create(
        {
          customerVisitId: customerVisit.id,
          foodOrdered: menuTagsString,
          commentsOnFood: null,
          beveragesOrdered: null,
          commentsOnBeverage: null,
          overallComments: reviewText,
          feedbackStatus: FeedbackStatus.PENDING,
        },
        { transaction }
      );

      const reply = payload.reply;
      if (reply && reply.text) {
        const respondedAt = reply.posted_at ? new Date(reply.posted_at) : new Date();

        await FeedbackResponse.create(
          {
            feedbackId: feedback.id,
            respondedBy: null,
            responseText: reply.text,
            responseDate: respondedAt,
          },
          { transaction }
        );
      }

      await feedbackRaw.update(
        {
          processingStatus: ProcessingStatus.PROCESSED,
        },
        { transaction }
      );

      await transaction.commit();

      logger.info(`Successfully processed Famepilot feedback_raw ${feedbackRaw.id}`);
      return 'PROCESSED';
    } catch (error: any) {
      await transaction.rollback();
      logger.error(`Error processing Famepilot feedback_raw ${feedbackRaw.id}:`, error);
      throw error;
    }
  }

  async processFamepilotFeedbackRaw(
    startDate: string,
    endDate: string,
    batchSize: number = 100
  ): Promise<ProcessingResult> {
    this.initializeLogFile(startDate, endDate);

    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    logger.info(
      `Starting Famepilot processing: ${startDate} to ${endDate}, batch size: ${batchSize}`
    );

    let processed = 0;
    let skipped = 0;
    let offset = 0;

    while (true) {
      const feedbackBatch = await FeedbackRaw.findAll({
        where: {
          channelId: {
            [Op.in]: FAMEPILOT_CHANNELS,
          },
          processingStatus: ProcessingStatus.NEW,
          createdAt: {
            [Op.between]: [startDateTime, endDateTime],
          },
        },
        order: [['createdAt', 'ASC']],
        limit: batchSize,
        offset,
      });

      if (feedbackBatch.length === 0) {
        break;
      }

      for (const feedbackRaw of feedbackBatch) {
        try {
          const result = await this.processSingleFamepilotFeedback(feedbackRaw);
          if (result === 'PROCESSED') {
            processed++;
          } else {
            skipped++;
          }
        } catch (error: any) {
          logger.error(`Failed to process feedback ${feedbackRaw.id}:`, error.message);
          skipped++;

          await feedbackRaw.update({
            processingStatus: ProcessingStatus.FAILED,
          });
        }
      }

      offset += batchSize;

      if (feedbackBatch.length < batchSize) {
        break;
      }
    }

    this.writeLogFile();

    logger.info(
      `Famepilot processing completed: ${processed} processed, ${skipped} skipped, log: ${this.logFileName}`
    );

    return {
      processed,
      skipped,
      logFile: this.logFileName,
    };
  }
}

export default new FamepilotProcessService();
