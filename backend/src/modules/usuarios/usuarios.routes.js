const express = require('express');
const router = express.Router();
const usuariosController = require('./usuarios.controller');
const { protect } = require('./auth.middleware');

router.post('/register', usuariosController.register);
router.post('/login', usuariosController.login);
router.get('/profile', protect, usuariosController.getProfile);

module.exports = router;
