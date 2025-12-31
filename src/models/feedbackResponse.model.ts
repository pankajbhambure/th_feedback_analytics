import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface FeedbackResponseAttributes {
  id: string;
  feedbackId: string;
  respondedBy: string | null;
  responseText: string;
  responseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackResponseCreationAttributes
  extends Optional<FeedbackResponseAttributes, 'id' | 'respondedBy' | 'createdAt' | 'updatedAt'> {}

class FeedbackResponse
  extends Model<FeedbackResponseAttributes, FeedbackResponseCreationAttributes>
  implements FeedbackResponseAttributes
{
  public id!: string;
  public feedbackId!: string;
  public respondedBy!: string | null;
  public responseText!: string;
  public responseDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FeedbackResponse.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    feedbackId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    respondedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    responseText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    responseDate: {
      type: DataTypes.DATE,
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
    tableName: 'feedback_responses',
    timestamps: true,
    indexes: [
      {
        fields: ['feedbackId'],
      },
      {
        fields: ['responseDate'],
      },
    ],
  }
);

export default FeedbackResponse;
