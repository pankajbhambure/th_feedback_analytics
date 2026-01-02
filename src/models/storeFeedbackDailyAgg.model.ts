import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface StoreFeedbackDailyAggAttributes {
  agg_id: number;
  store_id: string;
  channel_id: string;
  agg_date: Date;
  city: string;
  region_id: string | null;
  total_feedback_count: number;
  unique_customer_count: number;
  repeat_customer_count: number;
  avg_overall_rating: number | null;
  avg_food_rating: number | null;
  avg_beverage_rating: number | null;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  responded_count: number;
  pending_count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreFeedbackDailyAggCreationAttributes
  extends Optional<
    StoreFeedbackDailyAggAttributes,
    | 'agg_id'
    | 'region_id'
    | 'total_feedback_count'
    | 'unique_customer_count'
    | 'repeat_customer_count'
    | 'avg_overall_rating'
    | 'avg_food_rating'
    | 'avg_beverage_rating'
    | 'positive_count'
    | 'negative_count'
    | 'neutral_count'
    | 'responded_count'
    | 'pending_count'
    | 'createdAt'
    | 'updatedAt'
  > {}

class StoreFeedbackDailyAgg
  extends Model<StoreFeedbackDailyAggAttributes, StoreFeedbackDailyAggCreationAttributes>
  implements StoreFeedbackDailyAggAttributes
{
  public agg_id!: number;
  public store_id!: string;
  public channel_id!: string;
  public agg_date!: Date;
  public city!: string;
  public region_id!: string | null;
  public total_feedback_count!: number;
  public unique_customer_count!: number;
  public repeat_customer_count!: number;
  public avg_overall_rating!: number | null;
  public avg_food_rating!: number | null;
  public avg_beverage_rating!: number | null;
  public positive_count!: number;
  public negative_count!: number;
  public neutral_count!: number;
  public responded_count!: number;
  public pending_count!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StoreFeedbackDailyAgg.init(
  {
    agg_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    channel_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    agg_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    region_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    total_feedback_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    unique_customer_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    repeat_customer_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    avg_overall_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    avg_food_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    avg_beverage_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    positive_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    negative_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    neutral_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    responded_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pending_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'store_feedback_daily_agg',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['store_id', 'channel_id', 'agg_date'],
      },
      {
        fields: ['agg_date'],
      },
      {
        fields: ['store_id', 'agg_date'],
      },
      {
        fields: ['channel_id', 'agg_date'],
      },
    ],
  }
);

export default StoreFeedbackDailyAgg;
