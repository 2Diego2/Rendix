import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
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
  const [vendedoras, setVendedoras] = useState([]);
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);
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
      const endpoint = rangoDias === 0 ? "/ventas/hoy" : `/ventas/rango?dias=${rangoDias}`;

      const res = await api.get(endpoint);
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

  // Cargar vendedoras al montar (si existe el endpoint /vendedoras)
  useEffect(() => {
    const fetchVendedoras = async () => {
      try {
        const res = await api.get('/vendedoras');
        // El backend responde { vendedoras: [...] }
        setVendedoras(res.data?.vendedoras || []);
      } catch (e) {
        // No hacemos nada si el endpoint no existe aún
        console.warn('No se pudieron cargar vendedoras:', e?.response?.status || e.message);
      }
    };
    fetchVendedoras();
  }, []);

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
      const payload = {
        productos: productosValidos,
      };
      if (vendedoraSeleccionada) payload.vendedora_id = vendedoraSeleccionada;

      await api.post('/ventas', payload);
      
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
              {/* Selector de vendedora (intenta obtener lista desde backend, maneja ausencia) */}
              <div style={{ marginTop: '10px' }}>
                <label>Vendedora:</label>
                <select
                  value={vendedoraSeleccionada || ''}
                  onChange={(e) => setVendedoraSeleccionada(e.target.value ? Number(e.target.value) : null)}
                  style={{ marginLeft: '8px' }}
                >
                  <option value="">-- No asignada --</option>
                  {vendedoras.map((v) => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>
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
                .map((venta) => ( 
                  <div
                    key={venta.id || `${venta.fecha}-${venta.ticket_num}`}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      padding: "10px 0",
                    }}
                  >
                    <p style={{ fontWeight: "500" }}>
                      Venta {venta.ticket_num || ''} - {venta.fecha ? new Date(venta.fecha).toLocaleDateString() : ''} {venta.hora ? new Date(venta.hora).toLocaleTimeString() : ''}
                      {venta.vendedora ? (
                        <span style={{ fontWeight: 400, marginLeft: 8 }}> - Vendedora: {venta.vendedora.nombre}</span>
                      ) : (
                        <span style={{ fontWeight: 400, marginLeft: 8 }}> - Vendedora: --</span>
                      )}
                    </p>
                    {(venta.items || []).map((p, i) => (
                      <p key={i} style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
                        {p.descripcion} x{p.cantidad} - ${Number(p.precio_unitario).toFixed(2)}
                      </p>
                    ))}
                    <p style={{ marginTop: "4px", fontWeight: "600" }}>
                      Total: ${Number(venta.total || 0).toFixed(2)}
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