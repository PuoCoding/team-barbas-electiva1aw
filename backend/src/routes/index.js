const express = require('express');
const router = express.Router();

const usuariosRoutes = require('../modules/usuarios/usuarios.routes');
const pagosRoutes = require('../modules/pagos/pagos.routes');
const certificadosRoutes = require('../modules/certificados/certificados.routes');
const inscripcionesRoutes = require('../modules/inscripciones/inscripciones.routes');
const blockchainRoutes = require('../modules/blockchain/blockchain.routes');

router.use('/usuarios', usuariosRoutes);
router.use('/pagos', pagosRoutes);
router.use('/certificados', certificadosRoutes);
router.use('/inscripciones', inscripcionesRoutes);
router.use('/blockchain', blockchainRoutes);

module.exports = router;
