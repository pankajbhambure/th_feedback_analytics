import { Request, Response, NextFunction } from 'express';
import ingestService from './ingest.service';
import { successResponse } from '../../utils/response';
import { logger } from '../../utils/logger';

export class IngestController {
  async ingestInstore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fromDate, toDate } = req.body;

      logger.info(`Starting Instore ingestion from ${fromDate} to ${toDate}`);

      const result = await ingestService.ingestInstoreFeedback(fromDate, toDate);

      successResponse(res, {
        message: 'Ingestion completed',
        inserted: result.inserted,
        skipped: result.skipped,
      });
    } catch (error) {
      next(error);
    }
  }

  async ingestFamepilot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.body;

      logger.info(`Starting Famepilot ingestion from ${startDate} to ${endDate}`);

      const result = await ingestService.ingestFamepilotFeedback(startDate, endDate);

      successResponse(res, {
        message: 'Famepilot ingestion completed',
        totalFetched: result.totalFetched,
        inserted: result.inserted,
        skipped: result.skipped,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new IngestController();
