import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface RegionAttributes {
  id: string;
  regionName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegionCreationAttributes
  extends Optional<RegionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Region extends Model<RegionAttributes, RegionCreationAttributes> implements RegionAttributes {
  public id!: string;
  public regionName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Region.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    regionName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
    tableName: 'regions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['regionName'],
      },
    ],
  }
);

export default Region;
