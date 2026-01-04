import { Router } from 'express';
import ingestController from './ingest.controller';
import { validate } from '../../middlewares/validate.middleware';
import { ingestInstoreSchema, ingestFamepilotSchema } from './ingest.validator';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/instore',
  authenticateToken,
  validate(ingestInstoreSchema),
  ingestController.ingestInstore.bind(ingestController)
);

router.post(
  '/famepilot',
  authenticateToken,
  validate(ingestFamepilotSchema),
  ingestController.ingestFamepilot.bind(ingestController)
);

export default router;
