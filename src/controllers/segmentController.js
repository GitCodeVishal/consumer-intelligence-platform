'use strict';

const { StatusCodes } = require('http-status-codes');
const segmentService = require('../services/segmentService');
const { successResponse } = require('../utils/responses');

const evaluateAll = async (req, res) => {
  const results = await segmentService.evaluateAll();
  res.status(StatusCodes.OK).json(
    successResponse(
      { evaluated: results.length, results },
      'All segments evaluated and memberships refreshed'
    )
  );
};

const evaluateOne = async (req, res) => {
  const result = await segmentService.evaluateOne(req.params.key);
  res
    .status(StatusCodes.OK)
    .json(successResponse(result, `Segment "${req.params.key}" evaluated`));
};

const list = async (req, res) => {
  const segments = await segmentService.listSegments();
  res
    .status(StatusCodes.OK)
    .json(successResponse(segments, 'Segments listed with member counts'));
};

const members = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const result = await segmentService.getMembersForKey(req.params.key, {
    page,
    limit,
  });
  res
    .status(StatusCodes.OK)
    .json(successResponse(result, `Members of segment "${req.params.key}"`));
};

const segmentsForUser = async (req, res) => {
  const result = await segmentService.getSegmentsForUser(req.params.id);
  res
    .status(StatusCodes.OK)
    .json(successResponse(result, 'Segments fetched for user'));
};

module.exports = { evaluateAll, evaluateOne, list, members, segmentsForUser };
