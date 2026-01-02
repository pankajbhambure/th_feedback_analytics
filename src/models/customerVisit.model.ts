import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export enum Sentiment {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  NEUTRAL = 'Neutral',
}

export interface CustomerVisitAttributes {
  id: string;
  customerId: string;
  storeId: string;
  channelId: string;
  feedbackRawId: string | null;
  feedbackDate: Date;
  visitDate: Date;
  visitDay: string;
  visitWeek: number;
  visitMonth: number;
  visitQuarter: number;
  visitYear: number;
  sentiment: Sentiment;
  hasFoodOrder: boolean;
  hasBeverageOrder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerVisitCreationAttributes
  extends Optional<
    CustomerVisitAttributes,
    'id' | 'feedbackRawId' | 'hasFoodOrder' | 'hasBeverageOrder' | 'createdAt' | 'updatedAt'
  > {}

class CustomerVisit
  extends Model<CustomerVisitAttributes, CustomerVisitCreationAttributes>
  implements CustomerVisitAttributes
{
  public id!: string;
  public customerId!: string;
  public storeId!: string;
  public channelId!: string;
  public feedbackRawId!: string | null;
  public feedbackDate!: Date;
  public visitDate!: Date;
  public visitDay!: string;
  public visitWeek!: number;
  public visitMonth!: number;
  public visitQuarter!: number;
  public visitYear!: number;
  public sentiment!: Sentiment;
  public hasFoodOrder!: boolean;
  public hasBeverageOrder!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CustomerVisit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    channelId: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    feedbackRawId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'feedback_raw',
        key: 'id',
      },
    },
    feedbackDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    visitDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    visitDay: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']],
          msg: 'visitDay must be a valid day of the week',
        },
      },
    },
    visitWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 53,
      },
    },
    visitMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    visitQuarter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4,
      },
    },
    visitYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2020,
        max: 2100,
      },
    },
    sentiment: {
      type: DataTypes.ENUM(...Object.values(Sentiment)),
      allowNull: false,
    },
    hasFoodOrder: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    hasBeverageOrder: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'customer_visits',
    timestamps: true,
    indexes: [
      {
        fields: ['visitDate'],
      },
      {
        fields: ['feedbackDate'],
      },
      {
        fields: ['storeId'],
      },
      {
        fields: ['channelId'],
      },
      {
        fields: ['sentiment'],
      },
      {
        fields: ['visitYear', 'visitMonth'],
      },
      {
        fields: ['storeId', 'visitDate'],
      },
      {
        fields: ['channelId', 'visitDate'],
      },
      {
        fields: ['customerId'],
      },
    ],
  }
);

export default CustomerVisit;
