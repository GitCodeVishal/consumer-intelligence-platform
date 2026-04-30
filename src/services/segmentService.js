'use strict';

const { StatusCodes } = require('http-status-codes');
const { sequelize } = require('../models');
const segmentRepository = require('../repositories/segmentRepository');
const userRepository = require('../repositories/userRepository');
const registry = require('../segmentation');
const AppError = require('../utils/AppError');

const evaluateOne = async (key) => {
  const rule = registry[key];
  if (!rule) {
    throw new AppError(
      `Unknown segment key: "${key}". Available: ${Object.keys(registry).join(', ')}`,
      StatusCodes.NOT_FOUND
    );
  }

  const segment = await segmentRepository.findByKey(rule.key);
  if (!segment) {
    throw new AppError(
      `Segment "${rule.key}" not found in DB. Run seeders to register the segment row.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const { userIds, metadata = {} } = await rule.evaluate();
  const memberships = userIds.map((uid) => ({
    user_id: uid,
    metadata: metadata[uid] || null,
  }));

  await sequelize.transaction(async (t) => {
    await segmentRepository.replaceMembershipsForSegment(segment.id, memberships, t);
  });

  return {
    key: rule.key,
    name: rule.name,
    member_count: memberships.length,
    evaluated_at: new Date(),
  };
};

const evaluateAll = async () => {
  const results = [];
  for (const key of Object.keys(registry)) {
    results.push(await evaluateOne(key));
  }
  return results;
};

const listSegments = async () => {
  const dbRows = await segmentRepository.listAllWithCounts();
  return dbRows.map((row) => ({
    ...row,
    member_count: Number(row.member_count),
    is_active: Boolean(row.is_active),
    is_registered: Boolean(registry[row.key]),
  }));
};

const getMembersForKey = async (key, pagination) => {
  if (!registry[key]) {
    throw new AppError(`Unknown segment key: "${key}"`, StatusCodes.NOT_FOUND);
  }
  const result = await segmentRepository.getMembersForSegmentKey(key, pagination);
  if (!result) {
    throw new AppError(`Segment "${key}" not found in DB`, StatusCodes.NOT_FOUND);
  }
  return result;
};

const getSegmentsForUser = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(`User not found: ${userId}`, StatusCodes.NOT_FOUND);
  }
  return segmentRepository.getSegmentsForUser(userId);
};

module.exports = {
  evaluateOne,
  evaluateAll,
  listSegments,
  getMembersForKey,
  getSegmentsForUser,
};
