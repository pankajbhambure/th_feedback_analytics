import { QueryInterface } from 'sequelize';

/*
  # Fix Famepilot Processing Constraints

  1. Changes
    - Add 'SKIPPED' value to processingStatus enum in feedback_raw table
    - Remove CHECK constraint requiring email OR phone on customers table

  2. Rationale
    - Famepilot data may have records that cannot be processed (e.g., store not found)
      and need to be marked as SKIPPED
    - Famepilot data may have customers without email or phone information,
      so the strict constraint needs to be removed to allow processing
*/

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // Add SKIPPED to the processingStatus enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_feedback_raw_processingStatus"
      ADD VALUE IF NOT EXISTS 'SKIPPED';
    `);

    // Remove the CHECK constraint on customers table
    await queryInterface.sequelize.query(`
      ALTER TABLE customers
      DROP CONSTRAINT IF EXISTS customers_contact_required;
    `);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // Re-add the CHECK constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE customers
      ADD CONSTRAINT customers_contact_required
      CHECK (email IS NOT NULL OR phone IS NOT NULL);
    `);

    // Note: Cannot remove enum values in PostgreSQL without recreating the enum
    // which would require complex migrations. Leave SKIPPED in place.
  },
};
