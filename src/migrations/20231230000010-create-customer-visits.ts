import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('customer_visits', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      storeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      channelId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      feedbackDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      visitDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      visitDay: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      visitWeek: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      visitMonth: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      visitQuarter: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      visitYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sentiment: {
        type: DataTypes.ENUM('Positive', 'Negative', 'Neutral'),
        allowNull: false,
      },
      hasFoodOrder: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      hasBeverageOrder: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addIndex('customer_visits', ['visitDate'], {
      name: 'customer_visits_visit_date_idx',
    });

    await queryInterface.addIndex('customer_visits', ['feedbackDate'], {
      name: 'customer_visits_feedback_date_idx',
    });

    await queryInterface.addIndex('customer_visits', ['storeId'], {
      name: 'customer_visits_store_id_idx',
    });

    await queryInterface.addIndex('customer_visits', ['channelId'], {
      name: 'customer_visits_channel_id_idx',
    });

    await queryInterface.addIndex('customer_visits', ['sentiment'], {
      name: 'customer_visits_sentiment_idx',
    });

    await queryInterface.addIndex('customer_visits', ['visitYear', 'visitMonth'], {
      name: 'customer_visits_year_month_idx',
    });

    await queryInterface.addIndex('customer_visits', ['storeId', 'visitDate'], {
      name: 'customer_visits_store_date_idx',
    });

    await queryInterface.addIndex('customer_visits', ['channelId', 'visitDate'], {
      name: 'customer_visits_channel_date_idx',
    });

    await queryInterface.addIndex('customer_visits', ['customerId'], {
      name: 'customer_visits_customer_id_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('customer_visits');
  },
};
