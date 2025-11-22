import pool from "../db.js"; 

// Registrar una venta con varios productos
export const registrarVenta = async (req, res) => {
  try {
    const { productos, vendedora_id } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "No se enviaron productos" });
    }

    // Total de venta
    const total = productos.reduce(
      (acc, p) => acc + Number(p.precio) * Number(p.cantidad),
      0
    );

    // Insertar venta principal
    const [venta] = await pool.query(
      `INSERT INTO ventas (vendedora_id, total) VALUES (?, ?)`,
      [vendedora_id || null, total]
    );

    const ventaId = venta.insertId;

    // Insertar items de la venta
    for (const p of productos) {
      await pool.query(
        `INSERT INTO ventas_items (venta_id, descripcion, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [ventaId, p.nombre, p.cantidad, p.precio]
      );
    }

    res.json({ message: "Venta registrada", id: ventaId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar venta" });
  }
};

// Obtener ventas de hoy
export const obtenerVentasHoy = async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT v.id, v.total, v.fecha, v.hora, v.ticket_num,
             JSON_OBJECT('id', vd.id, 'nombre', vd.nombre) AS vendedora
      FROM ventas v
      LEFT JOIN vendedoras vd ON v.vendedora_id = vd.id
      WHERE DATE(v.fecha) = CURDATE()
      ORDER BY v.id DESC
    `);

    for (const venta of ventas) {
      const [items] = await pool.query(
        `SELECT descripcion, cantidad, precio_unitario 
         FROM ventas_items 
         WHERE venta_id = ?`,
        [venta.id]
      );
      venta.items = items;
    }

    const totalHoy = ventas.reduce((acc, v) => acc + Number(v.total), 0);

    res.json({
      ventasHoy: ventas,
      totalHoy,
      cantidadHoy: ventas.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};

// Obtener ventas por rango de días
export const obtenerVentasRango = async (req, res) => {
  try {
    const dias = Number(req.query.dias) || 0;

    const [ventas] = await pool.query(
      `
      SELECT v.id, v.total, v.fecha, v.hora, v.ticket_num,
             JSON_OBJECT('id', vd.id, 'nombre', vd.nombre) AS vendedora
      FROM ventas v
      LEFT JOIN vendedoras vd ON v.vendedora_id = vd.id
      WHERE v.fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY v.id DESC
      `,
      [dias]
    );

    for (const venta of ventas) {
      const [items] = await pool.query(
        `SELECT descripcion, cantidad, precio_unitario FROM ventas_items WHERE venta_id = ?`,
        [venta.id]
      );
      venta.items = items;
    }

    const totalHoy = ventas.reduce((acc, v) => acc + Number(v.total), 0);

    res.json({
      ventasHoy: ventas,
      totalHoy,
      cantidadHoy: ventas.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};
