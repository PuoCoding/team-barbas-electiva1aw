const { generateSHA256 } = require('../../utils/hash.util');
const { MINING_DIFFICULTY } = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Creates a hash for a block based on its properties
 */
const createHash = (index, date, data, previousHash, nonce) => {
  // Convert data to string for consistent hashing with frontend
  const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
  // Convert date to string in case it's a Date object
  const dateStr = typeof date === 'string' ? date : new Date(date).toISOString();
  return generateSHA256(index + dateStr + dataStr + previousHash + nonce);
};

/**
 * Mines a block by finding a hash that starts with the required difficulty
 */
const mineBlock = (block, difficulty = MINING_DIFFICULTY) => {
  let hash = block.hash || '';
  let nonce = block.nonce || 0;
  
  const dateStr = typeof block.date === 'string' ? block.date : new Date(block.date).toISOString();

  // Create an initial hash if none exists
  if (!hash) {
    hash = createHash(block.index, dateStr, block.data, block.previousHash, nonce);
  }

  // Loop until hash starts with the difficulty string (e.g. '00')
  while (!hash.startsWith(difficulty)) {
    nonce++;
    hash = createHash(block.index, dateStr, block.data, block.previousHash, nonce);
  }

  block.nonce = nonce;
  block.hash = hash;
  
  logger.info(`Block ${block.index} mined! Hash: ${block.hash} with nonce: ${block.nonce}`);
  return block;
};

module.exports = {
  createHash,
  mineBlock
};
