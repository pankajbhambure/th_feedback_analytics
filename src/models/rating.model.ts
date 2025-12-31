import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface RatingAttributes {
  id: string;
  customerVisitId: string;
  overallRating: number;
  foodRating: number | null;
  beverageRating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingCreationAttributes
  extends Optional<RatingAttributes, 'id' | 'foodRating' | 'beverageRating' | 'createdAt' | 'updatedAt'> {}

class Rating extends Model<RatingAttributes, RatingCreationAttributes> implements RatingAttributes {
  public id!: string;
  public customerVisitId!: string;
  public overallRating!: number;
  public foodRating!: number | null;
  public beverageRating!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Rating.init(
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
    overallRating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      },
    },
    foodRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 5,
      },
    },
    beverageRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 5,
      },
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
    tableName: 'ratings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['customerVisitId'],
      },
      {
        fields: ['overallRating'],
      },
    ],
  }
);

export default Rating;
