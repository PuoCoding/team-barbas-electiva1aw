const CertificadosService = require('./certificados.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

exports.getAll = async (req, res, next) => {
  try {
    const docs = await CertificadosService.getAll();
    return sendSuccess(res, 200, 'All certificados', docs);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const doc = await CertificadosService.getById(req.params.id);
    if (!doc) return sendError(res, 404, 'Certificado not found');
    return sendSuccess(res, 200, 'Certificado detail', doc);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const doc = await CertificadosService.create(req.body);
    return sendSuccess(res, 201, 'Certificado created', doc);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const doc = await CertificadosService.update(req.params.id, req.body);
    return sendSuccess(res, 200, 'Certificado updated', doc);
  } catch (err) {
    if (err.message === 'Certificado not found') return sendError(res, 404, err.message);
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await CertificadosService.delete(req.params.id);
    return sendSuccess(res, 200, 'Certificado deleted', result);
  } catch (err) {
    if (err.message === 'Certificado not found') return sendError(res, 404, err.message);
    next(err);
  }
};

exports.verifyHash = async (req, res, next) => {
  try {
    const doc = await require('./certificados.model').findOne({ hash: req.params.hash }).lean();
    if (!doc) return sendError(res, 404, 'Certificado not verified (invalid hash)');
    return sendSuccess(res, 200, 'Certificado verified successfully', doc);
  } catch (err) {
    next(err);
  }
};
