const { sendError } = require('../utils/response.util');

const notFound = (req, res, next) => {
  sendError(res, 404, `Route not found - ${req.originalUrl}`);
};

module.exports = notFound;
