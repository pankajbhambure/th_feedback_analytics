import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('feedback_responses', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      feedbackId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'feedbacks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      respondedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      responseText: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      responseDate: {
        type: DataTypes.DATE,
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
    });

    await queryInterface.addIndex('feedback_responses', ['feedbackId'], {
      name: 'feedback_responses_feedback_id_idx',
    });

    await queryInterface.addIndex('feedback_responses', ['responseDate'], {
      name: 'feedback_responses_response_date_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('feedback_responses');
  },
};
