const fs = require('fs');
const path = require('path');

const REPORTES_FILE = path.join(__dirname, '../../data/reportes.json');

// Asegurar que el directorio existe
const ensureDataDir = () => {
  const dataDir = path.dirname(REPORTES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Leer reportes del archivo JSON
const leerReportes = () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(REPORTES_FILE)) {
      return [];
    }
    const contenido = fs.readFileSync(REPORTES_FILE, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('Error al leer reportes:', error);
    return [];
  }
};

// Guardar reportes en el archivo JSON
const guardarReportes = (reportes) => {
  try {
    ensureDataDir();
    fs.writeFileSync(REPORTES_FILE, JSON.stringify(reportes, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar reportes:', error);
    return false;
  }
};

// Agregar un nuevo reporte
const agregarReporte = (nombre, tipo, tamaño, filtros = {}) => {
  const reportes = leerReportes();
  const nuevoReporte = {
    id: Date.now().toString(), // ID único basado en timestamp
    nombre,
    tipo, // 'ventas' o 'gastos'
    tamaño,
    fechaCreacion: new Date().toISOString(),
    filtros, // Objeto con filtros aplicados (ej: { fechaInicio, fechaFin, dias })
  };
  
  reportes.unshift(nuevoReporte); // Agregar al inicio
  guardarReportes(reportes);
  return nuevoReporte;
};

// Obtener todos los reportes
const obtenerReportes = () => {
  return leerReportes();
};

// Eliminar un reporte por ID
const eliminarReporte = (id) => {
  const reportes = leerReportes();
  const filtrados = reportes.filter(r => r.id !== id);
  guardarReportes(filtrados);
  return filtrados.length < reportes.length; // Retorna true si se eliminó
};

module.exports = {
  agregarReporte,
  obtenerReportes,
  eliminarReporte,
};

