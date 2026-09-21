const { createHash, mineBlock } = require('./mining.service');
const { MINING_DIFFICULTY } = require('../../config/env');
const logger = require('../../utils/logger');

class BlockchainService {
  /**
   * Validate a given chain array
   */
  static isValidChain(chain) {
    if (!chain || chain.length === 0) return true;

    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      // Format data
      const dataStr = typeof currentBlock.data === 'object' ? JSON.stringify(currentBlock.data) : currentBlock.data;
      const dateStr = typeof currentBlock.date === 'string' ? currentBlock.date : new Date(currentBlock.date).toISOString();

      // Recalculate hash
      const recalculatedHash = createHash(
        currentBlock.index, 
        dateStr, 
        dataStr, 
        currentBlock.previousHash, 
        currentBlock.nonce
      );

      // Check if hash matches
      if (currentBlock.hash !== recalculatedHash) {
        logger.warn(`Block ${currentBlock.index} hash is invalid`);
        return false;
      }

      // Check if previousHash matches
      if (currentBlock.previousHash !== previousBlock.hash) {
        logger.warn(`Block ${currentBlock.index} previousHash is invalid`);
        return false;
      }
    }
    return true;
  }

  /**
   * Remine chain from a specific index
   * Useful when a block is modified or deleted
   */
  static remineFrom(chain, startIndex) {
    logger.info(`Remining chain from index ${startIndex}`);
    
    // Ensure indices are contiguous
    for (let i = 0; i < chain.length; i++) {
      chain[i].index = i;
    }

    // Remine blocks from startIndex
    for (let i = startIndex; i < chain.length; i++) {
      if (i === 0) {
        // Genesis block modification (rare)
        chain[i].previousHash = '';
      } else {
        chain[i].previousHash = chain[i - 1].hash;
      }
      
      // Reset hash and nonce to remine
      chain[i].hash = '';
      chain[i].nonce = 0;
      
      // Mine
      chain[i] = mineBlock(chain[i], MINING_DIFFICULTY);
    }
    
    return chain;
  }
}

module.exports = BlockchainService;
