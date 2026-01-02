import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn('customer_visits', 'feedbackRawId', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'feedback_raw',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('customer_visits', ['feedbackRawId'], {
      name: 'customer_visits_feedback_raw_id_idx',
      unique: true,
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeIndex('customer_visits', 'customer_visits_feedback_raw_id_idx');
    await queryInterface.removeColumn('customer_visits', 'feedbackRawId');
  },
};
