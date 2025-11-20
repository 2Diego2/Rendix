const express = require("express");
const cors = require("cors");
require('dotenv').config();
const ventasRouter = require("./routes/ventas"); // ruta correcta
const gastosRouter = require("./routes/gastos");
const usuariosRouter = require("./routes/usuarios");
const authRouter = require("./routes/auth");
const authMiddleware = require("./middlewares/authMiddleware");
const vendedorasRouter = require("./routes/vendedoras");

const prisma = require('../src/prismaClient');


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Rutas públicas
app.use('/auth', authRouter); // /auth/login

// Middleware de autenticación: a partir de aquí, las rutas quedan protegidas
app.use(authMiddleware);

// Rutas protegidas
app.use("/ventas", ventasRouter);
app.use("/gastos", gastosRouter);
app.use("/usuarios", usuariosRouter);
app.use("/vendedoras", vendedorasRouter);
const asistenciasRouter = require("./routes/asistencias");
app.use("/asistencias", asistenciasRouter);
const liquidacionesRouter = require("./routes/liquidaciones");
app.use("/liquidaciones", liquidacionesRouter);

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

// Middleware de manejo de errores (al final)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

