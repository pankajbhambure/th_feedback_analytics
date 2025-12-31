import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('feedbacks', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customerVisitId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'customer_visits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      foodOrdered: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      commentsOnFood: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      beveragesOrdered: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      commentsOnBeverage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      overallComments: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      feedbackStatus: {
        type: DataTypes.ENUM('Pending', 'Responded'),
        allowNull: false,
        defaultValue: 'Pending',
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

    await queryInterface.addIndex('feedbacks', ['customerVisitId'], {
      unique: true,
      name: 'feedbacks_customer_visit_id_idx',
    });

    await queryInterface.addIndex('feedbacks', ['feedbackStatus'], {
      name: 'feedbacks_feedback_status_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('feedbacks');
  },
};
