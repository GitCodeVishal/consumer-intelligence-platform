'use strict';

const { StatusCodes } = require('http-status-codes');
const eventService = require('../services/eventService');
const { successResponse } = require('../utils/responses');

const ingest = async (req, res) => {
  const { event, autoLinked } = await eventService.ingestEvent(req.body);
  res
    .status(StatusCodes.CREATED)
    .json(
      successResponse(
        { event, auto_linked: autoLinked },
        autoLinked
          ? 'Event ingested (user auto-linked to brand)'
          : 'Event ingested'
      )
    );
};

const ingestBulk = async (req, res) => {
  const events = Array.isArray(req.body) ? req.body : req.body.events;
  const result = await eventService.ingestBulk(events);
  res
    .status(StatusCodes.CREATED)
    .json(successResponse(result, 'Bulk events ingested'));
};

const listForUser = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const filters = {
    brand_id: req.query.brand_id ? Number(req.query.brand_id) : undefined,
    event_type: req.query.event_type,
    from: req.query.from,
    to: req.query.to,
  };
  const result = await eventService.listUserEvents(req.params.id, {
    page,
    limit,
    filters,
  });
  res.status(StatusCodes.OK).json(successResponse(result, 'Events fetched'));
};

module.exports = { ingest, ingestBulk, listForUser };
