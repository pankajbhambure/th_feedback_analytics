import { Request, Response, NextFunction } from 'express';
import processService from './process.service';
import { successResponse } from '../../utils/response';
import { logger } from '../../utils/logger';

export class ProcessController {
  async processFeedbackRaw(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchSize = 100 } = req.body;

      logger.info(`Processing feedback_raw batch with size: ${batchSize}`);

      const result = await processService.processBatch(batchSize);

      successResponse(res, result, 'Batch processed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ProcessController();
