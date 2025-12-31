import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface CustomerAttributes {
  id: string;
  customerId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  repeatCustomer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerCreationAttributes
  extends Optional<CustomerAttributes, 'id' | 'fullName' | 'email' | 'phone' | 'repeatCustomer' | 'createdAt' | 'updatedAt'> {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public id!: string;
  public customerId!: string;
  public fullName!: string | null;
  public email!: string | null;
  public phone!: string | null;
  public repeatCustomer!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Customer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    repeatCustomer: {
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
    tableName: 'customers',
    timestamps: true,
    validate: {
      atLeastOneContact() {
        if (!this.email && !this.phone) {
          throw new Error('At least one of email or phone must be provided');
        }
      },
    },
    indexes: [
      {
        unique: true,
        fields: ['customerId'],
      },
    ],
  }
);

export default Customer;
