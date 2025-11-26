// Cliente Prisma compartido para todo el backend
const { PrismaClient } = require('./generated/prisma');

// Crear una única instancia para evitar múltiples conexiones en desarrollo
const prisma = new PrismaClient();

module.exports = prisma;
