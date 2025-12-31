import User from './user.model';
import Role from './role.model';
import UserRole from './userRole.model';
import Otp from './otp.model';
import Channel from './channel.model';
import FeedbackRaw from './feedbackRaw.model';
import Customer from './customer.model';
import Region from './region.model';
import Store from './store.model';
import CustomerVisit from './customerVisit.model';
import Rating from './rating.model';
import Feedback from './feedback.model';
import FeedbackResponse from './feedbackResponse.model';

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

Region.hasMany(Store, {
  foreignKey: 'regionId',
  as: 'stores',
});

Store.belongsTo(Region, {
  foreignKey: 'regionId',
  as: 'region',
});

Customer.hasMany(CustomerVisit, {
  foreignKey: 'customerId',
  as: 'visits',
});

CustomerVisit.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer',
});

Store.hasMany(CustomerVisit, {
  foreignKey: 'storeId',
  as: 'visits',
});

CustomerVisit.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store',
});

CustomerVisit.hasOne(Rating, {
  foreignKey: 'customerVisitId',
  as: 'rating',
});

Rating.belongsTo(CustomerVisit, {
  foreignKey: 'customerVisitId',
  as: 'visit',
});

CustomerVisit.hasOne(Feedback, {
  foreignKey: 'customerVisitId',
  as: 'feedback',
});

Feedback.belongsTo(CustomerVisit, {
  foreignKey: 'customerVisitId',
  as: 'visit',
});

Feedback.hasMany(FeedbackResponse, {
  foreignKey: 'feedbackId',
  as: 'responses',
});

FeedbackResponse.belongsTo(Feedback, {
  foreignKey: 'feedbackId',
  as: 'feedback',
});

export {
  User,
  Role,
  UserRole,
  Otp,
  Channel,
  FeedbackRaw,
  Customer,
  Region,
  Store,
  CustomerVisit,
  Rating,
  Feedback,
  FeedbackResponse,
};
