/**
 * Script para crear una venta de ejemplo usando el servicio directamente.
 * Ejecutar desde la carpeta `backend`: node scripts/create_venta_ejemplo.js
 */
require('dotenv').config();
const ventasService = require('../src/services/ventasService');
const prisma = require('../src/prismaClient');

async function run() {
  try {
    const payload = {
      vendedora_id: 1,
      items: [
        { descripcion: 'Producto Demo A', cantidad: 2, precio_unitario: 150 },
      ],
      pagos: [
        { metodo_pago: 'efectivo', monto: 300 }
      ]
    };

    const created = await ventasService.crearVenta(payload);
    console.log('Venta creada de ejemplo:', { id: created.id, total: created.total, ticket: created.ticket_num });
  } catch (err) {
    console.error('Error creando venta de ejemplo:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
