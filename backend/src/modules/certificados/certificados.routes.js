const express = require('express');
const router = express.Router();
const controller = require('./certificados.controller');
const validateRequest = require('../../middlewares/validateRequest');
const { certificadoSchema } = require('./certificados.validator');

router.get('/verificar/:hash', controller.verifyHash);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(certificadoSchema), controller.create);
router.put('/:id', validateRequest(certificadoSchema), controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
