const express = require("express");
const cors = require("cors");
const ventasRouter = require("./routes/ventas"); // ruta correcta
const app = express();
const gastosRouter = require("./routes/gastos");

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// Rutas
app.use("/ventas", ventasRouter);

app.use("/gastos", gastosRouter);

app.listen(3001, () => console.log("Servidor corriendo en puerto 3001"));

