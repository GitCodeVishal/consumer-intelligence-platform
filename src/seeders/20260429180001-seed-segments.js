'use strict';

const SEGMENTS = [
  {
    key: 'high_value_user',
    name: 'High Value User',
    description: 'User has spent over the high-value threshold (default $500) across all brands.',
    is_active: true,
  },
  {
    key: 'cross_brand_user',
    name: 'Cross-Brand User',
    description: 'User is registered with and active on multiple brands within the last 90 days.',
    is_active: true,
  },
  {
    key: 'dormant_user',
    name: 'Dormant User',
    description: 'User has had no activity (events) in the configured dormancy window (default 60 days).',
    is_active: true,
  },
  {
    key: 'lifecycle_transition_candidate',
    name: 'Lifecycle Transition Candidate',
    description: 'User shows signals of moving to a brand for a different life stage based on age and recent engagement patterns.',
    is_active: true,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'segments',
      SEGMENTS.map((seg) => ({ ...seg, created_at: now, updated_at: now }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('segments', null, {});
  },
};
