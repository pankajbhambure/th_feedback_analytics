import { QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_feedback_raw_processing_status" ADD VALUE IF NOT EXISTS 'SKIPPED';
    `);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.sequelize.query(`
      UPDATE feedback_raw SET processing_status = 'FAILED' WHERE processing_status = 'SKIPPED';

      CREATE TYPE "enum_feedback_raw_processing_status_new" AS ENUM('NEW', 'PROCESSED', 'FAILED');
      ALTER TABLE feedback_raw ALTER COLUMN processing_status TYPE "enum_feedback_raw_processing_status_new"
        USING processing_status::text::"enum_feedback_raw_processing_status_new";
      DROP TYPE "enum_feedback_raw_processing_status";
      ALTER TYPE "enum_feedback_raw_processing_status_new" RENAME TO "enum_feedback_raw_processing_status";
    `);
  },
};
