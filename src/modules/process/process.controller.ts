import { Request, Response, NextFunction } from 'express';
import processService from './process.service';
import { successResponse } from '../../utils/response';
import { logger } from '../../utils/logger';

export class ProcessController {
  async processFeedbackRaw(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchSize = 100 } = req.body;

      logger.info(`Starting background processing with batch size: ${batchSize}`);

      processService.processAllInBackground(batchSize).catch((error) => {
        logger.error('Background processing failed:', error);
      });

      successResponse(res, { message: 'Processing started in background' }, 'Background processing initiated');
    } catch (error) {
      next(error);
    }
  }
}

export default new ProcessController();
