'use strict';

const { Router } = require('express');
const eventController = require('../controllers/eventController');

const router = Router();

router.post('/', eventController.ingest);
router.post('/bulk', eventController.ingestBulk);

module.exports = router;
