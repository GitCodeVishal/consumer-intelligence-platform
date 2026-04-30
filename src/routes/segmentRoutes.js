'use strict';

const { Router } = require('express');
const segmentController = require('../controllers/segmentController');

const router = Router();

router.get('/', segmentController.list);
router.post('/evaluate', segmentController.evaluateAll);
router.post('/:key/evaluate', segmentController.evaluateOne);
router.get('/:key/users', segmentController.members);

module.exports = router;
