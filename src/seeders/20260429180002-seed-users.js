'use strict';

const { faker } = require('@faker-js/faker');

const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];
const ACQUISITION_SOURCES = ['organic', 'paid_search', 'social', 'referral', 'email_campaign'];

// Spread users across life stages so each brand has a natural target audience
const AGE_DISTRIBUTION = [
  { count: 15, minAge: 16, maxAge: 22 }, // teens → TeenVibe
  { count: 25, minAge: 23, maxAge: 35 }, // young adults / new parents → BabyBliss / FitGen
  { count: 25, minAge: 28, maxAge: 45 }, // mid-life → GlowSkin / FitGen
  { count: 20, minAge: 35, maxAge: 50 }, // mid-late → GlowSkin / SilverCare
  { count: 15, minAge: 50, maxAge: 75 }, // seniors → SilverCare
];

const sanitize = (s) => s.toLowerCase().replace(/[^a-z]/g, '');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    faker.seed(42); // deterministic seed data

    const now = new Date();
    const users = [];
    let index = 0;

    for (const bucket of AGE_DISTRIBUTION) {
      for (let i = 0; i < bucket.count; i++) {
        index++;
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const dob = faker.date.birthdate({
          min: bucket.minAge,
          max: bucket.maxAge,
          mode: 'age',
        });

        users.push({
          email: `${sanitize(firstName)}.${sanitize(lastName)}.${index}@example.com`,
          phone: `+91${faker.string.numeric(10)}`,
          first_name: firstName,
          last_name: lastName,
          gender: faker.helpers.arrayElement(GENDERS),
          date_of_birth: dob.toISOString().split('T')[0],
          city: faker.location.city(),
          country: faker.location.country(),
          acquisition_source: faker.helpers.arrayElement(ACQUISITION_SOURCES),
          created_at: now,
          updated_at: now,
        });
      }
    }

    await queryInterface.bulkInsert('users', users);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
