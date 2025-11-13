const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const obtenerFechaHoy = () => new Date().toISOString().split("T")[0];
const obtenerHoraActual = () => new Date().toTimeString().split(" ")[0];
const obtenerFechaISO = (fecha) => fecha.toISOString().split("T")[0];


const rutaVentas = path.join(process.cwd(), "ventas_data");; // carpeta donde se guardan los json

if (!fs.existsSync(rutaVentas)) {
  fs.mkdirSync(rutaVentas, { recursive: true });
  console.log("Carpeta creada:", rutaVentas);
} else {
  console.log("Carpeta existente:", rutaVentas);
}

router.get("/hoy", (req, res) => {
  const archivoHoy = path.join(rutaVentas, `ventas_${obtenerFechaHoy()}.json`);
  let ventasHoy = [];
  if (fs.existsSync(archivoHoy)) {
    ventasHoy = JSON.parse(fs.readFileSync(archivoHoy));
  }

  const totalHoy = ventasHoy.reduce((acc, v) => acc + v.totalVenta, 0);

  res.json({
    ventasHoy,
    totalHoy,
    cantidadHoy: ventasHoy.length,
  });
});

router.post("/", (req, res) => {
  const { productos } = req.body;
  if (!productos || productos.length === 0)
    return res.status(400).json({ error: "Debe incluir productos" });

  const totalVenta = productos.reduce((sum, p) => sum + p.cantidad * p.precio, 0);
  const nuevaVenta = {
    hora: obtenerHoraActual(),
    productos,
    totalVenta,
  };

  const archivoHoy = path.join(rutaVentas, `ventas_${obtenerFechaHoy()}.json`);
  let ventasHoy = [];
  if (fs.existsSync(archivoHoy)) {
    ventasHoy = JSON.parse(fs.readFileSync(archivoHoy));
  }
  ventasHoy.push(nuevaVenta);

  fs.writeFileSync(archivoHoy, JSON.stringify(ventasHoy, null, 2)); // guarda con formato legible
  console.log("Archivo guardado:", archivoHoy);
  
  const totalHoy = ventasHoy.reduce((acc, v) => acc + v.totalVenta, 0);

  res.json({
    mensaje: "Venta registrada con éxito",
    ventasHoy,
    totalHoy,
    cantidadHoy: ventasHoy.length,
  });
});

// Obtener ventas por rango de días
router.get("/rango", (req, res) => {
  const dias = parseInt(req.query.dias) || 30;
  
  let todasLasVentas = [];
  
  for (let i = 0; i < dias; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    const fechaISO = obtenerFechaISO(fecha);
    
    const archivoDia = path.join(rutaVentas, `ventas_${fechaISO}.json`);
    
    if (fs.existsSync(archivoDia)) {
      try {
        const ventasDia = JSON.parse(fs.readFileSync(archivoDia));
        todasLasVentas.push(...ventasDia);
      } catch (e) {
        console.error(`Error al leer el archivo ${archivoDia}:`, e);
      }
    }
  }

  const total = todasLasVentas.reduce((acc, v) => acc + v.totalVenta, 0);
  res.json({
    ventasHoy: todasLasVentas, // Usamos la misma propiedad 'ventasHoy'
    totalHoy: total,
    cantidadHoy: todasLasVentas.length,
  });
});


module.exports = router;
