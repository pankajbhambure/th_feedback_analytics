import { Router } from 'express';
import analyticsController from './analytics.controller';
import { validate } from '../../middlewares/validate.middleware';
import { kpiRequestSchema } from './analytics.validator';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/kpis', authenticateToken, validate(kpiRequestSchema), analyticsController.getKPIs);

export default router;
