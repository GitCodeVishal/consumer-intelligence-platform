'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      brand_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'brands', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      event_type: {
        type: Sequelize.ENUM(
          'purchase',
          'app_open',
          'content_view',
          'add_to_cart',
          'click',
          'page_view',
          'product_view'
        ),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      occurred_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('events', ['user_id', 'occurred_at']);
    await queryInterface.addIndex('events', ['brand_id', 'occurred_at']);
    await queryInterface.addIndex('events', ['event_type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('events');
  },
};
