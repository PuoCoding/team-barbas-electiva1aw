const { sendSuccess, sendError } = require('../../utils/response.util');
const BlockchainService = require('./blockchain.service');
const mongoose = require('mongoose');

// Helper to get mongoose model based on module name
const getModel = (modulo) => {
  const models = {
    'pagos': mongoose.models.Pago,
    'certificados': mongoose.models.Certificado,
    'inscripciones': mongoose.models.Inscripcion
  };
  return models[modulo.toLowerCase()];
};

exports.validateChain = async (req, res, next) => {
  try {
    const { modulo } = req.params;
    const Model = getModel(modulo);
    
    if (!Model) return sendError(res, 400, `Module ${modulo} not supported`);
    
    // Fetch chain sorted by index
    const chain = await Model.find().sort({ index: 1 }).lean();
    
    const isValid = BlockchainService.isValidChain(chain);
    
    return sendSuccess(res, 200, `Chain validation for ${modulo}`, { isValid });
  } catch (err) {
    next(err);
  }
};

exports.syncChain = async (req, res, next) => {
  try {
    const { modulo } = req.params;
    const { chain } = req.body;
    
    if (!chain || !Array.isArray(chain)) {
      return sendError(res, 400, 'Invalid chain data');
    }

    const Model = getModel(modulo);
    if (!Model) return sendError(res, 400, `Module ${modulo} not supported`);

    // Verify incoming chain
    if (!BlockchainService.isValidChain(chain)) {
      return sendError(res, 400, 'Incoming chain is invalid or corrupted');
    }

    // Replace chain in DB
    await Model.deleteMany({});
    const inserted = await Model.insertMany(chain);

    return sendSuccess(res, 200, `Chain synced successfully for ${modulo}`, {
      count: inserted.length
    });
  } catch (err) {
    next(err);
  }
};
