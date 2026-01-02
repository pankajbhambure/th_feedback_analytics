import { Router, Request, Response } from 'express';
import { successResponse } from './utils/response';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import ingestRoutes from './modules/ingest/ingest.routes';
import processRoutes from './modules/process/process.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  successResponse(res, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 'Service is healthy');
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ingest', ingestRoutes);
router.use('/process', processRoutes);

export default router;
