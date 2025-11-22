import express from "express";
import { registrarVenta, obtenerVentasHoy, obtenerVentasRango } from "../controllers/ventas.controller.js";

const router = express.Router();

// Registrar venta
router.post("/", registrarVenta);

// Ventas de hoy
router.get("/hoy", obtenerVentasHoy);

// Ventas por rango
router.get("/rango", obtenerVentasRango);

export default router;
