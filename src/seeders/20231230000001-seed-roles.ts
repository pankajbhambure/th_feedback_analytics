import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkInsert('roles', [
      {
        id: uuidv4(),
        name: 'ADMIN',
        description: 'Administrator role with full access',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'USER',
        description: 'Regular user role with limited access',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('roles', {});
  },
};
