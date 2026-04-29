'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      Event.belongsTo(models.Brand, {
        foreignKey: 'brand_id',
        as: 'brand',
      });
    }
  }

  Event.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      event_type: {
        type: DataTypes.ENUM(
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
        type: DataTypes.DECIMAL(10, 2),
      },
      payload: {
        type: DataTypes.JSON,
      },
      occurred_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Event',
      tableName: 'events',
      underscored: true,
      timestamps: true,
    }
  );

  return Event;
};
