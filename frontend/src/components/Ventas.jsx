import React, { useEffect, useState } from "react";
import axios from "axios";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [totalHoy, setTotalHoy] = useState(0);
  const [cantidadHoy, setCantidadHoy] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productos, setProductos] = useState([{ nombre: "", cantidad: 1, precio: "" }]);
  const [loading, setLoading] = useState(false);

  // Cargar ventas del día
  useEffect(() => {
    obtenerVentas();
  }, []);

  const obtenerVentas = async () => {
    try {
      const res = await axios.get("http://localhost:3001/ventas/hoy");
      setVentas(res.data.ventasHoy);
      setTotalHoy(res.data.totalHoy);
      setCantidadHoy(res.data.cantidadHoy);
    } catch (err) {
      console.error("Error al obtener ventas:", err);
    }
  };

  const handleProductoChange = (index, campo, valor) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index][campo] = valor;
    setProductos(nuevosProductos);
  };

  const agregarProducto = () => {
    setProductos([...productos, { nombre: "", cantidad: 1, precio: "" }]);
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = productos.filter((_, i) => i !== index);
    setProductos(nuevosProductos);
  };

  const realizarVenta = async () => {
    const productosValidos = productos.filter(
      (p) => p.nombre.trim() !== "" && p.cantidad > 0 && p.precio > 0
    );

    if (productosValidos.length === 0) {
      alert("Agrega al menos un producto con nombre, cantidad y precio válidos.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3001/ventas", {
        productos: productosValidos,
      });
      setVentas(res.data.ventasHoy);
      setTotalHoy(res.data.totalHoy);
      setCantidadHoy(res.data.cantidadHoy);
      setProductos([{ nombre: "", cantidad: 1, precio: "" }]);
      setMostrarFormulario(false);
    } catch (err) {
      console.error("Error al registrar venta:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        {/* Ticket Promedio / Total del Día */}
        <div className="card">
          <div className="card-header">
            <p className="card-title">Realizar venta</p>
            <h2 className="stat-value">Total del día: ${totalHoy.toFixed(2)}</h2>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? "Cancelar" : "Realizar venta"}
          </button>

          {mostrarFormulario && (
            <div style={{ marginTop: "20px" }}>
              <h4 style={{ marginBottom: "10px" }}>Nueva venta</h4>

              {productos.map((producto, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Producto"
                    value={producto.nombre}
                    onChange={(e) => handleProductoChange(index, "nombre", e.target.value)}
                    style={{
                      flex: 2,
                      padding: "8px",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Cant."
                    min="1"
                    value={producto.cantidad}
                    onChange={(e) =>
                      handleProductoChange(index, "cantidad", Number(e.target.value))
                    }
                    style={{
                      width: "70px",
                      padding: "8px",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    min="0"
                    value={producto.precio}
                    onChange={(e) =>
                      handleProductoChange(index, "precio", Number(e.target.value))
                    }
                    style={{
                      width: "100px",
                      padding: "8px",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  />
                  <button
                    className="btn btn-outline"
                    onClick={() => eliminarProducto(index)}
                    style={{ padding: "6px 10px" }}
                  >
                    ×
                  </button>
                </div>
              ))}

              <button className="btn btn-outline" onClick={agregarProducto}>
                + Agregar producto
              </button>

              <div style={{ marginTop: "15px" }}>
                <button
                  className="btn btn-primary"
                  onClick={realizarVenta}
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Confirmar venta"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Registro de Ventas */}
        <div className="card">
          <div className="card-header">
            <p className="card-title">Registro de ventas del día</p>
            <p className="stat-change">({ventas.length} ventas)</p>
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {ventas.length === 0 ? (
              <p style={{ color: "var(--muted-foreground)" }}>No hay ventas registradas hoy.</p>
            ) : (
              ventas
                .slice()
                .reverse()
                .map((venta) => (
                  <div
                    key={venta.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      padding: "10px 0",
                    }}
                  >
                    <p style={{ fontWeight: "500" }}>Venta #{venta.id}</p>
                    {venta.productos.map((p, i) => (
                      <p key={i} style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
                        {p.nombre} x{p.cantidad} - ${p.precio}
                      </p>
                    ))}
                    <p style={{ marginTop: "4px", fontWeight: "600" }}>
                      Total: ${venta.totalVenta.toFixed(2)}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ventas;
