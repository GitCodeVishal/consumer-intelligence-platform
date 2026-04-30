'use strict';

const { StatusCodes } = require('http-status-codes');
const propensityService = require('../services/propensityService');
const { successResponse } = require('../utils/responses');

const get = async (req, res) => {
  const result = await propensityService.compute(req.params.id);
  res
    .status(StatusCodes.OK)
    .json(successResponse(result, 'Propensity score computed'));
};

module.exports = { get };
