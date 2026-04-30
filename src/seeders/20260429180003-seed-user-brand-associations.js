'use strict';

const { faker } = require('@faker-js/faker');

const ACQUISITION_SOURCES = ['organic', 'paid_search', 'social', 'referral', 'email_campaign'];

// Distribution: how many brands does each user belong to?
const BRAND_COUNT_DISTRIBUTION = [
  { count: 30, brandCount: 1 },
  { count: 50, brandCount: 2 },
  { count: 20, brandCount: 3 },
];

function ageInYears(dob) {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function primaryBrandSlugForAge(age) {
  if (age <= 22) return 'teenvibe';
  if (age <= 35) return faker.helpers.arrayElement(['babybliss', 'fitgen']);
  if (age <= 50) return faker.helpers.arrayElement(['glowskin', 'fitgen']);
  return 'silvercare';
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    faker.seed(101);
    const sequelize = queryInterface.sequelize;

    const users = await sequelize.query(
      'SELECT id, date_of_birth FROM users ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    const brands = await sequelize.query('SELECT id, slug FROM brands', {
      type: sequelize.QueryTypes.SELECT,
    });

    const brandIdBySlug = {};
    brands.forEach((b) => {
      brandIdBySlug[b.slug] = b.id;
    });

    const associations = [];
    let userPos = 0;

    for (const dist of BRAND_COUNT_DISTRIBUTION) {
      for (let i = 0; i < dist.count && userPos < users.length; i++) {
        const user = users[userPos++];
        const age = ageInYears(user.date_of_birth);
        const slugs = new Set([primaryBrandSlugForAge(age)]);

        while (slugs.size < dist.brandCount) {
          slugs.add(faker.helpers.arrayElement(brands).slug);
        }

        for (const slug of slugs) {
          const registeredAt = faker.date.past({ years: 1.5 });
          associations.push({
            user_id: user.id,
            brand_id: brandIdBySlug[slug],
            registered_at: registeredAt,
            acquisition_source: faker.helpers.arrayElement(ACQUISITION_SOURCES),
            is_active: faker.helpers.weightedArrayElement([
              { weight: 95, value: true },
              { weight: 5, value: false },
            ]),
            created_at: registeredAt,
            updated_at: registeredAt,
          });
        }
      }
    }

    await queryInterface.bulkInsert('user_brand_associations', associations);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_brand_associations', null, {});
  },
};
