import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
// 1. Importamos el hook del FiltroContext
import { useFiltro } from './Filtro/FiltroContext'; // (Asegúrate que la ruta sea correcta)

const Ventas = () => {
  // 2. Leemos el rango de días del contexto
  const { rangoDias } = useFiltro();

  const [ventas, setVentas] = useState([]);
  // 3. Renombramos los estados para que sean genéricos (no solo "hoy")
  const [totalPeriodo, setTotalPeriodo] = useState(0);
  const [cantidadPeriodo, setCantidadPeriodo] = useState(0);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productos, setProductos] = useState([{ nombre: "", cantidad: 1, precio: "" }]);
  const [loading, setLoading] = useState(true); // Estado de carga para el fetch inicial

  // 4. Creamos una función para obtener la etiqueta del período
  const getPeriodoLabel = (dias) => {
    if (dias === 0) return "Hoy";
    return `Últimos ${dias} días`;
  };
  const periodoLabel = getPeriodoLabel(rangoDias);

  // 5. Definimos la función de carga de datos con useCallback
  // La envolvemos en useCallback para que pueda ser llamada desde realizarVenta sin crear bucles
  const obtenerVentas = useCallback(async () => {
    setLoading(true);
    try {
      // 6. Decidimos qué endpoint usar basado en 'rangoDias'
      const endpoint = rangoDias === 0
        ? "http://localhost:3001/ventas/hoy"
        : `http://localhost:3001/ventas/rango?dias=${rangoDias}`;

      const res = await axios.get(endpoint);
      
      setVentas(res.data.ventasHoy || []);
      setTotalPeriodo(res.data.totalHoy || 0);
      setCantidadPeriodo(res.data.cantidadHoy || 0);
    } catch (err) {
      console.error("Error al obtener ventas:", err);
      setVentas([]);
      setTotalPeriodo(0);
      setCantidadPeriodo(0);
    } finally {
      setLoading(false);
    }
  }, [rangoDias]); // Esta función se re-crea si 'rangoDias' cambia

  // 7. El useEffect ahora solo llama a 'obtenerVentas'
  useEffect(() => {
    obtenerVentas();
  }, [obtenerVentas]); // Se ejecuta cuando la función (y 'rangoDias') cambia

  // --- Lógica del formulario (sin cambios) ---
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
  // ------------------------------------------

  const realizarVenta = async () => {
    const productosValidos = productos.filter(
      (p) => p.nombre.trim() !== "" && p.cantidad > 0 && p.precio > 0
    );

    if (productosValidos.length === 0) {
      // Deberías usar un modal aquí, 'alert' puede no funcionar.
      console.error("Agrega al menos un producto válido.");
      return;
    }

    try {
      setLoading(true); // Usamos el 'loading' general
      await axios.post("http://localhost:3001/ventas", {
        productos: productosValidos,
      });
      
      // 8. IMPORTANTE: Volvemos a llamar a 'obtenerVentas'
      // Esto recarga la lista con el filtro actual ('rangoDias')
      // y asegura que la nueva venta (de hoy) aparezca si el filtro es >= 0.
      await obtenerVentas(); 

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
        {/* Formulario de Venta */}
        <div className="card">
          <div className="card-header">
            <p className="card-title">Realizar venta</p>
            {/* 9. Actualizamos el texto del total */}
            <h2 className="stat-value">Total ({periodoLabel}): ${totalPeriodo.toFixed(2)}</h2>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? "Cancelar" : "Realizar venta"}
          </button>

          {mostrarFormulario && (
            <div style={{ marginTop: "20px" }}>
              {/* ... (El resto del formulario no cambia) ... */}
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
            {/* 10. Actualizamos el título del registro */}
            <p className="card-title">Registro de ventas ({periodoLabel})</p>
            <p className="stat-change">({cantidadPeriodo} ventas)</p>
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {loading ? (
              <p>Cargando ventas...</p>
            ) : ventas.length === 0 ? (
              <p style={{ color: "var(--muted-foreground)" }}>No hay ventas registradas en este período.</p>
            ) : (
              ventas
                .slice()
                .reverse()
                // Usamos 'index' como 'key' temporal porque tu backend no genera IDs
                .map((venta, index) => ( 
                  <div
                    key={`${venta.hora}-${index}`} // Key más robusta
                    style={{
                      borderBottom: "1px solid var(--border)",
                      padding: "10px 0",
                    }}
                  >
                    {/* Mostramos 'fecha' y 'hora' ya que el backend las provee */}
                    <p style={{ fontWeight: "500" }}>
                      {/* (Tu backend aún no guarda la fecha en el objeto, 
                         lo solucionaremos en el paso 3, por ahora usamos la hora) */}
                      Venta de las {venta.hora}
                    </p>
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