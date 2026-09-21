const { sendError } = require('../utils/response.util');

const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[source], { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return sendError(res, 400, 'Validation Error', errorMessages);
    }
    
    next();
  };
};

module.exports = validateRequest;
