import { v4 as uuidv4 } from 'uuid';
import FeedbackRaw, { ProcessingStatus } from '../../models/feedbackRaw.model';
import Store from '../../models/store.model';
import Customer from '../../models/customer.model';
import CustomerVisit, { Sentiment } from '../../models/customerVisit.model';
import Rating from '../../models/rating.model';
import Feedback, { FeedbackStatus } from '../../models/feedback.model';
import { sequelize } from '../../config/sequelize';
import { logger } from '../../utils/logger';

interface ProcessingResult {
  processed: number;
  skipped: number;
}

interface ProcessingError {
  feedbackRawId: string;
  error: string;
}

export class ProcessService {
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

  private async resolveStore(storeIdentifier: string): Promise<Store | null> {
    let store = await Store.findOne({
      where: { storeId: storeIdentifier },
    });

    if (!store) {
      store = await Store.findOne({
        where: { storeCode: storeIdentifier },
      });
    }

    if (!store) {
      store = await Store.findOne({
        where: { storeLocation: storeIdentifier },
      });
    }

    return store;
  }

  private async resolveOrCreateCustomer(
    email: string | null,
    phone: string | null,
    fullName: string | null
  ): Promise<Customer> {
    if (email) {
      const existingCustomer = await Customer.findOne({
        where: { email },
      });

      if (existingCustomer) {
        return existingCustomer;
      }
    }

    if (phone) {
      const existingCustomer = await Customer.findOne({
        where: { phone },
      });

      if (existingCustomer) {
        return existingCustomer;
      }
    }

    const customerId = email || phone || `anon_${uuidv4()}`;

    const newCustomer = await Customer.create({
      customerId,
      fullName,
      email,
      phone,
      repeatCustomer: false,
    });

    return newCustomer;
  }

  private async processSingleFeedback(feedbackRaw: FeedbackRaw): Promise<boolean> {
    const transaction = await sequelize.transaction();

    try {
      const payload = feedbackRaw.rawPayload;

      const storeIdentifier = this.extractFromPayload(
        payload,
        'store_id',
        'storeId',
        'store_code',
        'storeCode',
        'store_location',
        'storeLocation',
        'location'
      );

      if (!storeIdentifier) {
        logger.error(`No store identifier found in feedback ${feedbackRaw.id}`);
        await transaction.rollback();
        return false;
      }

      const store = await this.resolveStore(storeIdentifier);

      if (!store) {
        logger.error(
          `Store not found for identifier: ${storeIdentifier} (feedback ${feedbackRaw.id})`
        );
        await transaction.rollback();
        return false;
      }

      const email = this.extractFromPayload(payload, 'email', 'customer_email', 'customerEmail');
      const phone = this.extractFromPayload(payload, 'phone', 'mobile', 'customer_phone', 'customerPhone');
      const fullName = this.extractFromPayload(payload, 'name', 'customer_name', 'customerName', 'full_name', 'fullName');

      if (!email && !phone) {
        logger.warn(`No email or phone found in feedback ${feedbackRaw.id}, creating anonymous customer`);
      }

      const customer = await this.resolveOrCreateCustomer(email, phone, fullName);

      const existingVisit = await CustomerVisit.findOne({
        where: { feedbackRawId: feedbackRaw.id },
        transaction,
      });

      if (existingVisit) {
        logger.debug(`Customer visit already exists for feedback_raw ${feedbackRaw.id}, skipping`);
        await transaction.rollback();
        return false;
      }

      const feedbackTimestamp = feedbackRaw.feedbackTimestamp;
      const visitDate = new Date(feedbackTimestamp);
      visitDate.setHours(0, 0, 0, 0);

      const overallRating = this.extractFromPayload(
        payload,
        'overall_rating',
        'overallRating',
        'rating',
        'overall_score',
        'overallScore'
      );

      const sentiment = overallRating
        ? this.deriveSentiment(Number(overallRating))
        : Sentiment.NEUTRAL;

      const foodOrdered = this.extractFromPayload(
        payload,
        'food_ordered',
        'foodOrdered',
        'food_items',
        'foodItems'
      );
      const beveragesOrdered = this.extractFromPayload(
        payload,
        'beverages_ordered',
        'beveragesOrdered',
        'beverage_items',
        'beverageItems'
      );

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
          hasFoodOrder: !!foodOrdered,
          hasBeverageOrder: !!beveragesOrdered,
        },
        { transaction }
      );

      const foodRating = this.extractFromPayload(
        payload,
        'food_rating',
        'foodRating',
        'food_score',
        'foodScore'
      );
      const beverageRating = this.extractFromPayload(
        payload,
        'beverage_rating',
        'beverageRating',
        'beverage_score',
        'beverageScore'
      );

      await Rating.create(
        {
          customerVisitId: customerVisit.id,
          overallRating: overallRating ? Number(overallRating) : 0,
          foodRating: foodRating ? Number(foodRating) : null,
          beverageRating: beverageRating ? Number(beverageRating) : null,
        },
        { transaction }
      );

      const commentsOnFood = this.extractFromPayload(
        payload,
        'comments_on_food',
        'commentsOnFood',
        'food_comments',
        'foodComments',
        'food_feedback',
        'foodFeedback'
      );
      const commentsOnBeverage = this.extractFromPayload(
        payload,
        'comments_on_beverage',
        'commentsOnBeverage',
        'beverage_comments',
        'beverageComments',
        'beverage_feedback',
        'beverageFeedback'
      );
      const overallComments = this.extractFromPayload(
        payload,
        'overall_comments',
        'overallComments',
        'comments',
        'feedback',
        'remarks',
        'overall_feedback',
        'overallFeedback'
      );

      await Feedback.create(
        {
          customerVisitId: customerVisit.id,
          foodOrdered,
          commentsOnFood,
          beveragesOrdered,
          commentsOnBeverage,
          overallComments,
          feedbackStatus: FeedbackStatus.PENDING,
        },
        { transaction }
      );

      await feedbackRaw.update(
        {
          processingStatus: ProcessingStatus.PROCESSED,
        },
        { transaction }
      );

      await transaction.commit();

      logger.info(`Successfully processed feedback_raw ${feedbackRaw.id}`);
      return true;
    } catch (error: any) {
      await transaction.rollback();
      logger.error(`Error processing feedback_raw ${feedbackRaw.id}:`, error);
      throw error;
    }
  }

  async processBatch(batchSize: number = 100): Promise<ProcessingResult> {
    const unprocessedFeedbacks = await FeedbackRaw.findAll({
      where: {
        channelId: 'instore',
        processingStatus: ProcessingStatus.NEW,
      },
      order: [['createdAt', 'ASC']],
      limit: batchSize,
    });

    if (unprocessedFeedbacks.length === 0) {
      logger.info('No unprocessed feedbacks found');
      return { processed: 0, skipped: 0 };
    }

    logger.info(`Processing ${unprocessedFeedbacks.length} feedback records`);

    let processed = 0;
    let skipped = 0;
    const errors: ProcessingError[] = [];

    for (const feedbackRaw of unprocessedFeedbacks) {
      try {
        const success = await this.processSingleFeedback(feedbackRaw);
        if (success) {
          processed++;
        } else {
          skipped++;
        }
      } catch (error: any) {
        logger.error(`Failed to process feedback ${feedbackRaw.id}:`, error.message);
        skipped++;
        errors.push({
          feedbackRawId: feedbackRaw.id,
          error: error.message,
        });

        await feedbackRaw.update({
          processingStatus: ProcessingStatus.FAILED,
        });
      }
    }

    logger.info(`Batch processing completed: ${processed} processed, ${skipped} skipped`);

    if (errors.length > 0) {
      logger.warn(`Encountered ${errors.length} errors during processing`);
    }

    return { processed, skipped };
  }
}

export default new ProcessService();
