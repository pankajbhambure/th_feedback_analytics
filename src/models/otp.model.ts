/**
 * OTP Model
 * Manages one-time passwords for various authentication purposes
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export enum OtpPurpose {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export interface OtpAttributes {
  id: string;
  userId: string;
  code: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface OtpCreationAttributes
  extends Optional<OtpAttributes, 'id' | 'isUsed' | 'createdAt'> {}

class Otp extends Model<OtpAttributes, OtpCreationAttributes> implements OtpAttributes {
  public id!: string;
  public userId!: string;
  public code!: string;
  public purpose!: OtpPurpose;
  public expiresAt!: Date;
  public isUsed!: boolean;
  public readonly createdAt!: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    purpose: {
      type: DataTypes.ENUM(...Object.values(OtpPurpose)),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'otps',
    timestamps: false,
    indexes: [
      {
        fields: ['userId', 'purpose'],
      },
      {
        fields: ['code', 'purpose'],
      },
    ],
  }
);

export default Otp;
