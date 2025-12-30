/**
 * Auth Routes
 * Defines authentication-related endpoints
 */

import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  registerSchema,
  loginSchema,
  loginOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);

router.post('/login-otp', validate(loginOtpSchema), authController.loginWithOtp);

router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);

router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
