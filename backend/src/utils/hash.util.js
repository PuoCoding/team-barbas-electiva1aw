const crypto = require('crypto-js');

/**
 * Generates SHA256 hash using crypto-js (matches frontend logic)
 * @param {string} input - string to hash
 * @returns {string} - hash string
 */
const generateSHA256 = (input) => {
  return crypto.SHA256(input).toString();
};

module.exports = {
  generateSHA256
};
