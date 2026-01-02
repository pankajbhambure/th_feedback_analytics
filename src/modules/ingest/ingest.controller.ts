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
}

export default new IngestController();
