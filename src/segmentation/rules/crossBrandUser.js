'use strict';

const { sequelize } = require('../../models');
const config = require('../config');

module.exports = {
  key: 'cross_brand_user',
  name: 'Cross-Brand User',
  description: `User has events with ${config.CROSS_BRAND_MIN_BRANDS}+ distinct brands within the last ${config.CROSS_BRAND_ACTIVE_DAYS} days.`,

  async evaluate() {
    const rows = await sequelize.query(
      `SELECT user_id,
              COUNT(DISTINCT brand_id) AS active_brand_count,
              COUNT(*) AS event_count
       FROM events
       WHERE occurred_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
       GROUP BY user_id
       HAVING active_brand_count >= :minBrands`,
      {
        replacements: {
          days: config.CROSS_BRAND_ACTIVE_DAYS,
          minBrands: config.CROSS_BRAND_MIN_BRANDS,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const metadata = {};
    const userIds = rows.map((r) => {
      const uid = Number(r.user_id);
      metadata[uid] = {
        active_brand_count: Number(r.active_brand_count),
        event_count: Number(r.event_count),
        window_days: config.CROSS_BRAND_ACTIVE_DAYS,
      };
      return uid;
    });

    return { userIds, metadata };
  },
};
