'use strict';

const { StatusCodes } = require('http-status-codes');
const userService = require('../services/userService');
const { successResponse } = require('../utils/responses');

const create = async (req, res) => {
  const { user, wasCreated } = await userService.createUser(req.body);
  res
    .status(wasCreated ? StatusCodes.CREATED : StatusCodes.OK)
    .json(
      successResponse(
        user,
        wasCreated ? 'User created' : 'Existing user matched (deduplicated)'
      )
    );
};

const getById = async (req, res) => {
  const user = await userService.getUserProfile(req.params.id);
  res.status(StatusCodes.OK).json(successResponse(user, 'User profile fetched'));
};

const update = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(StatusCodes.OK).json(successResponse(user, 'User updated'));
};

const list = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const filters = {
    city: req.query.city,
    country: req.query.country,
    brand_slug: req.query.brand,
    search: req.query.search,
  };
  const result = await userService.listUsers({ page, limit, filters });
  res.status(StatusCodes.OK).json(successResponse(result, 'Users fetched'));
};

const registerBrand = async (req, res) => {
  const { brand_id, acquisition_source } = req.body;
  const { association, wasCreated } = await userService.registerUserToBrand(
    req.params.id,
    brand_id,
    { acquisition_source }
  );
  res
    .status(wasCreated ? StatusCodes.CREATED : StatusCodes.OK)
    .json(
      successResponse(
        association,
        wasCreated
          ? 'User registered to brand'
          : 'User already registered (reactivated if previously inactive)'
      )
    );
};

const unlinkBrand = async (req, res) => {
  const association = await userService.unlinkUserFromBrand(
    req.params.id,
    req.params.brandId
  );
  res
    .status(StatusCodes.OK)
    .json(successResponse(association, 'User unlinked from brand'));
};

module.exports = { create, getById, update, list, registerBrand, unlinkBrand };
