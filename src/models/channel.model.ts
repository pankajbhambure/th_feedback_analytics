import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
}

export enum AuthType {
  NONE = 'NONE',
  JWT = 'JWT',
}

export enum PaginationType {
  PAGE = 'PAGE',
  NONE = 'NONE',
}

export interface AuthConfig {
  tokenEndpoint?: string;
  tokenResponseField?: string;
  authHeaderName?: string;
  headerPrefix?: string;
  [key: string]: any;
}

export interface ChannelAttributes {
  id: string;
  channelId: string;
  channelName: string;
  baseUrl: string;
  httpMethod: HttpMethod;
  authType: AuthType;
  authConfig: AuthConfig | null;
  dateFromParam: string;
  dateToParam: string;
  dateFormat: string;
  paginationType: PaginationType;
  pageParam: string;
  startPage: number;
  requestSchema: Record<string, any> | null;
  responseSchema: Record<string, any> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelCreationAttributes
  extends Optional<
    ChannelAttributes,
    | 'id'
    | 'httpMethod'
    | 'authType'
    | 'authConfig'
    | 'dateFormat'
    | 'paginationType'
    | 'pageParam'
    | 'startPage'
    | 'requestSchema'
    | 'responseSchema'
    | 'isActive'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Channel extends Model<ChannelAttributes, ChannelCreationAttributes> implements ChannelAttributes {
  public id!: string;
  public channelId!: string;
  public channelName!: string;
  public baseUrl!: string;
  public httpMethod!: HttpMethod;
  public authType!: AuthType;
  public authConfig!: AuthConfig | null;
  public dateFromParam!: string;
  public dateToParam!: string;
  public dateFormat!: string;
  public paginationType!: PaginationType;
  public pageParam!: string;
  public startPage!: number;
  public requestSchema!: Record<string, any> | null;
  public responseSchema!: Record<string, any> | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Channel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    channelId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        isIn: {
          args: [['swiggy', 'zomato', 'instore', 'magicpin']],
          msg: 'Invalid channel_id. Allowed values: swiggy, zomato, instore, magicpin',
        },
      },
    },
    channelName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    baseUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    httpMethod: {
      type: DataTypes.ENUM(...Object.values(HttpMethod)),
      defaultValue: HttpMethod.GET,
      allowNull: false,
    },
    authType: {
      type: DataTypes.ENUM(...Object.values(AuthType)),
      defaultValue: AuthType.NONE,
      allowNull: false,
    },
    authConfig: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    dateFromParam: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    dateToParam: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    dateFormat: {
      type: DataTypes.STRING(20),
      defaultValue: 'YYYY-MM-DD',
      allowNull: false,
    },
    paginationType: {
      type: DataTypes.ENUM(...Object.values(PaginationType)),
      defaultValue: PaginationType.PAGE,
      allowNull: false,
    },
    pageParam: {
      type: DataTypes.STRING(50),
      defaultValue: 'page',
      allowNull: false,
    },
    startPage: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    requestSchema: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    responseSchema: {
      type: DataTypes.JSONB,
      allowNull: true,
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
    tableName: 'channels',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['channelId'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default Channel;
