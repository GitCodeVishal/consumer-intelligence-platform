'use strict';

const { Op } = require('sequelize');
const { User, Brand, Event } = require('../models');

const findById = async (id, options = {}) => User.findByPk(id, options);

const findByIds = async (ids, options = {}) =>
  User.findAll({ where: { id: ids }, ...options });

// Prefer email match first; fall back to phone match
const findByEmailOrPhone = async (email, phone, options = {}) => {
  if (email) {
    const byEmail = await User.findOne({ where: { email }, ...options });
    if (byEmail) return byEmail;
  }
  if (phone) {
    const byPhone = await User.findOne({ where: { phone }, ...options });
    if (byPhone) return byPhone;
  }
  return null;
};

const findWithBrandsAndRecentEvents = async (id, eventLimit = 10) => {
  return User.findByPk(id, {
    include: [
      {
        model: Brand,
        as: 'brands',
        through: { attributes: ['registered_at', 'acquisition_source', 'is_active'] },
      },
      {
        model: Event,
        as: 'events',
        limit: eventLimit,
        order: [['occurred_at', 'DESC']],
        separate: true,
      },
    ],
  });
};

const create = async (data, options = {}) => User.create(data, options);

const update = async (id, data, options = {}) => {
  const user = await User.findByPk(id, options);
  if (!user) return null;
  await user.update(data, options);
  return user;
};

const paginate = async ({ page = 1, limit = 20, filters = {} } = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (filters.city) where.city = filters.city;
  if (filters.country) where.country = filters.country;
  if (filters.search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${filters.search}%` } },
      { last_name: { [Op.like]: `%${filters.search}%` } },
      { email: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  const include = [];
  if (filters.brand_slug) {
    include.push({
      model: Brand,
      as: 'brands',
      where: { slug: filters.brand_slug },
      required: true,
      through: { attributes: [] },
    });
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    include,
    limit,
    offset,
    distinct: true,
    order: [['id', 'ASC']],
  });

  return {
    rows,
    count,
    page,
    limit,
    pages: Math.ceil(count / limit),
  };
};

module.exports = {
  findById,
  findByIds,
  findByEmailOrPhone,
  findWithBrandsAndRecentEvents,
  create,
  update,
  paginate,
};
