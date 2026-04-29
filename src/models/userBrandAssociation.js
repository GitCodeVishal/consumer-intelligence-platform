'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserBrandAssociation extends Model {
    static associate(models) {
      UserBrandAssociation.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      UserBrandAssociation.belongsTo(models.Brand, {
        foreignKey: 'brand_id',
        as: 'brand',
      });
    }
  }

  UserBrandAssociation.init(
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
      registered_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      acquisition_source: DataTypes.STRING(100),
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'UserBrandAssociation',
      tableName: 'user_brand_associations',
      underscored: true,
      timestamps: true,
    }
  );

  return UserBrandAssociation;
};
