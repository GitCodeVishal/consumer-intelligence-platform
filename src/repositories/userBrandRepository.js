'use strict';

const { Op } = require('sequelize');
const { UserBrandAssociation, Brand } = require('../models');

const findByUserAndBrand = async (userId, brandId, options = {}) =>
  UserBrandAssociation.findOne({
    where: { user_id: userId, brand_id: brandId },
    ...options,
  });

const create = async (data, options = {}) =>
  UserBrandAssociation.create(data, options);

const setActive = async (assoc, isActive, options = {}) => {
  await assoc.update({ is_active: isActive }, options);
  return assoc;
};

const findActiveBrandsForUser = async (userId, options = {}) =>
  Brand.findAll({
    include: [
      {
        model: UserBrandAssociation,
        as: 'userAssociations',
        where: { user_id: userId, is_active: true },
        attributes: [],
        required: true,
      },
    ],
    ...options,
  });

const findByPairs = async (pairs, options = {}) => {
  if (!pairs.length) return [];
  return UserBrandAssociation.findAll({
    where: {
      [Op.or]: pairs.map(([uid, bid]) => ({ user_id: uid, brand_id: bid })),
    },
    ...options,
  });
};

const bulkCreate = async (rows, options = {}) =>
  UserBrandAssociation.bulkCreate(rows, options);

module.exports = {
  findByUserAndBrand,
  create,
  setActive,
  findActiveBrandsForUser,
  findByPairs,
  bulkCreate,
};
