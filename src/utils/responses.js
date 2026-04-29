const successResponse = (data = null, message = 'Request successful') => ({
  success: true,
  message,
  data,
  error: null,
});

const errorResponse = (error = null, message = 'Something went wrong') => ({
  success: false,
  message,
  data: null,
  error,
});

module.exports = { successResponse, errorResponse };
