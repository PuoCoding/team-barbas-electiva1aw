const express = require('express');
const router = express.Router();
const pagosController = require('./pagos.controller');
const validateRequest = require('../../middlewares/validateRequest');
const { pagoSchema } = require('./pagos.validator');
// const { protect, authorize } = require('../usuarios/auth.middleware');

router.get('/estadisticas', pagosController.getStats);
router.get('/estudiante/:nombre', pagosController.getByEstudiante);
router.get('/mes/:mes', pagosController.getByMes);

router.get('/', pagosController.getAll);
router.get('/:id', pagosController.getById);

router.post('/', validateRequest(pagoSchema), pagosController.create);
router.put('/:id', validateRequest(pagoSchema), pagosController.update);
router.delete('/:id', pagosController.delete);

module.exports = router;
