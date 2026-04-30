'use strict';

const BRANDS = [
  {
    name: 'BabyBliss',
    slug: 'babybliss',
    target_demographic: 'Newborns and infants (0-2 years) and their parents',
    description: 'Premium baby care, toys, and essentials for new parents.',
  },
  {
    name: 'TeenVibe',
    slug: 'teenvibe',
    target_demographic: 'Teens and young adults (13-22 years)',
    description: 'Trendy fashion, accessories, and lifestyle products for the teen generation.',
  },
  {
    name: 'FitGen',
    slug: 'fitgen',
    target_demographic: 'Fitness-focused adults (22-40 years)',
    description: 'Workout gear, supplements, and fitness apparel for active individuals.',
  },
  {
    name: 'GlowSkin',
    slug: 'glowskin',
    target_demographic: 'Skincare-conscious adults (25-45 years)',
    description: 'Premium skincare and beauty products for daily wellness routines.',
  },
  {
    name: 'SilverCare',
    slug: 'silvercare',
    target_demographic: 'Adults 50+ (wellness and senior care)',
    description: 'Health, wellness, and lifestyle products designed for active aging.',
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'brands',
      BRANDS.map((brand) => ({ ...brand, created_at: now, updated_at: now }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('brands', null, {});
  },
};
