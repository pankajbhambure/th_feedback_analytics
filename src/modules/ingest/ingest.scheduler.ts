import ingestService from './ingest.service';
import { logger } from '../../utils/logger';

export async function runDailyInstoreIngestion(): Promise<void> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = yesterday.toISOString().split('T')[0];

    logger.info(`Starting scheduled Instore ingestion for ${dateStr}`);

    const result = await ingestService.ingestInstoreFeedback(dateStr, dateStr);

    logger.info(
      `Scheduled ingestion completed: ${result.inserted} inserted, ${result.skipped} skipped`
    );
  } catch (error) {
    logger.error('Scheduled ingestion failed:', error);
    throw error;
  }
}
