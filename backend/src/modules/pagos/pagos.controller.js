const PagosService = require('./pagos.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

exports.getAll = async (req, res, next) => {
  try {
    const pagos = await PagosService.getAll();
    return sendSuccess(res, 200, 'All pagos', pagos);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const pago = await PagosService.getById(req.params.id);
    if (!pago) return sendError(res, 404, 'Pago not found');
    return sendSuccess(res, 200, 'Pago detail', pago);
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await PagosService.getStats();
    return sendSuccess(res, 200, 'Pagos statistics', stats);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const pago = await PagosService.create(req.body);
    return sendSuccess(res, 201, 'Pago created', pago);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const pago = await PagosService.update(req.params.id, req.body);
    return sendSuccess(res, 200, 'Pago updated and chain remined', pago);
  } catch (err) {
    if (err.message === 'Pago not found') return sendError(res, 404, err.message);
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await PagosService.delete(req.params.id);
    return sendSuccess(res, 200, 'Pago deleted', result);
  } catch (err) {
    if (err.message === 'Pago not found') return sendError(res, 404, err.message);
    next(err);
  }
};

exports.getByEstudiante = async (req, res, next) => {
  try {
    const pagos = await require('./pagos.model').find({ 'data.estudiante': req.params.nombre }).lean();
    return sendSuccess(res, 200, 'Pagos by estudiante', pagos);
  } catch (err) {
    next(err);
  }
};

exports.getByMes = async (req, res, next) => {
  try {
    const pagos = await require('./pagos.model').find({ 'data.mes': req.params.mes }).lean();
    return sendSuccess(res, 200, 'Pagos by mes', pagos);
  } catch (err) {
    next(err);
  }
};
