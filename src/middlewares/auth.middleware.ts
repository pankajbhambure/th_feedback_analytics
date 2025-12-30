import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { errorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      errorResponse(res, 'Access token required', 401);
      return;
    }

    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) {
        errorResponse(res, 'Invalid or expired token', 403);
        return;
      }

      req.user = decoded as { id: string; email: string };
      next();
    });
  } catch (error) {
    errorResponse(res, 'Authentication failed', 401);
  }
};
