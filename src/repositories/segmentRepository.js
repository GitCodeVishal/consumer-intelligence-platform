'use strict';

const { Segment, UserSegment, User, sequelize } = require('../models');

const findById = async (id, options = {}) => Segment.findByPk(id, options);

const findByKey = async (key, options = {}) =>
  Segment.findOne({ where: { key }, ...options });

const listAllWithCounts = async () =>
  sequelize.query(
    `SELECT s.id, s.key, s.name, s.description, s.is_active,
            COUNT(us.id) AS member_count
     FROM segments s
     LEFT JOIN user_segments us ON us.segment_id = s.id
     GROUP BY s.id, s.key, s.name, s.description, s.is_active
     ORDER BY s.id`,
    { type: sequelize.QueryTypes.SELECT }
  );

const replaceMembershipsForSegment = async (segmentId, memberships, transaction) => {
  await UserSegment.destroy({ where: { segment_id: segmentId }, transaction });
  if (!memberships.length) return 0;

  const now = new Date();
  await UserSegment.bulkCreate(
    memberships.map((m) => ({
      segment_id: segmentId,
      user_id: m.user_id,
      evaluated_at: now,
      metadata: m.metadata || null,
    })),
    { transaction }
  );
  return memberships.length;
};

const getMembersForSegmentKey = async (key, { page = 1, limit = 20 } = {}) => {
  const segment = await findByKey(key);
  if (!segment) return null;

  const offset = (page - 1) * limit;
  const { rows, count } = await UserSegment.findAndCountAll({
    where: { segment_id: segment.id },
    include: [
      {
        model: User,
        as: 'user',
        attributes: [
          'id',
          'email',
          'phone',
          'first_name',
          'last_name',
          'city',
          'country',
        ],
      },
    ],
    limit,
    offset,
    order: [['evaluated_at', 'DESC'], ['id', 'ASC']],
  });

  return {
    segment: { id: segment.id, key: segment.key, name: segment.name },
    rows,
    count,
    page,
    limit,
    pages: Math.ceil(count / limit),
  };
};

const getSegmentsForUser = async (userId) =>
  UserSegment.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Segment,
        as: 'segment',
        attributes: ['id', 'key', 'name', 'description'],
      },
    ],
    order: [['evaluated_at', 'DESC']],
  });

module.exports = {
  findById,
  findByKey,
  listAllWithCounts,
  replaceMembershipsForSegment,
  getMembersForSegmentKey,
  getSegmentsForUser,
};
