'use strict';

const { Brand } = require('../models');

const findById = async (id, options = {}) => Brand.findByPk(id, options);

const findByIds = async (ids, options = {}) =>
  Brand.findAll({ where: { id: ids }, ...options });

const findBySlug = async (slug, options = {}) =>
  Brand.findOne({ where: { slug }, ...options });

const listAll = async (options = {}) =>
  Brand.findAll({ order: [['name', 'ASC']], ...options });

module.exports = { findById, findByIds, findBySlug, listAll };
