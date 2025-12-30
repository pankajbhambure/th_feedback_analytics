import User from './user.model';
import Role from './role.model';
import UserRole from './userRole.model';
import Otp from './otp.model';

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'userId',
  otherKey: 'roleId',
  as: 'roles',
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'roleId',
  otherKey: 'userId',
  as: 'users',
});

User.hasMany(Otp, {
  foreignKey: 'userId',
  as: 'otps',
});

Otp.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export { User, Role, UserRole, Otp };
