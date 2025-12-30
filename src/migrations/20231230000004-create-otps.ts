/**
 * Migration: Create OTPs table
 * Creates table for storing one-time passwords used in authentication flows
 */

import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('otps', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      purpose: {
        type: DataTypes.ENUM('LOGIN', 'REGISTER', 'RESET_PASSWORD'),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('otps', ['userId', 'purpose'], {
      name: 'otps_userId_purpose_idx',
    });

    await queryInterface.addIndex('otps', ['code', 'purpose'], {
      name: 'otps_code_purpose_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('otps');
  },
};
