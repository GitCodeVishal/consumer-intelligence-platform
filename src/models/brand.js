'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {
    static associate(models) {
      Brand.belongsToMany(models.User, {
        through: models.UserBrandAssociation,
        foreignKey: 'brand_id',
        otherKey: 'user_id',
        as: 'users',
      });
      Brand.hasMany(models.UserBrandAssociation, {
        foreignKey: 'brand_id',
        as: 'userAssociations',
      });
      Brand.hasMany(models.Event, {
        foreignKey: 'brand_id',
        as: 'events',
      });
    }
  }

  Brand.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      target_demographic: {
        type: DataTypes.STRING(255),
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: 'Brand',
      tableName: 'brands',
      underscored: true,
      timestamps: true,
    }
  );

  return Brand;
};
