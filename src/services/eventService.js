'use strict';

const { StatusCodes } = require('http-status-codes');
const { sequelize } = require('../models');
const eventRepository = require('../repositories/eventRepository');
const userRepository = require('../repositories/userRepository');
const brandRepository = require('../repositories/brandRepository');
const userBrandRepository = require('../repositories/userBrandRepository');
const AppError = require('../utils/AppError');

const VALID_EVENT_TYPES = [
  'purchase',
  'app_open',
  'content_view',
  'add_to_cart',
  'click',
  'page_view',
  'product_view',
];

const MAX_BULK_EVENTS = 1000;

const validateEventShape = (e, idx = null) => {
  const errs = [];
  if (e === null || typeof e !== 'object' || Array.isArray(e)) {
    errs.push('event must be a JSON object');
    return errs;
  }
  if (!e.user_id) errs.push('user_id is required');
  if (!e.brand_id) errs.push('brand_id is required');
  if (!e.event_type) errs.push('event_type is required');
  if (e.event_type && !VALID_EVENT_TYPES.includes(e.event_type)) {
    errs.push(`event_type must be one of: ${VALID_EVENT_TYPES.join(', ')}`);
  }
  if (e.event_type === 'purchase' && (e.amount === undefined || e.amount === null)) {
    errs.push('amount is required when event_type is "purchase"');
  }
  if (e.amount !== undefined && e.amount !== null && Number(e.amount) < 0) {
    errs.push('amount must be non-negative');
  }
  if (e.occurred_at && Number.isNaN(Date.parse(e.occurred_at))) {
    errs.push('occurred_at must be a valid date string');
  }
  return errs;
};

const buildEventRow = (e) => ({
  user_id: e.user_id,
  brand_id: e.brand_id,
  event_type: e.event_type,
  amount: e.amount ?? null,
  payload: e.payload ?? null,
  occurred_at: e.occurred_at ? new Date(e.occurred_at) : new Date(),
});

const ingestEvent = async (data) => {
  const errs = validateEventShape(data);
  if (errs.length) {
    throw new AppError(`Validation failed: ${errs.join('; ')}`, StatusCodes.BAD_REQUEST);
  }

  return sequelize.transaction(async (t) => {
    const user = await userRepository.findById(data.user_id, { transaction: t });
    if (!user) throw new AppError(`User not found: ${data.user_id}`, StatusCodes.NOT_FOUND);

    const brand = await brandRepository.findById(data.brand_id, { transaction: t });
    if (!brand) throw new AppError(`Brand not found: ${data.brand_id}`, StatusCodes.NOT_FOUND);

    let assoc = await userBrandRepository.findByUserAndBrand(data.user_id, data.brand_id, {
      transaction: t,
    });

    let autoLinked = false;
    if (!assoc) {
      console.log(
        `[event] Auto-linking user ${data.user_id} to brand ${data.brand_id} (first event)`
      );
      assoc = await userBrandRepository.create(
        {
          user_id: data.user_id,
          brand_id: data.brand_id,
          registered_at: new Date(),
          acquisition_source: 'event_ingestion',
          is_active: true,
        },
        { transaction: t }
      );
      autoLinked = true;
    } else if (!assoc.is_active) {
      console.log(
        `[event] Reactivating user ${data.user_id} → brand ${data.brand_id} (was soft-unlinked)`
      );
      await userBrandRepository.setActive(assoc, true, { transaction: t });
    }

    const event = await eventRepository.create(buildEventRow(data), { transaction: t });
    return { event, autoLinked };
  });
};

const ingestBulk = async (rawEvents) => {
  if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
    throw new AppError('events must be a non-empty array', StatusCodes.BAD_REQUEST);
  }
  if (rawEvents.length > MAX_BULK_EVENTS) {
    throw new AppError(
      `Bulk ingest limited to ${MAX_BULK_EVENTS} events per request`,
      StatusCodes.BAD_REQUEST
    );
  }

  // Validate shape of each event
  const validationErrors = [];
  rawEvents.forEach((e, i) => {
    const errs = validateEventShape(e, i);
    if (errs.length) validationErrors.push({ index: i, errors: errs });
  });
  if (validationErrors.length) {
    const err = new AppError(
      `Validation failed for ${validationErrors.length} event(s)`,
      StatusCodes.BAD_REQUEST
    );
    err.details = validationErrors;
    throw err;
  }

  const userIds = [...new Set(rawEvents.map((e) => Number(e.user_id)))];
  const brandIds = [...new Set(rawEvents.map((e) => Number(e.brand_id)))];

  return sequelize.transaction(async (t) => {
    // Verify all users exist
    const users = await userRepository.findByIds(userIds, { transaction: t });
    if (users.length !== userIds.length) {
      const found = new Set(users.map((u) => u.id));
      const missing = userIds.filter((id) => !found.has(id));
      throw new AppError(`User(s) not found: ${missing.join(', ')}`, StatusCodes.NOT_FOUND);
    }

    // Verify all brands exist
    const brands = await brandRepository.findByIds(brandIds, { transaction: t });
    if (brands.length !== brandIds.length) {
      const found = new Set(brands.map((b) => b.id));
      const missing = brandIds.filter((id) => !found.has(id));
      throw new AppError(`Brand(s) not found: ${missing.join(', ')}`, StatusCodes.NOT_FOUND);
    }

    // Resolve all (user, brand) pairs — auto-link missing ones
    const distinctPairs = [
      ...new Set(rawEvents.map((e) => `${e.user_id}:${e.brand_id}`)),
    ].map((p) => p.split(':').map(Number));

    const existing = await userBrandRepository.findByPairs(distinctPairs, {
      transaction: t,
    });
    const existingKey = new Set(existing.map((a) => `${a.user_id}:${a.brand_id}`));

    // Reactivate any that were soft-unlinked
    const toReactivate = existing.filter((a) => !a.is_active);
    for (const a of toReactivate) {
      await userBrandRepository.setActive(a, true, { transaction: t });
    }

    const missingPairs = distinctPairs.filter(
      ([uid, bid]) => !existingKey.has(`${uid}:${bid}`)
    );
    if (missingPairs.length) {
      console.log(
        `[event] Bulk auto-link: creating ${missingPairs.length} new user-brand association(s)`
      );
      const now = new Date();
      await userBrandRepository.bulkCreate(
        missingPairs.map(([uid, bid]) => ({
          user_id: uid,
          brand_id: bid,
          registered_at: now,
          acquisition_source: 'event_ingestion',
          is_active: true,
        })),
        { transaction: t }
      );
    }

    const rows = rawEvents.map(buildEventRow);
    const created = await eventRepository.bulkCreate(rows, { transaction: t });

    return {
      inserted: created.length,
      auto_linked_associations: missingPairs.length,
      reactivated_associations: toReactivate.length,
    };
  });
};

const listUserEvents = async (userId, { page, limit, filters }) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError(`User not found: ${userId}`, StatusCodes.NOT_FOUND);
  return eventRepository.findByUser(userId, { page, limit, filters });
};

module.exports = { ingestEvent, ingestBulk, listUserEvents };
