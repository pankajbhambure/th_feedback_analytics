/**
 * Auth Service
 * Business logic for authentication operations including registration, login, OTP handling, and password reset
 */

import bcrypt from 'bcrypt';
import { User, Role, Otp, UserRole } from '../../models';
import { RoleName } from '../../models/role.model';
import { OtpPurpose } from '../../models/otp.model';
import { UserStatus } from '../../models/user.model';
import { generateToken } from '../../utils/jwt';
import { generateOtp, getOtpExpiry, isOtpExpired } from '../../utils/otp';
import {
  RegisterInput,
  LoginInput,
  LoginOtpInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.validator';

const SALT_ROUNDS = 10;

/**
 * Registers a new user with email and optional password
 * If password is provided, creates account immediately
 * If password is not provided, creates user and sends OTP for verification
 */
export const register = async (data: RegisterInput) => {
  const { email, password } = data;

  const existingUser = await User.findOne({ where: { email } });

  if (password) {
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      email,
      passwordHash,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
    });

    const userRole = await Role.findOne({ where: { name: RoleName.USER } });
    if (userRole) {
      await UserRole.create({
        userId: user.id,
        roleId: userRole.id,
      });
    }

    return {
      message: 'Registration successful',
    };
  } else {
    let user = existingUser;

    if (!user) {
      user = await User.create({
        email,
        passwordHash: null,
        isEmailVerified: false,
        status: UserStatus.ACTIVE,
      });

      const userRole = await Role.findOne({ where: { name: RoleName.USER } });
      if (userRole) {
        await UserRole.create({
          userId: user.id,
          roleId: userRole.id,
        });
      }
    }

    await Otp.update(
      { isUsed: true },
      {
        where: {
          userId: user.id,
          purpose: OtpPurpose.REGISTER,
          isUsed: false,
        },
      }
    );

    const otpCode = generateOtp();
    await Otp.create({
      userId: user.id,
      code: otpCode,
      purpose: OtpPurpose.REGISTER,
      expiresAt: getOtpExpiry(),
      createdAt: new Date(),
    });

    return {
      message: 'OTP sent to your email',
    };
  }
};

/**
 * Authenticates user with email and password
 * Issues JWT token on successful authentication
 */
export const login = async (data: LoginInput) => {
  const { email, password } = data;

  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: 'roles',
        through: { attributes: [] },
      },
    ],
  });

  if (!user || !user.passwordHash) {
    throw new Error('Invalid credentials');
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new Error('Account has been blocked');
  }

  if (user.status === UserStatus.INACTIVE) {
    throw new Error('Account is inactive');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      roles: (user as any).roles.map((role: any) => role.name),
    },
    token,
  };
};

/**
 * Initiates OTP-based login flow
 * Generates and stores OTP for the user
 */
export const loginWithOtp = async (data: LoginOtpInput) => {
  const { email } = data;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return {
      message: 'If the email exists, an OTP has been sent',
    };
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new Error('Account has been blocked');
  }

  await Otp.update(
    { isUsed: true },
    {
      where: {
        userId: user.id,
        purpose: OtpPurpose.LOGIN,
        isUsed: false,
      },
    }
  );

  const otpCode = generateOtp();
  await Otp.create({
    userId: user.id,
    code: otpCode,
    purpose: OtpPurpose.LOGIN,
    expiresAt: getOtpExpiry(),
    createdAt: new Date(),
  });

  return {
    message: 'If the email exists, an OTP has been sent',
  };
};

/**
 * Verifies OTP and completes authentication
 * Issues JWT token on successful verification
 */
export const verifyOtp = async (data: VerifyOtpInput) => {
  const { email, otp, purpose } = data;

  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: 'roles',
        through: { attributes: [] },
      },
    ],
  });

  if (!user) {
    throw new Error('Invalid OTP');
  }

  const otpRecord = await Otp.findOne({
    where: {
      userId: user.id,
      code: otp,
      purpose,
      isUsed: false,
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otpRecord) {
    throw new Error('Invalid OTP');
  }

  if (isOtpExpired(otpRecord.expiresAt)) {
    throw new Error('OTP has expired');
  }

  await otpRecord.update({ isUsed: true });

  if (!user.isEmailVerified) {
    await user.update({ isEmailVerified: true });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      roles: (user as any).roles.map((role: any) => role.name),
    },
    token,
  };
};

/**
 * Initiates password reset flow
 * Generates and stores OTP for password reset
 */
export const forgotPassword = async (data: ForgotPasswordInput) => {
  const { email } = data;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return {
      message: 'If the email exists, a password reset OTP has been sent',
    };
  }

  await Otp.update(
    { isUsed: true },
    {
      where: {
        userId: user.id,
        purpose: OtpPurpose.RESET_PASSWORD,
        isUsed: false,
      },
    }
  );

  const otpCode = generateOtp();
  await Otp.create({
    userId: user.id,
    code: otpCode,
    purpose: OtpPurpose.RESET_PASSWORD,
    expiresAt: getOtpExpiry(),
    createdAt: new Date(),
  });

  return {
    message: 'If the email exists, a password reset OTP has been sent',
  };
};

/**
 * Completes password reset flow
 * Validates OTP and updates user password
 */
export const resetPassword = async (data: ResetPasswordInput) => {
  const { email, otp, newPassword } = data;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Invalid request');
  }

  const otpRecord = await Otp.findOne({
    where: {
      userId: user.id,
      code: otp,
      purpose: OtpPurpose.RESET_PASSWORD,
      isUsed: false,
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otpRecord) {
    throw new Error('Invalid OTP');
  }

  if (isOtpExpired(otpRecord.expiresAt)) {
    throw new Error('OTP has expired');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await user.update({ passwordHash });

  await otpRecord.update({ isUsed: true });

  return {
    message: 'Password reset successful',
  };
};
