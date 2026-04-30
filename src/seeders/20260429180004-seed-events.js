'use strict';

const { faker } = require('@faker-js/faker');

const NON_PURCHASE_EVENT_TYPES = [
  { weight: 25, value: 'app_open' },
  { weight: 20, value: 'page_view' },
  { weight: 15, value: 'content_view' },
  { weight: 15, value: 'product_view' },
  { weight: 12, value: 'add_to_cart' },
  { weight: 13, value: 'click' },
];

// Activity profiles distributed across the user base
const PROFILES = [
  { weight: 15, value: { name: 'highly_active', eventCount: [60, 120], purchaseRate: 0.15, recencyBiasDays: 30, maxDaysAgo: 365 } },
  { weight: 50, value: { name: 'regular', eventCount: [30, 70], purchaseRate: 0.10, maxDaysAgo: 365 } },
  { weight: 20, value: { name: 'casual', eventCount: [10, 30], purchaseRate: 0.08, maxDaysAgo: 365 } },
  { weight: 15, value: { name: 'dormant', eventCount: [3, 15], purchaseRate: 0.05, minDaysAgo: 90, maxDaysAgo: 365 } },
];

const BIG_SPENDER_PROBABILITY = 0.10;
const DAY_MS = 24 * 60 * 60 * 1000;

function generatePayload(eventType) {
  switch (eventType) {
    case 'purchase':
      return { product_id: faker.string.uuid(), quantity: faker.number.int({ min: 1, max: 5 }) };
    case 'product_view':
      return { product_id: faker.string.uuid() };
    case 'content_view':
      return {
        content_id: faker.string.uuid(),
        content_type: faker.helpers.arrayElement(['blog', 'video', 'guide']),
      };
    case 'app_open':
      return { device: faker.helpers.arrayElement(['ios', 'android', 'web']) };
    case 'page_view':
      return { url: faker.internet.url() };
    case 'click':
      return { element: faker.helpers.arrayElement(['cta', 'banner', 'menu', 'link']) };
    case 'add_to_cart':
      return { product_id: faker.string.uuid(), quantity: faker.number.int({ min: 1, max: 3 }) };
    default:
      return {};
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    faker.seed(202);
    const sequelize = queryInterface.sequelize;

    const associations = await sequelize.query(
      'SELECT user_id, brand_id, registered_at FROM user_brand_associations WHERE is_active = 1',
      { type: sequelize.QueryTypes.SELECT }
    );

    const userIds = [...new Set(associations.map((a) => a.user_id))];
    const userProfiles = {};
    const userIsBigSpender = {};
    for (const uid of userIds) {
      userProfiles[uid] = faker.helpers.weightedArrayElement(PROFILES);
      userIsBigSpender[uid] = faker.number.float({ min: 0, max: 1 }) < BIG_SPENDER_PROBABILITY;
    }

    const events = [];
    const now = Date.now();

    for (const assoc of associations) {
      const profile = userProfiles[assoc.user_id];
      const isBigSpender = userIsBigSpender[assoc.user_id];
      const totalForUser = faker.number.int({ min: profile.eventCount[0], max: profile.eventCount[1] });
      const eventsForThisAssoc = Math.max(2, Math.floor(totalForUser / 1.5));
      const registeredMs = new Date(assoc.registered_at).getTime();

      for (let i = 0; i < eventsForThisAssoc; i++) {
        let occurredAtMs;
        if (profile.minDaysAgo) {
          occurredAtMs = now - faker.number.int({
            min: profile.minDaysAgo * DAY_MS,
            max: profile.maxDaysAgo * DAY_MS,
          });
        } else if (profile.recencyBiasDays) {
          occurredAtMs = now - faker.number.int({ min: 0, max: profile.recencyBiasDays * DAY_MS });
        } else {
          occurredAtMs = now - faker.number.int({ min: 0, max: profile.maxDaysAgo * DAY_MS });
        }

        if (occurredAtMs < registeredMs) {
          occurredAtMs = registeredMs + faker.number.int({ min: 0, max: 7 * DAY_MS });
        }

        const isPurchase = faker.number.float({ min: 0, max: 1 }) < profile.purchaseRate;
        let eventType;
        let amount = null;

        if (isPurchase) {
          eventType = 'purchase';
          amount = isBigSpender
            ? faker.number.float({ min: 200, max: 600, fractionDigits: 2 })
            : faker.number.float({ min: 10, max: 150, fractionDigits: 2 });
        } else {
          eventType = faker.helpers.weightedArrayElement(NON_PURCHASE_EVENT_TYPES);
        }

        const occurredAt = new Date(occurredAtMs);
        events.push({
          user_id: assoc.user_id,
          brand_id: assoc.brand_id,
          event_type: eventType,
          amount,
          payload: JSON.stringify(generatePayload(eventType)),
          occurred_at: occurredAt,
          created_at: occurredAt,
          updated_at: occurredAt,
        });
      }
    }

    const CHUNK = 1000;
    for (let i = 0; i < events.length; i += CHUNK) {
      await queryInterface.bulkInsert('events', events.slice(i, i + CHUNK));
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('events', null, {});
  },
};
