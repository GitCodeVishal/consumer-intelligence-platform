'use strict';

const { Op } = require('sequelize');
const { Event, Brand, sequelize } = require('../models');

const create = async (data, options = {}) => Event.create(data, options);

const bulkCreate = async (rows, options = {}) => Event.bulkCreate(rows, options);

const findByUser = async (userId, { page = 1, limit = 20, filters = {} } = {}) => {
  const offset = (page - 1) * limit;
  const where = { user_id: userId };

  if (filters.brand_id) where.brand_id = filters.brand_id;
  if (filters.event_type) where.event_type = filters.event_type;

  if (filters.from || filters.to) {
    where.occurred_at = {};
    if (filters.from) where.occurred_at[Op.gte] = filters.from;
    if (filters.to) where.occurred_at[Op.lte] = filters.to;
  }

  const { rows, count } = await Event.findAndCountAll({
    where,
    limit,
    offset,
    order: [['occurred_at', 'DESC']],
    include: [
      { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug'] },
    ],
  });

  return { rows, count, page, limit, pages: Math.ceil(count / limit) };
};

const getLastPurchaseAt = async (userId) => {
  const [row] = await sequelize.query(
    `SELECT MAX(occurred_at) AS last_purchase_at
     FROM events
     WHERE user_id = :userId AND event_type = 'purchase'`,
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
  return row.last_purchase_at;
};

const getPurchaseCountSince = async (userId, days) => {
  const [row] = await sequelize.query(
    `SELECT COUNT(*) AS c
     FROM events
     WHERE user_id = :userId
       AND event_type = 'purchase'
       AND occurred_at >= DATE_SUB(NOW(), INTERVAL :days DAY)`,
    { replacements: { userId, days }, type: sequelize.QueryTypes.SELECT }
  );
  return Number(row.c);
};

const getEngagementCountSince = async (userId, days) => {
  const [row] = await sequelize.query(
    `SELECT COUNT(*) AS c
     FROM events
     WHERE user_id = :userId
       AND event_type != 'purchase'
       AND occurred_at >= DATE_SUB(NOW(), INTERVAL :days DAY)`,
    { replacements: { userId, days }, type: sequelize.QueryTypes.SELECT }
  );
  return Number(row.c);
};

module.exports = {
  create,
  bulkCreate,
  findByUser,
  getLastPurchaseAt,
  getPurchaseCountSince,
  getEngagementCountSince,
};
