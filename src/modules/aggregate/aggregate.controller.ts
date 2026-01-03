import { Request, Response, NextFunction } from 'express';
import aggregateService from './aggregate.service';
import { successResponse } from '../../utils/response';
import { logger } from '../../utils/logger';

export class AggregateController {
  async aggregateDaily(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fromDate, toDate } = req.body;

      logger.info(`Processing daily aggregation from ${fromDate} to ${toDate}`);

      const result = await aggregateService.aggregateDateRange(fromDate, toDate);

      const responseData = {
        message: 'Daily aggregation completed',
        daysProcessed: result.daysProcessed,
      };

      if (result.errors.length > 0) {
        logger.warn(`Aggregation completed with ${result.errors.length} errors`);
        successResponse(
          res,
          { ...responseData, errors: result.errors },
          'Daily aggregation completed with errors'
        );
      } else {
        successResponse(res, responseData, 'Daily aggregation completed successfully');
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new AggregateController();
