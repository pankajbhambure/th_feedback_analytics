/**
 * User Service
 * Business logic for user-related operations
 */

import { User, Role } from '../../models';

/**
 * Retrieves user profile by user ID
 * Includes associated roles
 */
export const getUserProfile = async (userId: string) => {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Role,
        as: 'roles',
        through: { attributes: [] },
      },
    ],
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
    roles: (user as any).roles.map((role: any) => role.name),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
