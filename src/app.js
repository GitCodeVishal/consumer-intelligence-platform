const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');

const { successResponse } = require('./utils/responses');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const segmentRoutes = require('./routes/segmentRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res
    .status(StatusCodes.OK)
    .json(successResponse({ status: 'ok' }, 'Service is healthy'));
});

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/segments', segmentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
