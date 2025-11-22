const express = require("express");
const cors = require("cors");
require('dotenv').config();

const ventasRouter = require("./routes/ventas");
const gastosRouter = require("./routes/gastos");
const usuariosRouter = require("./routes/usuarios");
const authRouter = require("./routes/auth");
const vendedorasRouter = require("./routes/vendedoras");
const exportRouter = require("./routes/export");
const liquidacionesRouter = require("./routes/liquidaciones");
const reportesRouter = require("./routes/reportes");
const prisma = require('./prismaClient');

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// 🔹 Todas las rutas públicas
app.use("/auth", authRouter);
app.use("/exportar", exportRouter);
app.use("/liquidaciones", liquidacionesRouter);
app.use("/reportes", reportesRouter);
app.use("/vendedoras", vendedorasRouter);
app.use("/ventas", ventasRouter);
app.use("/gastos", gastosRouter);
app.use("/usuarios", usuariosRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

async function testConexion() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL (Prisma)');
  } catch (err) {
    console.error('❌ Error al conectar a PostgreSQL (Prisma)', err);
  }
}

testConexion();

module.exports = prisma;
