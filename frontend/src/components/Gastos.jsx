import React, { useState, useEffect } from "react";
import api from '../utils/api';
import { validarGastoFrontend } from '../utils/validators';
import { NotificationContainer } from './Notification';
import { ConfirmModal } from './ConfirmModal';
import FiltroFechas from './Filtros/FiltroFechas';
import './Css/Gastos.css';

export function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Formulario para nuevo gasto
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoMonto, setNuevoMonto] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Adicional');

  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Función para agregar notificaciones
  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration: 3000 }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Cargar gastos al montar o cuando cambien los filtros
  useEffect(() => {
    cargarGastos();
  }, [fechaInicio, fechaFin]);

  const cargarGastos = async () => {
    try {
      let endpoint = '/gastos/hoy';
      if (fechaInicio || fechaFin) {
        endpoint = '/gastos/rango';
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
        endpoint += '?' + params.toString();
      }

      const res = await api.get(endpoint);
      setGastos(res.data.gastosHoy || res.data.gastos || []);
    } catch (err) {
      console.log("No se pudieron cargar los gastos.");
    }
  };

  // Crear un nuevo gasto
  const handleCrearGasto = (e) => {
    e.preventDefault();
    if (!nuevoMonto || Number(nuevoMonto) <= 0) {
      addNotification('Ingrese un monto válido', 'error');
      return;
    }

    api.post('/gastos', {
      monto: Number(nuevoMonto),
      detalle: nuevaDescripcion || nuevoNombre || "Sin detalle",
      categoria: nuevaCategoria || "Adicional",
      concepto: nuevoNombre // Aseguramos que se envíe el concepto/nombre
    })
      .then(async () => {
        await cargarGastos();
        setNuevoNombre('');
        setNuevaDescripcion('');
        setNuevoMonto('');
        setNuevaCategoria('Adicional');
        addNotification('Gasto registrado correctamente', 'success');
      })
      .catch(err => {
        console.error('Error al crear gasto:', err);
        addNotification('Error al crear gasto', 'error');
      });
  };

  // Eliminar gasto
  const handleEliminar = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Gasto',
      message: '¿Seguro que querés eliminar este gasto?',
      onConfirm: () => {
        api.delete(`/gastos/${id}`)
          .then(() => {
            setGastos(gastos.filter(g => g.id !== id));
            addNotification('Gasto eliminado', 'success');
          })
          .catch(err => {
            console.error('Error al eliminar gasto:', err);
            addNotification('Error al eliminar gasto', 'error');
          });
      }
    });
  };

  // Editar gasto
  const handleEditar = (id) => {
    const gasto = gastos.find(g => g.id === id);
    const nuevoMonto = prompt('Nuevo monto:', gasto.monto);
    const nuevaDescripcion = prompt('Nueva descripción:', gasto.descripcion);
    if (nuevoMonto === null || nuevaDescripcion === null) return;

    api.put(`/gastos/${id}`, {
      monto: Number(nuevoMonto),
      descripcion: nuevaDescripcion,
    })
      .then(res => {
        setGastos(gastos.map(g => g.id === id ? { ...g, monto: Number(nuevoMonto), descripcion: nuevaDescripcion } : g));
        addNotification('Gasto actualizado', 'success');
      })
      .catch(err => {
        console.error('Error al editar gasto:', err);
        addNotification('Error al editar gasto', 'error');
      });
  };

  const descargarExcel = async () => {
    try {
      let url = "http://localhost:3001/gastos/exportar/excel";
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      if (params.toString()) url += '?' + params.toString();

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Error al exportar archivo');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "gastos.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      addNotification("Éxito al exportar archivo", "success");
    } catch (err) {
      console.error('Error al exportar:', err);
      addNotification("Error al exportar archivo", "error");
    }
  };

  const getBadgeClass = (categoria) => {
    switch (categoria) {
      case 'Fijo': return 'badge-fijo';
      case 'Variable': return 'badge-variable';
      default: return 'badge-adicional';
    }
  };

  return (
    <div className="gastos-container">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Eliminar"
        type="danger"
      />

      {/* Header */}
      <div className="gastos-header">
        <h3 className="gastos-title">Gestión de Gastos</h3>
        <button
          className="btn btn-outline"
          onClick={descargarExcel}
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
        }}
        onLimpiar={() => {
          setFechaInicio('');
          setFechaFin('');
        }}
      />

      {/* Formulario para crear gasto */}
      <div className="gastos-card">
        <div className="card-header">
          <h4 className="card-title">Nuevo Gasto</h4>
        </div>
        <form onSubmit={handleCrearGasto} className="gastos-form">
          <div className="form-group">
            <label className="form-label">Nombre / Concepto</label>
            <input
              type="text"
              className="input-control"
              placeholder="Ej: Alquiler"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Descripción</label>
            <input
              type="text"
              className="input-control"
              placeholder="Detalles adicionales..."
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Monto</label>
            <input
              type="number"
              className="input-control"
              placeholder="0.00"
              value={nuevoMonto}
              onChange={(e) => setNuevoMonto(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select
              className="input-control select-control"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
            >
              <option value="Adicional">Adicional</option>
              <option value="Fijo">Fijo</option>
              <option value="Variable">Variable</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
            + Agregar Gasto
          </button>
        </form>
      </div>

      {/* Tabla de gastos */}
      <div className="gastos-table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="gastos-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Categoría</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  No hay gastos registrados en este período.
                </td>
              </tr>
            ) : (
              gastos.map((gasto) => (
                <tr key={gasto.id}>
                  <td style={{ fontWeight: 500 }}>{gasto.concepto || gasto.detalle}</td>
                  <td style={{ color: 'var(--gray-600)' }}>{gasto.descripcion}</td>
                  <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                    ${Number(gasto.monto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>{gasto.fecha ? new Date(gasto.fecha).toLocaleDateString('es-AR') : '-'}</td>
                  <td>
                    <span className={`badge-categoria ${getBadgeClass(gasto.categoria)}`}>
                      {gasto.categoria}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEditar(gasto.id)}
                      title="Editar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleEliminar(gasto.id)}
                      title="Eliminar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
