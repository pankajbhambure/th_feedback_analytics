import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('ratings', {
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
      overallRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      foodRating: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      beverageRating: {
        type: DataTypes.INTEGER,
        allowNull: true,
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

    await queryInterface.sequelize.query(
      'ALTER TABLE ratings ADD CONSTRAINT ratings_overall_rating_check CHECK ("overallRating" >= 0 AND "overallRating" <= 5)'
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE ratings ADD CONSTRAINT ratings_food_rating_check CHECK ("foodRating" IS NULL OR ("foodRating" >= 0 AND "foodRating" <= 5))'
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE ratings ADD CONSTRAINT ratings_beverage_rating_check CHECK ("beverageRating" IS NULL OR ("beverageRating" >= 0 AND "beverageRating" <= 5))'
    );

    await queryInterface.addIndex('ratings', ['customerVisitId'], {
      unique: true,
      name: 'ratings_customer_visit_id_idx',
    });

    await queryInterface.addIndex('ratings', ['overallRating'], {
      name: 'ratings_overall_rating_idx',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('ratings');
  },
};
