import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export enum ProcessingStatus {
  NEW = 'NEW',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export interface FeedbackRawAttributes {
  id: string;
  channelId: string;
  externalFeedbackId: string;
  feedbackTimestamp: Date;
  rawPayload: Record<string, any>;
  ingestedAt: Date;
  sourceHash: string;
  processingStatus: ProcessingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackRawCreationAttributes
  extends Optional<
    FeedbackRawAttributes,
    'id' | 'ingestedAt' | 'processingStatus' | 'createdAt' | 'updatedAt'
  > {}

class FeedbackRaw
  extends Model<FeedbackRawAttributes, FeedbackRawCreationAttributes>
  implements FeedbackRawAttributes
{
  public id!: string;
  public channelId!: string;
  public externalFeedbackId!: string;
  public feedbackTimestamp!: Date;
  public rawPayload!: Record<string, any>;
  public ingestedAt!: Date;
  public sourceHash!: string;
  public processingStatus!: ProcessingStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FeedbackRaw.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    channelId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'channels',
        key: 'channelId',
      },
    },
    externalFeedbackId: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    feedbackTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    rawPayload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    ingestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    sourceHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    processingStatus: {
      type: DataTypes.ENUM(...Object.values(ProcessingStatus)),
      defaultValue: ProcessingStatus.NEW,
      allowNull: false,
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
    tableName: 'feedback_raw',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['channelId', 'externalFeedbackId'],
      },
      {
        fields: ['processingStatus'],
      },
      {
        fields: ['feedbackTimestamp'],
      },
    ],
  }
);

export default FeedbackRaw;
