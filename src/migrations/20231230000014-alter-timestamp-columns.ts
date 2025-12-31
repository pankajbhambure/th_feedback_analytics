import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.changeColumn('customer_visits', 'visitDate', {
      type: DataTypes.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('customer_visits', 'feedbackDate', {
      type: DataTypes.DATE,
      allowNull: false,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE feedback_responses
      ALTER COLUMN "responseDate" TYPE TIMESTAMP WITH TIME ZONE
      USING "responseDate"::TIMESTAMP WITH TIME ZONE
    `);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.changeColumn('customer_visits', 'visitDate', {
      type: DataTypes.DATEONLY,
      allowNull: false,
    });

    await queryInterface.changeColumn('customer_visits', 'feedbackDate', {
      type: DataTypes.DATEONLY,
      allowNull: false,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE feedback_responses
      ALTER COLUMN "responseDate" TYPE DATE
      USING "responseDate"::DATE
    `);
  },
};
