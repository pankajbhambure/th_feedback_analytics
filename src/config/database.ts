import { env } from './env';

export const databaseConfig = {
  development: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    dialect: 'postgres' as const,
    logging: false,
  },
  production: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    dialect: 'postgres' as const,
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    dialect: 'postgres' as const,
    logging: false,
  },
};

module.exports = databaseConfig;
