import { Router } from 'express';
import aggregateController from './aggregate.controller';
import { validate } from '../../middlewares/validate.middleware';
import { dailyAggregateSchema } from './aggregate.validator';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/daily', authenticateToken, validate(dailyAggregateSchema), aggregateController.aggregateDaily);

export default router;
