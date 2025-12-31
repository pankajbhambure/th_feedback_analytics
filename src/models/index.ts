import User from './user.model';
import Role from './role.model';
import UserRole from './userRole.model';
import Otp from './otp.model';
import Channel from './channel.model';
import FeedbackRaw from './feedbackRaw.model';

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

Channel.hasMany(FeedbackRaw, {
  foreignKey: 'channelId',
  sourceKey: 'channelId',
  as: 'feedbackRaw',
});

FeedbackRaw.belongsTo(Channel, {
  foreignKey: 'channelId',
  targetKey: 'channelId',
  as: 'channel',
});

export { User, Role, UserRole, Otp, Channel, FeedbackRaw };
