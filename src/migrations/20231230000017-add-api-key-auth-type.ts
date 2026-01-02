import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_channels_authType" ADD VALUE IF NOT EXISTS 'API_KEY';
    `);
  },

  down: async (_queryInterface: QueryInterface): Promise<void> => {
  },
};
