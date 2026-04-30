'use strict';

const { sequelize } = require('../../models');
const config = require('../config');

// Map each brand slug to a coarse "life stage rank".
// Rank 1 = youngest target audience, increases with age.
// A user is a transition candidate if their recent activity spans >=2 distinct ranks.
const BRAND_LIFE_STAGE_RANK = {
  teenvibe: 1,
  babybliss: 2,
  fitgen: 2,
  glowskin: 3,
  silvercare: 4,
};

module.exports = {
  key: 'lifecycle_transition_candidate',
  name: 'Lifecycle Transition Candidate',
  description: `User has recent activity (last ${config.LIFECYCLE_WINDOW_DAYS} days) across brands targeting different life stages — likely transitioning.`,

  async evaluate() {
    const rows = await sequelize.query(
      `SELECT e.user_id, b.slug AS brand_slug, COUNT(*) AS event_count
       FROM events e
       JOIN brands b ON b.id = e.brand_id
       WHERE e.occurred_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
       GROUP BY e.user_id, b.slug`,
      {
        replacements: { days: config.LIFECYCLE_WINDOW_DAYS },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Bucket by user, then check life-stage spread
    const byUser = {};
    for (const r of rows) {
      const uid = Number(r.user_id);
      if (!byUser[uid]) byUser[uid] = {};
      byUser[uid][r.brand_slug] = Number(r.event_count);
    }

    const userIds = [];
    const metadata = {};
    for (const [uidStr, brandCounts] of Object.entries(byUser)) {
      const uid = Number(uidStr);
      const ranks = new Set();
      for (const slug of Object.keys(brandCounts)) {
        const rank = BRAND_LIFE_STAGE_RANK[slug];
        if (rank !== undefined) ranks.add(rank);
      }
      if (ranks.size >= 2) {
        userIds.push(uid);
        metadata[uid] = {
          engaged_brands: brandCounts,
          life_stages_engaged: [...ranks].sort(),
          window_days: config.LIFECYCLE_WINDOW_DAYS,
        };
      }
    }

    return { userIds, metadata };
  },
};
