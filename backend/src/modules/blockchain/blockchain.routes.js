const express = require('express');
const router = express.Router();
const blockchainController = require('./blockchain.controller');

// Blockchain generic endpoints
router.get('/:modulo/validate', blockchainController.validateChain);
router.post('/:modulo/sync', blockchainController.syncChain);

module.exports = router;
