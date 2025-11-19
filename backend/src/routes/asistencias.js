const express = require('express');
const router = express.Router();
const asistenciasController = require('../controllers/asistenciasController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas protegiadas por JWT
router.use(authMiddleware);

// GET /asistencias?fecha=YYYY-MM-DD  -> busca asistencias por fecha
router.get('/', asistenciasController.getAll);

// GET /asistencias/:vendedoraId/:periodo  -> periodo YYYY-MM
router.get('/:vendedoraId/:periodo', asistenciasController.getByVendedoraPeriodo);

// POST /asistencias  -> crear asistencia individual
router.post('/', asistenciasController.create);

// POST /asistencias/bulk -> crear asistencias masivas
router.post('/bulk', asistenciasController.bulkCreate);

// PUT /asistencias/:id -> actualizar asistencia
router.put('/:id', asistenciasController.update);

module.exports = router;
