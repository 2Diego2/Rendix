import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { validarVendedoraFrontend } from '../utils/validators';
import { NotificationContainer } from './Notification';
import { ConfirmModal } from './ConfirmModal';
import './Css/Vendedoras.css';

export function Vendedoras() {
  const [vendedoras, setVendedoras] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const [editandoId, setEditandoId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [sueldoBase, setSueldoBase] = useState('');
  const [porcentaje, setPorcentaje] = useState('');

  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration: 3000 }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    cargarVendedoras();
  }, []);

  async function cargarVendedoras() {
    setCargando(true);
    try {
      const res = await api.get('/vendedoras');
      setVendedoras(res.data.vendedoras || []);
    } catch (err) {
      console.error("Error cargando vendedoras", err);
      addNotification("Error al cargar vendedoras", "error");
    } finally {
      setCargando(false);
    }
  }

  function iniciarEdicion(v) {
    setEditandoId(v.id);
    setNombre(v.nombre || '');
    setCodigo(v.codigo || '');
    setSueldoBase(String(v.sueldo_base || ''));
    setPorcentaje(String(v.porcentaje_comision || ''));
  }

  function limpiarFormulario() {
    setEditandoId(null);
    setNombre('');
    setCodigo('');
    setSueldoBase('');
    setPorcentaje('');
  }

  async function guardar(e) {
    e.preventDefault();
    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim() || undefined,
      sueldo_base: Number(sueldoBase) || 0,
      porcentaje_comision: Number(porcentaje) || 0
    };
    const valid = validarVendedoraFrontend(payload);
    if (!valid.valid) {
      addNotification('Errores: ' + valid.errors.join('; '), 'error');
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/vendedoras/${editandoId}`, payload);
        addNotification("Vendedora actualizada", "success");
      } else {
        await api.post('/vendedoras', payload);
        addNotification("Vendedora creada", "success");
      }
      limpiarFormulario();
      cargarVendedoras();
    } catch {
      addNotification("Error al guardar", "error");
    }
  }

  function eliminar(id) {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Vendedora',
      message: '¿Seguro que querés eliminar esta vendedora?',
      onConfirm: async () => {
        try {
          await api.delete(`/vendedoras/${id}`);
          cargarVendedoras();
          addNotification("Vendedora eliminada", "success");
        } catch (err) {
          const mensaje = err.response?.data?.error || "Error al eliminar";
          if (err.response?.status === 400 && mensaje.includes('corriente mes')) {
            addNotification("No se puede eliminar: tiene ventas este mes", "warning");
          } else {
            addNotification(mensaje, "error");
          }
        }
      }
    });
  }

  return (
    <div className="vendedoras-container">
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

      <div className="vendedoras-header">
        <h3 className="vendedoras-title">Gestión de Vendedoras</h3>
      </div>

      {/* FORMULARIO */}
      <div className="vendedoras-card">
        <div className="card-header">
          <h4 className="card-title">{editandoId ? "Editar Vendedora" : "Nueva Vendedora"}</h4>
        </div>
        <form onSubmit={guardar} className="vendedoras-form">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              className="input-control"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Código (Opcional)</label>
            <input
              className="input-control"
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sueldo Base</label>
            <input
              type="number"
              className="input-control"
              placeholder="0.00"
              value={sueldoBase}
              onChange={(e) => setSueldoBase(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">% Comisión</label>
            <input
              type="number"
              className="input-control"
              placeholder="0"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
              {editandoId ? "Actualizar" : "Crear Vendedora"}
            </button>
            {editandoId && (
              <button type="button" onClick={limpiarFormulario} className="btn btn-outline" style={{ height: '42px' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLA */}
      <div className="vendedoras-table-wrapper vendedoras-card" style={{ padding: 0, overflow: 'hidden' }}>
        {cargando ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : (
          <table className="vendedoras-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Sueldo base</th>
                <th>% Comisión</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vendedoras.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state" style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-500)' }}>
                    No hay vendedoras registradas.
                  </td>
                </tr>
              ) : (
                vendedoras.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 500 }}>{v.nombre}</td>
                    <td>{v.codigo || '-'}</td>
                    <td>${Number(v.sueldo_base).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                    <td>{Number(v.porcentaje_comision).toFixed(2)}%</td>
                    <td className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => iniciarEdicion(v)}
                        title="Editar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => eliminar(v.id)}
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
        )}
      </div>
    </div>
  );
}

export default Vendedoras;
