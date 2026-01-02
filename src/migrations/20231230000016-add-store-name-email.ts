import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn('stores', 'storeName', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn('stores', 'email', {
      type: DataTypes.STRING(255),
      allowNull: true,
    });

    await queryInterface.addIndex('stores', ['email'], {
      name: 'stores_email_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeIndex('stores', 'stores_email_idx');
    await queryInterface.removeColumn('stores', 'email');
    await queryInterface.removeColumn('stores', 'storeName');
  },
};
