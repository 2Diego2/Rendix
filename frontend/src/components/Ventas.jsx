import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { validarVentaFrontend } from '../utils/validators';
import FiltroFechas from './Filtros/FiltroFechas';
import { NotificationContainer } from './Notification';
import './Css/Ventas.css';

const Ventas = () => {
  // Estado para el rango de días (por defecto 0 = hoy)
  // Lo usamos para la etiqueta, pero el filtro principal ahora lo maneja FiltroFechas
  const [rangoDias, setRangoDias] = useState(0);

  const [ventas, setVentas] = useState([]);
  const [totalPeriodo, setTotalPeriodo] = useState(0);
  const [cantidadPeriodo, setCantidadPeriodo] = useState(0);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [productos, setProductos] = useState([{ nombre: "", cantidad: 1, precio: "" }]);
  const [vendedoras, setVendedoras] = useState([]);
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration: 3000 }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPeriodoLabel = () => {
    if (fechaInicio && fechaFin) {
      if (fechaInicio === fechaFin) return `Día ${new Date(fechaInicio).toLocaleDateString('es-AR')}`;
      return `Del ${new Date(fechaInicio).toLocaleDateString('es-AR')} al ${new Date(fechaFin).toLocaleDateString('es-AR')}`;
    }
    if (rangoDias === 0) return "Hoy";
    return `Últimos ${rangoDias} días`;
  };
  const periodoLabel = getPeriodoLabel();

  const exportarExcelVentas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addNotification('No se encontró token. Por favor iniciá sesión.', 'error');
        return;
      }

      let url = `http://localhost:3001/exportar/excel/ventas`;
      const params = new URLSearchParams();

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

  const obtenerVentas = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = "/ventas/hoy";

      if (fechaInicio || fechaFin) {
        endpoint = "/ventas/rango";
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
        endpoint += '?' + params.toString();
      } else {
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
  }, [rangoDias, fechaInicio, fechaFin]);

  useEffect(() => {
    obtenerVentas();
  }, [obtenerVentas]);

  useEffect(() => {
    const fetchVendedoras = async () => {
      try {
        const res = await api.get('/vendedoras');
        setVendedoras(res.data?.vendedoras || []);
      } catch (e) {
        console.warn('No se pudieron cargar vendedoras:', e?.response?.status || e.message);
      }
    };
    fetchVendedoras();
  }, []);

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
    const datosParaValidar = {
      items: productos,
      vendedora_id: vendedoraSeleccionada
    };

    const resultadoValidacion = validarVentaFrontend(datosParaValidar);

    if (!resultadoValidacion.valid) {
      setFormErrors(resultadoValidacion.errors);
      return;
    }

    const payload = {
      vendedora_id: Number(vendedoraSeleccionada),
      productos: productos.map(p => ({
        nombre: p.nombre.trim(),
        cantidad: Number(p.cantidad),
        precio: Number(p.precio)
      })),
      pagos: []
    };

    try {
      setLoading(true);
      await api.post('/ventas', payload);

      await obtenerVentas();
      setProductos([{ nombre: "", cantidad: 1, precio: "" }]);
      setVendedoraSeleccionada(null);
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
    <div className="ventas-container">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      {/* Header */}
      <div className="ventas-header">
        <div>
          <h3 className="ventas-title">Registro de Ventas</h3>
          <p className="ventas-subtitle">
            Total ({periodoLabel}): <strong>${totalPeriodo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong> • {cantidadPeriodo} ventas
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={exportarExcelVentas}
          title="Exportar a Excel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Exportar Excel
        </button>
      </div>

      {/* Filtros */}
      <FiltroFechas
        onFiltrar={(inicio, fin) => {
          setFechaInicio(inicio);
          setFechaFin(fin);
          setRangoDias(null);
        }}
        onLimpiar={() => {
          setFechaInicio('');
          setFechaFin('');
          setRangoDias(0);
        }}
      />

      {/* Tarjeta de Nueva Venta */}
      <div className="ventas-card">
        <div className="card-header">
          <h4 className="card-title">Realizar Venta</h4>
          <button
            className={`btn ${mostrarFormulario ? 'btn-outline' : 'btn-primary'}`}
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? "Cancelar" : "+ Nueva Venta"}
          </button>
        </div>

        {mostrarFormulario && (
          <div className="venta-form">
            {productos.map((producto, index) => (
              <div key={index} className="producto-row">
                <input
                  type="text"
                  className="input-control"
                  placeholder="Producto"
                  value={producto.nombre}
                  onChange={(e) => handleProductoChange(index, "nombre", e.target.value)}
                />
                <input
                  type="number"
                  className="input-control"
                  placeholder="Cant."
                  min="1"
                  value={producto.cantidad === "" ? "" : producto.cantidad}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleProductoChange(index, "cantidad", value === "" ? "" : Number(value));
                  }}
                  onBlur={() => {
                    if (producto.cantidad === "") handleProductoChange(index, "cantidad", 1);
                  }}
                />
                <input
                  type="number"
                  className="input-control"
                  placeholder="Precio"
                  min="0"
                  value={producto.precio === "" ? "" : producto.precio}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleProductoChange(index, "precio", value === "" ? "" : Number(value));
                  }}
                  onBlur={() => {
                    if (producto.precio === "") handleProductoChange(index, "precio", 0);
                  }}
                />
                <button
                  className="btn-icon btn-remove"
                  onClick={() => eliminarProducto(index)}
                  title="Eliminar item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}

            <button className="btn btn-add" onClick={agregarProducto}>
              + Agregar otro producto
            </button>

            {formErrors && formErrors.length > 0 && (
              <div className="info-note" style={{ marginTop: '16px', borderColor: 'var(--error-600)', backgroundColor: 'var(--error-50)', color: 'var(--error-600)' }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {formErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="form-actions">
              <div className="vendedora-select-group">
                <label className="control-label" style={{ marginBottom: 0 }}>Vendedora:</label>
                <select
                  className="input-control select-control"
                  value={vendedoraSeleccionada || ''}
                  onChange={(e) => setVendedoraSeleccionada(e.target.value ? Number(e.target.value) : null)}
                  style={{ width: '200px' }}
                >
                  <option value="">-- Seleccionar --</option>
                  {vendedoras.map((v) => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-primary"
                onClick={realizarVenta}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Registrando...
                  </>
                ) : (
                  "Confirmar Venta"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Ventas */}
      <div className="ventas-table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ventas-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Vendedora</th>
              <th>Items</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading && !mostrarFormulario ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="spinner" style={{ margin: '0 auto', borderColor: 'var(--gray-300)', borderTopColor: 'var(--primary-600)' }}></div>
                </td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  No hay ventas registradas en este período.
                </td>
              </tr>
            ) : (
              ventas
                .slice()
                .reverse()
                .map((venta) => (
                  <tr key={venta.id || `${venta.fecha}-${venta.ticket_num}`}>
                    <td>#{venta.ticket_num || 'N/A'}</td>
                    <td>
                      {venta.fecha ? new Date(venta.fecha).toLocaleDateString('es-AR') : 'N/A'}
                    </td>
                    <td>
                      {venta.hora ? new Date(venta.hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {venta.vendedora ? venta.vendedora.nombre : '--'}
                    </td>
                    <td>
                      <div className="item-list">
                        {(venta.items || []).map((p, i) => (
                          <div key={i} className="item-detail">
                            {p.descripcion} <span style={{ color: 'var(--gray-400)' }}>x{p.cantidad}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="text-right total-amount">
                      ${Number(venta.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
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