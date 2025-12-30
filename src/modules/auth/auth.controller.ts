/**
 * Auth Controller
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { successResponse } from '../../utils/response';
import {
  RegisterInput,
  LoginInput,
  LoginOtpInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.validator';

/**
 * POST /api/v1/auth/register
 * Registers a new user with email and optional password
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: RegisterInput = req.body;
    const result = await authService.register(data);
    successResponse(res, result, result.message, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticates user with email and password
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data: LoginInput = req.body;
    const result = await authService.login(data);
    successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login-otp
 * Initiates OTP-based login
 */
export const loginWithOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: LoginOtpInput = req.body;
    const result = await authService.loginWithOtp(data);
    successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/verify-otp
 * Verifies OTP and completes authentication
 */
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: VerifyOtpInput = req.body;
    const result = await authService.verifyOtp(data);
    successResponse(res, result, 'OTP verified successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 * Initiates password reset flow
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: ForgotPasswordInput = req.body;
    const result = await authService.forgotPassword(data);
    successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/reset-password
 * Completes password reset flow
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: ResetPasswordInput = req.body;
    const result = await authService.resetPassword(data);
    successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
