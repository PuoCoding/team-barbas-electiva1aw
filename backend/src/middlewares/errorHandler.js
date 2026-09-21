const logger = require('../utils/logger');
const { sendError } = require('../utils/response.util');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  sendError(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : null);
};

module.exports = errorHandler;
