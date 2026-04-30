const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError');
const { errorResponse } = require('../utils/responses');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, StatusCodes.NOT_FOUND));
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(errorResponse(err.details || null, err.message));
  }

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(errorResponse(null, 'Invalid JSON in request body'));
  }

  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(errorResponse(details, 'Validation failed'));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res
      .status(StatusCodes.CONFLICT)
      .json(errorResponse(details, 'Resource conflict (duplicate value)'));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(errorResponse(null, 'Invalid reference: related record does not exist'));
  }

  console.error('[Unexpected error]', err);
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json(errorResponse(null, 'Internal server error'));
};

module.exports = { notFoundHandler, errorHandler };
