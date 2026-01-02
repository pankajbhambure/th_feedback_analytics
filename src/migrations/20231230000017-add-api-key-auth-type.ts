import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_channels_authType'
          AND e.enumlabel = 'API_KEY'
        ) THEN
          ALTER TYPE "enum_channels_authType" ADD VALUE 'API_KEY';
        END IF;
      END $$;
    `);
  },

  down: async (_queryInterface: QueryInterface): Promise<void> => {
  },
};
