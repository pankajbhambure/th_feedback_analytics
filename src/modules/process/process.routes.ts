import { Router } from 'express';
import processController from './process.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { processFeedbackRawSchema, processFamepilotFeedbackRawSchema } from './process.validator';

const router = Router();

router.post(
  '/feedback-raw/instore',
  authenticateToken,
  validate(processFeedbackRawSchema),
  processController.processFeedbackRaw
);

router.post(
  '/feedback-raw/famepilot',
  authenticateToken,
  validate(processFamepilotFeedbackRawSchema),
  processController.processFamepilotFeedbackRaw
);

router.get(
  '/feedback-raw/debug',
  authenticateToken,
  processController.debugFeedbackRaw
);

export default router;
