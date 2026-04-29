'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Brand, {
        through: models.UserBrandAssociation,
        foreignKey: 'user_id',
        otherKey: 'brand_id',
        as: 'brands',
      });
      User.hasMany(models.UserBrandAssociation, {
        foreignKey: 'user_id',
        as: 'brandAssociations',
      });
      User.hasMany(models.Event, {
        foreignKey: 'user_id',
        as: 'events',
      });
      User.belongsToMany(models.Segment, {
        through: models.UserSegment,
        foreignKey: 'user_id',
        otherKey: 'segment_id',
        as: 'segments',
      });
      User.hasMany(models.UserSegment, {
        foreignKey: 'user_id',
        as: 'segmentMemberships',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        unique: true,
        validate: {
          isEmail: { msg: 'Must be a valid email address' },
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        unique: true,
      },
      first_name: DataTypes.STRING(100),
      last_name: DataTypes.STRING(100),
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      },
      date_of_birth: DataTypes.DATEONLY,
      city: DataTypes.STRING(100),
      country: DataTypes.STRING(100),
      acquisition_source: DataTypes.STRING(100),
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
    }
  );

  return User;
};
