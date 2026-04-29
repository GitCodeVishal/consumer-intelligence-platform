'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Segment extends Model {
    static associate(models) {
      Segment.belongsToMany(models.User, {
        through: models.UserSegment,
        foreignKey: 'segment_id',
        otherKey: 'user_id',
        as: 'users',
      });
      Segment.hasMany(models.UserSegment, {
        foreignKey: 'segment_id',
        as: 'memberships',
      });
    }
  }

  Segment.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      description: DataTypes.TEXT,
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Segment',
      tableName: 'segments',
      underscored: true,
      timestamps: true,
    }
  );

  return Segment;
};
