/**
 * User Routes
 * Defines user-related endpoints
 */

import { Router } from 'express';
import * as userController from './user.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/me', authenticateToken, userController.getMe);

export default router;
