const InscripcionesService = require('./inscripciones.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

exports.getAll = async (req, res, next) => {
  try {
    const docs = await InscripcionesService.getAll();
    return sendSuccess(res, 200, 'All inscripciones', docs);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const doc = await InscripcionesService.getById(req.params.id);
    if (!doc) return sendError(res, 404, 'Inscripcion not found');
    return sendSuccess(res, 200, 'Inscripcion detail', doc);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const doc = await InscripcionesService.create(req.body);
    return sendSuccess(res, 201, 'Inscripcion created', doc);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const doc = await InscripcionesService.update(req.params.id, req.body);
    return sendSuccess(res, 200, 'Inscripcion updated', doc);
  } catch (err) {
    if (err.message === 'Inscripcion not found') return sendError(res, 404, err.message);
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await InscripcionesService.delete(req.params.id);
    return sendSuccess(res, 200, 'Inscripcion deleted', result);
  } catch (err) {
    if (err.message === 'Inscripcion not found') return sendError(res, 404, err.message);
    next(err);
  }
};

exports.getByMatricula = async (req, res, next) => {
  try {
    const doc = await require('./inscripciones.model').findOne({ 'data.matricula': req.params.matricula }).lean();
    if (!doc) return sendError(res, 404, 'Inscripcion not found for this matricula');
    return sendSuccess(res, 200, 'Inscripcion detail', doc);
  } catch (err) {
    next(err);
  }
};
