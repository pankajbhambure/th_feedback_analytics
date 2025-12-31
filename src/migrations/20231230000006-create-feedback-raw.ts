import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('feedback_raw', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      channelId: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: 'channels',
          key: 'channelId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      externalFeedbackId: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      feedbackTimestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      rawPayload: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      ingestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      sourceHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      processingStatus: {
        type: DataTypes.ENUM('NEW', 'PROCESSED', 'FAILED'),
        defaultValue: 'NEW',
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

    await queryInterface.addConstraint('feedback_raw', {
      fields: ['channelId', 'externalFeedbackId'],
      type: 'unique',
      name: 'feedback_raw_channel_external_id_unique',
    });

    await queryInterface.addIndex('feedback_raw', ['processingStatus'], {
      name: 'feedback_raw_processing_status_idx',
    });

    await queryInterface.addIndex('feedback_raw', ['feedbackTimestamp'], {
      name: 'feedback_raw_feedback_timestamp_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('feedback_raw');
  },
};
