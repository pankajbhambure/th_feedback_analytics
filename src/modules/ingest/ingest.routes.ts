import { Router } from 'express';
import ingestController from './ingest.controller';
import { validate } from '../../middlewares/validate.middleware';
import { ingestInstoreSchema } from './ingest.validator';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/instore',
  authenticateToken,
  validate(ingestInstoreSchema),
  ingestController.ingestInstore.bind(ingestController)
);

export default router;
