/**
 * Script para crear vendedoras de prueba (no-destructivo).
 * Ejecutar: node scripts/seed_vendedoras.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const prisma = require('../src/prismaClient');

async function seed() {
  const vendedoras = [
    { nombre: 'Ana López', codigo: 'V001', sueldo_base: '50000.00', porcentaje_comision: '5.00' },
    { nombre: 'María García', codigo: 'V002', sueldo_base: '55000.00', porcentaje_comision: '6.00' },
    { nombre: 'Lucía Fernández', codigo: 'V003', sueldo_base: '48000.00', porcentaje_comision: '4.50' },
    { nombre: 'Sofía Martínez', codigo: 'V004', sueldo_base: '52000.00', porcentaje_comision: '5.50' },
    { nombre: 'Valentina Díaz', codigo: 'V005', sueldo_base: '51000.00', porcentaje_comision: '5.25' },
  ];

  try {
    for (const v of vendedoras) {
      const existente = await prisma.vendedora.findFirst({ where: { nombre: v.nombre } });
      if (existente) {
        console.log(`Existe: ${v.nombre} (id=${existente.id})`);
      } else {
        const creado = await prisma.vendedora.create({ data: {
          nombre: v.nombre,
          codigo: v.codigo,
          sueldo_base: v.sueldo_base,
          porcentaje_comision: v.porcentaje_comision,
        } });
        console.log(`Creada: ${creado.nombre} (id=${creado.id})`);
      }
    }
  } catch (err) {
    console.error('Error al seedear vendedoras:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
