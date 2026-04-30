'use strict';

const { sequelize } = require('../../models');
const config = require('../config');

module.exports = {
  key: 'dormant_user',
  name: 'Dormant User',
  description: `User has no events in the last ${config.DORMANT_DAYS} days (or no events at all).`,

  async evaluate() {
    const rows = await sequelize.query(
      `SELECT u.id AS user_id, MAX(e.occurred_at) AS last_event_at
       FROM users u
       LEFT JOIN events e ON e.user_id = u.id
       GROUP BY u.id
       HAVING last_event_at IS NULL
           OR last_event_at < DATE_SUB(NOW(), INTERVAL :days DAY)`,
      {
        replacements: { days: config.DORMANT_DAYS },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const metadata = {};
    const userIds = rows.map((r) => {
      const uid = Number(r.user_id);
      metadata[uid] = {
        last_event_at: r.last_event_at,
        dormancy_days: config.DORMANT_DAYS,
      };
      return uid;
    });

    return { userIds, metadata };
  },
};
