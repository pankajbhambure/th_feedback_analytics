import { sequelize } from '../../config/sequelize';
import StoreFeedbackDailyAgg from '../../models/storeFeedbackDailyAgg.model';
import { logger } from '../../utils/logger';

interface DailyAggregateResult {
  daysProcessed: number;
  errors: Array<{ date: string; error: string }>;
}

interface AggregationRow {
  store_id: string;
  channel_id: string;
  visit_date: string;
  city: string;
  region_id: string;
  total_visits: number;
  unique_customer_count: number;
  repeat_customer_count: number;
  avg_overall_rating: number | null;
  avg_food_rating: number | null;
  avg_beverage_rating: number | null;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  pending_count: number;
  responded_count: number;
}

export class AggregateService {
  private async aggregateForDate(date: Date): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];

    logger.info(`Aggregating data for date: ${dateStr}`);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
      SELECT
        cv.store_id,
        cv.channel_id,
        DATE(cv.visit_date) as visit_date,
        s.city,
        s.region_id,
        COUNT(cv.id) as total_visits,
        COUNT(DISTINCT cv.customer_id) as unique_customer_count,
        COUNT(DISTINCT CASE WHEN c.repeat_customer = true THEN cv.customer_id END) as repeat_customer_count,
        AVG(r.overall_rating) as avg_overall_rating,
        AVG(r.food_rating) as avg_food_rating,
        AVG(r.beverage_rating) as avg_beverage_rating,
        COUNT(CASE WHEN cv.sentiment = 'Positive' THEN 1 END) as positive_count,
        COUNT(CASE WHEN cv.sentiment = 'Neutral' THEN 1 END) as neutral_count,
        COUNT(CASE WHEN cv.sentiment = 'Negative' THEN 1 END) as negative_count,
        COUNT(CASE WHEN f.feedback_status = 'Pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN f.feedback_status = 'Responded' THEN 1 END) as responded_count
      FROM customer_visits cv
      INNER JOIN stores s ON cv.store_id = s.id
      INNER JOIN customers c ON cv.customer_id = c.id
      LEFT JOIN ratings r ON cv.id = r.customer_visit_id
      LEFT JOIN feedbacks f ON cv.id = f.customer_visit_id
      WHERE cv.visit_date >= :startOfDay
        AND cv.visit_date <= :endOfDay
      GROUP BY cv.store_id, cv.channel_id, DATE(cv.visit_date), s.city, s.region_id
    `;

    const results = (await sequelize.query(query, {
      replacements: { startOfDay, endOfDay },
      type: 'SELECT',
    })) as AggregationRow[];

    if (results.length === 0) {
      logger.info(`No data found for date: ${dateStr}`);
      return;
    }

    logger.info(`Found ${results.length} aggregate rows for date: ${dateStr}`);

    for (const row of results) {
      await StoreFeedbackDailyAgg.upsert({
        store_id: row.store_id,
        channel_id: row.channel_id,
        agg_date: new Date(row.visit_date),
        city: row.city,
        region_id: row.region_id,
        total_feedback_count: Number(row.total_visits),
        unique_customer_count: Number(row.unique_customer_count),
        repeat_customer_count: Number(row.repeat_customer_count),
        avg_overall_rating: row.avg_overall_rating ? Number(row.avg_overall_rating) : null,
        avg_food_rating: row.avg_food_rating ? Number(row.avg_food_rating) : null,
        avg_beverage_rating: row.avg_beverage_rating ? Number(row.avg_beverage_rating) : null,
        positive_count: Number(row.positive_count),
        neutral_count: Number(row.neutral_count),
        negative_count: Number(row.negative_count),
        pending_count: Number(row.pending_count),
        responded_count: Number(row.responded_count),
      });
    }

    logger.info(`Successfully aggregated ${results.length} rows for date: ${dateStr}`);
  }

  async aggregateDateRange(fromDate: string, toDate: string): Promise<DailyAggregateResult> {
    const start = new Date(fromDate);
    const end = new Date(toDate);

    logger.info(`Starting daily aggregation from ${fromDate} to ${toDate}`);

    let daysProcessed = 0;
    const errors: Array<{ date: string; error: string }> = [];

    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];

      try {
        await this.aggregateForDate(new Date(currentDate));
        daysProcessed++;
      } catch (error: any) {
        logger.error(`Failed to aggregate date ${dateStr}:`, error.message);
        errors.push({
          date: dateStr,
          error: error.message,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    logger.info(
      `Daily aggregation completed: ${daysProcessed} days processed, ${errors.length} errors`
    );

    if (errors.length > 0) {
      logger.warn(`Errors encountered during aggregation:`, errors);
    }

    return { daysProcessed, errors };
  }
}

export default new AggregateService();
