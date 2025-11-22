import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { validarVentaFrontend } from '../utils/validators';
// 1. Importamos el hook del FiltroContext
import { useFiltro } from './Filtro/FiltroContext'; // (Asegúrate que la ruta sea correcta)
import { NotificationContainer } from './Notification';
import './Css/Ventas.css';

const Ventas = () => {
  // 2. Leemos el rango de días del contexto
  const { rangoDias } = useFiltro();

  const [ventas, setVentas] = useState([]);
  // 3. Renombramos los estados para que sean genéricos (no solo "hoy")
  const [totalPeriodo, setTotalPeriodo] = useState(0);
  const [cantidadPeriodo, setCantidadPeriodo] = useState(0);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [productos, setProductos] = useState([{ nombre: "", cantidad: 1, precio: "" }]);
  const [vendedoras, setVendedoras] = useState([]);
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga para el fetch inicial
  const [notifications, setNotifications] = useState([]);

  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Función para agregar notificaciones (siempre 3 segundos)
  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration: 3000 }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 4. Creamos una función para obtener la etiqueta del período
  const getPeriodoLabel = (dias) => {
    if (dias === 0) return "Hoy";
    return `Últimos ${dias} días`;
  };
  const periodoLabel = getPeriodoLabel(rangoDias);

  const exportarExcelVentas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addNotification('No se encontró token. Por favor iniciá sesión.', 'error');
        return;
      }

      // Construir URL con filtros de fecha si existen
      let url = `http://localhost:3001/exportar/excel/ventas`;
      const params = new URLSearchParams();
      
      // Si hay filtros de fecha, usarlos; si no, usar rangoDias
      if (fechaInicio || fechaFin) {
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
      } else {
        params.append('dias', rangoDias || 0);
      }
      
      url += '?' + params.toString();

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      if (res.status === 401 || res.status === 403) {
        addNotification('No autorizado. Token inválido o expirado.', 'error');
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        console.error('Error al generar Excel', res.status, text);
        addNotification('Error al exportar archivo', 'error');
        return;
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      let nombre = `ventas_${rangoDias === 0 ? 'hoy' : `ultimos_${rangoDias}_dias`}.xlsx`;
      if (fechaInicio && fechaFin) {
        nombre = `ventas_${fechaInicio}_${fechaFin}.xlsx`;
      } else if (fechaInicio) {
        nombre = `ventas_desde_${fechaInicio}.xlsx`;
      } else if (fechaFin) {
        nombre = `ventas_hasta_${fechaFin}.xlsx`;
      }
      a.href = downloadUrl;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      addNotification('Éxito al exportar archivo', 'success');
    } catch (err) {
      console.error('Error exportarExcelVentas:', err);
      addNotification('Error al exportar archivo', 'error');
    }
  };

  // 5. Definimos la función de carga de datos con useCallback
  // La envolvemos en useCallback para que pueda ser llamada desde realizarVenta sin crear bucles
  const obtenerVentas = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = "/ventas/hoy";
      
      // Si hay filtros de fecha, usarlos directamente; si no, usar rangoDias
      if (fechaInicio || fechaFin) {
        endpoint = "/ventas/rango";
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
        endpoint += '?' + params.toString();
      } else {
        // Sin filtros de fecha, usar rangoDias
        endpoint = rangoDias === 0 ? "/ventas/hoy" : `/ventas/rango?dias=${rangoDias}`;
      }

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
  }, [rangoDias, fechaInicio, fechaFin]); // Esta función se re-crea si 'rangoDias' o las fechas cambian

  // 7. El useEffect ahora solo llama a 'obtenerVentas'
  useEffect(() => {
    obtenerVentas();
  }, [obtenerVentas]); // Se ejecuta cuando la función (y 'rangoDias' o fechas) cambia

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
    // PASO 1: Preparar datos para el VALIDADOR
    // No convertimos tipos todavía, pasamos el estado crudo para que el validador decida
    const datosParaValidar = {
      items: productos, 
      vendedora_id: vendedoraSeleccionada 
    };

    // PASO 2: Ejecutar la validación
    const resultadoValidacion = validarVentaFrontend(datosParaValidar);

    // PASO 3: Si hay errores, mostramos y cancelamos
    if (!resultadoValidacion.valid) {
      setFormErrors(resultadoValidacion.errors);
      return; // <--- AQUÍ SE DETIENE SI HAY ERROR
    }

    
  // PASO 4: Si pasó la validación, preparamos datos para el BACKEND
    const payload = {
      vendedora_id: Number(vendedoraSeleccionada),
      
      // CAMBIO CLAVE: Usamos "productos" en vez de "items"
      // y mantenemos "nombre" y "precio" que es lo que suele esperar el validador
      productos: productos.map(p => ({
        nombre: p.nombre.trim(),
        cantidad: Number(p.cantidad),
        precio: Number(p.precio)
      })),
      
      // AGREGADO DE SEGURIDAD: Algunos validadores exigen este campo aunque esté vacío
      pagos: [] 
    };

    // PASO 5: Enviar
    try {
      setLoading(true);
      await api.post('/ventas', payload);
      
      // Éxito
      await obtenerVentas(); 
      setProductos([{ nombre: "", cantidad: 1, precio: "" }]);
      setVendedoraSeleccionada(null); // Reseteamos select vendedora también
      setMostrarFormulario(false);
      setFormErrors([]);
      addNotification('Venta registrada exitosamente', 'success');
    } catch (err) {
      console.error("Error al registrar venta:", err);
      const mensaje = err.response?.data?.error || "Error al registrar la venta.";
      setFormErrors([mensaje]);
      addNotification('Error al registrar venta', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      {/* Filtros de fecha */}
      <div className="card" style={{ marginBottom: "20px", padding: "16px" }}>
        <h3 style={{ marginBottom: "12px" }}>Filtros de fecha</h3>
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
            }}
            placeholder="Fecha inicio"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
            }}
            placeholder="Fecha fin"
          />
          <button
            onClick={() => {
              setFechaInicio('');
              setFechaFin('');
            }}
            style={{
              padding: "8px 14px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Limpiar filtros
          </button>
        </div>
      </div>
      
      {/* Formulario de Venta con botón de exportar */}
      <div className="card" style={{ marginBottom: "20px", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: "4px" }}>Realizar venta</h3>
            <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: "14px" }}>
              Total ({periodoLabel}): <strong>${totalPeriodo.toFixed(2)}</strong> • {cantidadPeriodo} ventas
            </p>
          </div>
          <button 
            onClick={exportarExcelVentas}
            style={{
              padding: "8px 14px",
              backgroundColor: "#16A34A",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Exportar Excel
          </button>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{ marginBottom: mostrarFormulario ? "20px" : "0" }}
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
                  value={producto.cantidad === "" ? "" : producto.cantidad}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleProductoChange(index, "cantidad", value === "" ? "" : Number(value));
                  }}
                  onBlur={() => {
                    if (producto.cantidad === "") {
                      handleProductoChange(index, "cantidad", 1);
                    }
                  }}
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
                  value={producto.precio === "" ? "" : producto.precio}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleProductoChange(index, "precio", value === "" ? "" : Number(value));
                  }}
                  onBlur={() => {
                    if (producto.precio === "") {
                      handleProductoChange(index, "precio", 0);
                    }
                  }}
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
            {formErrors && formErrors.length > 0 && (
              <div style={{ color: 'red', marginTop: 8 }}>
                <ul>
                  {formErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            <button className="btn btn-outline" onClick={agregarProducto}>
              + Agregar producto
            </button>
            <div style={{ marginTop: '10px' }}>
              <label>Vendedora:</label>
              <select
                value={vendedoraSeleccionada || ''}
                onChange={(e) => setVendedoraSeleccionada(e.target.value ? Number(e.target.value) : null)}
                style={{ marginLeft: '8px', padding: "6px", borderRadius: "6px", border: "1px solid var(--border)" }}
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

      {/* Tabla de ventas - Ancho completo */}
      <div className="card" style={{ padding: "12px" }}>
        <h3 style={{ marginBottom: "12px" }}>Registro de ventas ({periodoLabel})</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Ticket</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Fecha</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Hora</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Vendedora</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Items</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "var(--muted-foreground)" }}>
                  Cargando ventas...
                </td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "var(--muted-foreground)" }}>
                  No hay ventas registradas en este período.
                </td>
              </tr>
            ) : (
              ventas
                .slice()
                .reverse()
                .map((venta) => (
                  <tr key={venta.id || `${venta.fecha}-${venta.ticket_num}`} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px" }}>{venta.ticket_num || 'N/A'}</td>
                    <td style={{ padding: "12px" }}>
                      {venta.fecha ? new Date(venta.fecha).toLocaleDateString('es-AR') : 'N/A'}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {venta.hora ? new Date(venta.hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {venta.vendedora ? venta.vendedora.nombre : '--'}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {(venta.items || []).map((p, i) => (
                        <div key={i} style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "4px" }}>
                          {p.descripcion} x{p.cantidad} - ${Number(p.precio_unitario).toFixed(2)}
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: "12px", color: "var(--chart-1)", fontWeight: "600" }}>
                      ${Number(venta.total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ventas;