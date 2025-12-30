/**
 * User Controller
 * Handles HTTP requests for user endpoints
 */

import { Response, NextFunction } from 'express';
import * as userService from './user.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

/**
 * GET /api/v1/users/me
 * Retrieves authenticated user's profile
 */
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await userService.getUserProfile(userId);
    successResponse(res, user, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};
