<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const liquidacionesController = require('../controllers/liquidacionesController');
const authMiddleware = require('../middlewares/authMiddleware');
const prisma = require('../prismaClient'); // Necesitamos prisma para buscar la data
const { validar } = require('../middlewares/validationMiddleware');
const { liquidacionGenerarSchema } = require('../utils/validators');

router.use(authMiddleware);


// POST /liquidaciones/generar  { periodo: 'YYYY-MM' }
router.post('/generar', validar(liquidacionGenerarSchema, 'body'), liquidacionesController.generarPeriodo);

// GET /liquidaciones?v periodo=YYYY-MM
router.get('/', liquidacionesController.getByPeriodo);

// GET /liquidaciones/:vendedoraId/:periodo
router.get('/:vendedoraId/:periodo', liquidacionesController.getByVendedoraPeriodo);

// PUT /liquidaciones/:id/pagar -> marcar como pagada
router.put('/:id/pagar', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuarioId = req.user?.id || null;

    // 1. Obtener la liquidación antes de actualizarla para saber el monto
    const liquidacion = await prisma.liquidacion.findUnique({
      where: { id },
      include: { vendedora: true } // Para poner el nombre en la descripción
    });

    if (!liquidacion) {
      return res.status(404).json({ error: 'Liquidación no encontrada' });
    }

    if (liquidacion.estado === 'pagada') {
      return res.status(400).json({ error: 'Esta liquidación ya fue pagada' });
    }

    // 2. Marcar como pagada
    const repo = require('../repositories/liquidacionesRepository');
    const updated = await repo.updateEstado(id, 'pagada', usuarioId);

    // 3. CREAR EL GASTO AUTOMÁTICAMENTE
    const gastosRepo = require('../repositories/gastosRepository');

     const hoy = new Date();
    // Forzamos la fecha a medianoche UTC para que coincida con el filtro "Hoy"
    const fechaNormalizada = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));

    await gastosRepo.create({
      fecha: fechaNormalizada, // Usamos la fecha normalizada
      monto: Number(liquidacion.total_pagar),
      categoria: 'Fijo', 
      descripcion: `Liquidación sueldo: ${liquidacion.vendedora.nombre} - Período ${liquidacion.periodo}`,
      periodo: liquidacion.periodo,
      creado_por: usuarioId
    });

    res.json({ mensaje: 'Liquidación pagada y gasto registrado', liquidacion: updated });

  } catch (e) {
    console.error('Error marcar liquidacion pagada:', e);
    res.status(500).json({ error: 'Error al marcar liquidación como pagada' });
  }
});

module.exports = router;

=======
const express = require("express");
const router = express.Router();
const { obtenerLiquidaciones, exportarLiquidacionesExcel } = require("../controllers/liquidacionesController");

router.get("/", obtenerLiquidaciones);
router.get("/excel", exportarLiquidacionesExcel);

module.exports = router;
>>>>>>> origin/franrama
