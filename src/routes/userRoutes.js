'use strict';

const { Router } = require('express');
const userController = require('../controllers/userController');
const eventController = require('../controllers/eventController');
const segmentController = require('../controllers/segmentController');
const propensityController = require('../controllers/propensityController');

const router = Router();

router.post('/', userController.create);
router.get('/', userController.list);
router.get('/:id', userController.getById);
router.patch('/:id', userController.update);
router.post('/:id/brands', userController.registerBrand);
router.delete('/:id/brands/:brandId', userController.unlinkBrand);
router.get('/:id/events', eventController.listForUser);
router.get('/:id/segments', segmentController.segmentsForUser);
router.get('/:id/propensity', propensityController.get);

module.exports = router;
