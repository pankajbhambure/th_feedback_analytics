import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('customers', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      fullName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      repeatCustomer: {
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

    await queryInterface.addConstraint('customers', {
      fields: ['customerId'],
      type: 'unique',
      name: 'customers_customer_id_unique',
    });

    await queryInterface.sequelize.query(
      'ALTER TABLE customers ADD CONSTRAINT customers_contact_required CHECK (email IS NOT NULL OR phone IS NOT NULL)'
    );

    await queryInterface.addIndex('customers', ['customerId'], {
      unique: true,
      name: 'customers_customer_id_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('customers');
  },
};
