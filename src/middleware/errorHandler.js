const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError');
const { errorResponse } = require('../utils/responses');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, StatusCodes.NOT_FOUND));
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse(null, err.message));
  }
  console.error('[Unexpected error]', err);
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json(errorResponse(null, 'Internal server error'));
};

module.exports = { notFoundHandler, errorHandler };
