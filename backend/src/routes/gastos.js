const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Funciones auxiliares
const obtenerFechaHoy = () => new Date().toISOString().split("T")[0];
const obtenerHoraActual = () => new Date().toTimeString().split(" ")[0];

// Carpeta donde se guardan los JSON
const rutaGastos = path.join(process.cwd(), "gastos_data");

if (!fs.existsSync(rutaGastos)) {
  fs.mkdirSync(rutaGastos, { recursive: true });
  console.log("Carpeta creada:", rutaGastos);
} else {
  console.log("Carpeta existente:", rutaGastos);
}

// 📄 Obtener gastos del día
router.get("/hoy", (req, res) => {
  const archivoHoy = path.join(rutaGastos, `gastos_${obtenerFechaHoy()}.json`);
  let gastosHoy = [];
  if (fs.existsSync(archivoHoy)) {
    gastosHoy = JSON.parse(fs.readFileSync(archivoHoy));
  }

  const totalHoy = gastosHoy.reduce((acc, g) => acc + g.monto, 0);

  res.json({
    gastosHoy,
    totalHoy,
    cantidadHoy: gastosHoy.length,
  });
});

// ➕ Registrar nuevos gastos
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
  console.log("Gastos guardados en:", archivoHoy);

  const totalHoy = gastosHoy.reduce((acc, g) => acc + g.monto, 0);

  res.json({
    mensaje: "Gastos registrados correctamente.",
    gastosHoy,
    totalHoy,
    cantidadHoy: gastosHoy.length,
  });
});

// 🔄 Reiniciar gastos del día
router.delete("/reiniciar", (req, res) => {
  const archivoHoy = path.join(rutaGastos, `gastos_${obtenerFechaHoy()}.json`);

  fs.writeFileSync(archivoHoy, "[]");
  console.log("Gastos del día reiniciados:", archivoHoy);

  res.json({ mensaje: "Gastos del día reiniciados correctamente." });
});

module.exports = router;
