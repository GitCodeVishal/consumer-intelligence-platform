'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserSegment extends Model {
    static associate(models) {
      UserSegment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      UserSegment.belongsTo(models.Segment, {
        foreignKey: 'segment_id',
        as: 'segment',
      });
    }
  }

  UserSegment.init(
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
      segment_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      evaluated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      metadata: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: 'UserSegment',
      tableName: 'user_segments',
      underscored: true,
      timestamps: true,
    }
  );

  return UserSegment;
};
