import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface StoreAttributes {
  id: string;
  storeId: string;
  storeCode: string;
  regionId: string;
  city: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreCreationAttributes
  extends Optional<StoreAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
  public id!: string;
  public storeId!: string;
  public storeCode!: string;
  public regionId!: string;
  public city!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Store.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    storeId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    storeCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    regionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'stores',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['storeId'],
      },
      {
        fields: ['regionId'],
      },
      {
        fields: ['city'],
      },
      {
        fields: ['regionId', 'city'],
      },
    ],
  }
);

export default Store;
