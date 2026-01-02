import { Router } from 'express';
import processController from './process.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { processFeedbackRawSchema } from './process.validator';

const router = Router();

router.post(
  '/feedback-raw/instore',
  authenticateToken,
  validate(processFeedbackRawSchema),
  processController.processFeedbackRaw
);

export default router;
