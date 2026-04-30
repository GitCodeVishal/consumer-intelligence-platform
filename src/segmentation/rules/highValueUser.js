'use strict';

const { sequelize } = require('../../models');
const config = require('../config');

module.exports = {
  key: 'high_value_user',
  name: 'High Value User',
  description: `User has total purchase spend >= $${config.HIGH_VALUE_THRESHOLD} across all brands.`,

  async evaluate() {
    const rows = await sequelize.query(
      `SELECT user_id, SUM(amount) AS total_spend, COUNT(*) AS purchase_count
       FROM events
       WHERE event_type = 'purchase'
       GROUP BY user_id
       HAVING total_spend >= :threshold`,
      {
        replacements: { threshold: config.HIGH_VALUE_THRESHOLD },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const metadata = {};
    const userIds = rows.map((r) => {
      const uid = Number(r.user_id);
      metadata[uid] = {
        total_spend: Number(r.total_spend),
        purchase_count: Number(r.purchase_count),
        threshold: config.HIGH_VALUE_THRESHOLD,
      };
      return uid;
    });

    return { userIds, metadata };
  },
};
