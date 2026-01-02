import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('store_feedback_daily_agg', {
      agg_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      store_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      channel_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: 'channels',
          key: 'channelId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      agg_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      region_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'regions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      total_feedback_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      unique_customer_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      repeat_customer_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      avg_overall_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      avg_food_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      avg_beverage_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      positive_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      negative_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      neutral_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      responded_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      pending_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addConstraint('store_feedback_daily_agg', {
      fields: ['store_id', 'channel_id', 'agg_date'],
      type: 'unique',
      name: 'store_feedback_daily_agg_unique_constraint',
    });

    await queryInterface.addIndex('store_feedback_daily_agg', ['agg_date'], {
      name: 'store_feedback_daily_agg_date_idx',
    });

    await queryInterface.addIndex('store_feedback_daily_agg', ['store_id', 'agg_date'], {
      name: 'store_feedback_daily_agg_store_date_idx',
    });

    await queryInterface.addIndex('store_feedback_daily_agg', ['channel_id', 'agg_date'], {
      name: 'store_feedback_daily_agg_channel_date_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('store_feedback_daily_agg');
  },
};
