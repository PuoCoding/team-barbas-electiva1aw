const express = require('express');
const router = express.Router();
const controller = require('./inscripciones.controller');
const validateRequest = require('../../middlewares/validateRequest');
const { inscripcionSchema } = require('./inscripciones.validator');

router.get('/matricula/:matricula', controller.getByMatricula);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(inscripcionSchema), controller.create);
router.put('/:id', validateRequest(inscripcionSchema), controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
