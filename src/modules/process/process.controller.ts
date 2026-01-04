import { Request, Response, NextFunction } from 'express';
import processService from './process.service';
import famepilotProcessService from './famepilot.service';
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

  async processFamepilotFeedbackRaw(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, batchSize = 100 } = req.body;

      logger.info(
        `Starting Famepilot processing: ${startDate} to ${endDate}, batch size: ${batchSize}`
      );

      const result = await famepilotProcessService.processFamepilotFeedbackRaw(
        startDate,
        endDate,
        batchSize
      );

      successResponse(
        res,
        {
          message: 'Famepilot processing completed',
          processed: result.processed,
          skipped: result.skipped,
          logFile: result.logFile,
        },
        'Famepilot processing completed'
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new ProcessController();
