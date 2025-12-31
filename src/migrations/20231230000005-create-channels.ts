import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('channels', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      channelId: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      channelName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      baseUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      httpMethod: {
        type: DataTypes.ENUM('GET', 'POST'),
        defaultValue: 'GET',
        allowNull: false,
      },
      authType: {
        type: DataTypes.ENUM('NONE', 'JWT'),
        defaultValue: 'NONE',
        allowNull: false,
      },
      authConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      dateFromParam: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      dateToParam: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      dateFormat: {
        type: DataTypes.STRING(20),
        defaultValue: 'YYYY-MM-DD',
        allowNull: false,
      },
      paginationType: {
        type: DataTypes.ENUM('PAGE', 'NONE'),
        defaultValue: 'PAGE',
        allowNull: false,
      },
      pageParam: {
        type: DataTypes.STRING(50),
        defaultValue: 'page',
        allowNull: false,
      },
      startPage: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      requestSchema: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      responseSchema: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex('channels', ['channelId'], {
      unique: true,
      name: 'channels_channel_id_unique',
    });

    await queryInterface.addIndex('channels', ['isActive'], {
      name: 'channels_is_active_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('channels');
  },
};
