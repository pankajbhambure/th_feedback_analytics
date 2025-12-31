import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export enum FeedbackStatus {
  PENDING = 'Pending',
  RESPONDED = 'Responded',
}

export interface FeedbackAttributes {
  id: string;
  customerVisitId: string;
  foodOrdered: string | null;
  commentsOnFood: string | null;
  beveragesOrdered: string | null;
  commentsOnBeverage: string | null;
  overallComments: string | null;
  feedbackStatus: FeedbackStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackCreationAttributes
  extends Optional<
    FeedbackAttributes,
    | 'id'
    | 'foodOrdered'
    | 'commentsOnFood'
    | 'beveragesOrdered'
    | 'commentsOnBeverage'
    | 'overallComments'
    | 'feedbackStatus'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
  public id!: string;
  public customerVisitId!: string;
  public foodOrdered!: string | null;
  public commentsOnFood!: string | null;
  public beveragesOrdered!: string | null;
  public commentsOnBeverage!: string | null;
  public overallComments!: string | null;
  public feedbackStatus!: FeedbackStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Feedback.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerVisitId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    foodOrdered: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    commentsOnFood: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    beveragesOrdered: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    commentsOnBeverage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    overallComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feedbackStatus: {
      type: DataTypes.ENUM(...Object.values(FeedbackStatus)),
      allowNull: false,
      defaultValue: FeedbackStatus.PENDING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'feedbacks',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['customerVisitId'],
      },
      {
        fields: ['feedbackStatus'],
      },
    ],
  }
);

export default Feedback;
