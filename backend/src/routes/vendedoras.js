const express = require('express');
const router = express.Router();
const vendedorasController = require('../controllers/vendedorasController');
const { validar } = require('../middlewares/validationMiddleware');
const { vendedoraSchema } = require('../utils/validators');

// Rutas CRUD para vendedoras
router.get('/', vendedorasController.getAll);
router.get('/:id', vendedorasController.getById);
router.post('/', validar(vendedoraSchema, 'body'), vendedorasController.create);
router.put('/:id', validar(vendedoraSchema, 'body'), vendedorasController.update);
router.delete('/:id', vendedorasController.delete);

module.exports = router;
