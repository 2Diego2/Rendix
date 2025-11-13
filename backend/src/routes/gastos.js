const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Funciones auxiliares
const obtenerFechaISO = (fecha) => fecha.toISOString().split("T")[0];
const obtenerFechaHoy = () => obtenerFechaISO(new Date());
const obtenerHoraActual = () => new Date().toTimeString().split(" ")[0];

// Carpeta donde se guardan los JSON
const rutaGastos = path.join(process.cwd(), "gastos_data");

if (!fs.existsSync(rutaGastos)) {
  fs.mkdirSync(rutaGastos, { recursive: true });
}

//  Obtener gastos por rango de días
router.get("/rango", (req, res) => {
  // Por defecto, 30 días. req.query.dias viene de la URL (ej: /rango?dias=7)
  const dias = parseInt(req.query.dias) || 30;
  
  let todosLosGastos = [];
  
  // Leemos los archivos de los últimos 'dias' días
  for (let i = 0; i < dias; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    const fechaISO = obtenerFechaISO(fecha);
    
    const archivoDia = path.join(rutaGastos, `gastos_${fechaISO}.json`);
    
    if (fs.existsSync(archivoDia)) {
      try {
        const gastosDia = JSON.parse(fs.readFileSync(archivoDia));
        // Añadimos los gastos de ese día al array total
        todosLosGastos.push(...gastosDia); 
      } catch (e) {
        console.error(`Error al leer el archivo ${archivoDia}:`, e);
      }
    }
  }

  // Devolvemos la misma estructura que /hoy
  const total = todosLosGastos.reduce((acc, g) => acc + Number(g.monto || 0), 0);
  res.json({
    gastosHoy: todosLosGastos, // Enviamos todos los gastos en la misma propiedad
    totalHoy: total,
    cantidadHoy: todosLosGastos.length,
  });
});


// 📄 Obtener gastos del día 
router.get("/hoy", (req, res) => {
  const archivoHoy = path.join(rutaGastos, `gastos_${obtenerFechaHoy()}.json`);
  let gastosHoy = [];
  if (fs.existsSync(archivoHoy)) {
    try {
      gastosHoy = JSON.parse(fs.readFileSync(archivoHoy));
    } catch (e) {
      console.error(`Error al leer el archivo ${archivoHoy}:`, e);
    }
  }

  const totalHoy = gastosHoy.reduce((acc, g) => acc + Number(g.monto || 0), 0);

  res.json({
    gastosHoy,
    totalHoy,
    cantidadHoy: gastosHoy.length,
  });
});

// Registrar nuevos gastos 
router.post("/", (req, res) => {
  const nuevosGastos = req.body;

  if (!Array.isArray(nuevosGastos) || nuevosGastos.length === 0)
    return res.status(400).json({ error: "Debe incluir al menos un gasto válido." });

  const archivoHoy = path.join(rutaGastos, `gastos_${obtenerFechaHoy()}.json`);
  let gastosHoy = [];
  if (fs.existsSync(archivoHoy)) {
    gastosHoy = JSON.parse(fs.readFileSync(archivoHoy));
  }

  nuevosGastos.forEach((g) => {
    gastosHoy.push({
      hora: obtenerHoraActual(),
      ...g,
    });
  });

  fs.writeFileSync(archivoHoy, JSON.stringify(gastosHoy, null, 2));
  
  const totalHoy = gastosHoy.reduce((acc, g) => acc + g.monto, 0);

  // Devolvemos los gastos de HOY, no el histórico
  res.json({
    mensaje: "Gastos registrados correctamente.",
    gastosHoy,
    totalHoy,
    cantidadHoy: gastosHoy.length,
  });
});

// 🔄 Reiniciar gastos del día (sin cambios)
router.delete("/reiniciar", (req, res) => {
  const archivoHoy = path.join(rutaGastos, `gastos_${obtenerFechaHoy()}.json`);

  fs.writeFileSync(archivoHoy, "[]");
  console.log("Gastos del día reiniciados:", archivoHoy);

  res.json({ mensaje: "Gastos del día reiniciados correctamente." });
});

module.exports = router;
