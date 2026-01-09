import { Request, Response, NextFunction } from 'express';
import analyticsService from './analytics.service';
import { successResponse } from '../../utils/response';
import { logger } from '../../utils/logger';

export class AnalyticsController {
  async getKPIs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, storeId } = req.body;

      logger.info(`Fetching KPIs from ${startDate} to ${endDate}${storeId ? ` for store ${storeId}` : ''}`);

      const kpis = await analyticsService.getKPIs({
        startDate,
        endDate,
        storeId,
      });

      successResponse(res, kpis, 'KPIs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();
