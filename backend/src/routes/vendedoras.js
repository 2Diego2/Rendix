const express = require('express');
const router = express.Router();
const vendedorasController = require('../controllers/vendedorasController');

// Rutas CRUD para vendedoras
router.get('/', vendedorasController.getAll);
router.get('/:id', vendedorasController.getById);
router.post('/', vendedorasController.create);
router.put('/:id', vendedorasController.update);
router.delete('/:id', vendedorasController.delete);

module.exports = router;
