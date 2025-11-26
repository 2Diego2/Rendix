import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { validarAsistenciaFrontend } from '../utils/validators';
import { NotificationContainer } from './Notification';
import './Css/Asistencias.css';

export default function Asistencias() {
  const [fecha, setFecha] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [registros, setRegistros] = useState([]);
  const [vendedoras, setVendedoras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ vendedora_id: '', presente: true, motivo: '' });
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration: 3000 }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const fetchVendedoras = async () => {
      try {
        const res = await api.get('/vendedoras');
        setVendedoras(res.data?.vendedoras || []);
      } catch (e) {
        console.warn('No se pudieron cargar vendedoras', e.message);
      }
    };
    fetchVendedoras();
  }, []);

  const buscarPorFecha = async () => {
    setLoading(true);
    try {
      const res = await api.get('/asistencias', { params: { fecha } });
      setRegistros(res.data.registros || []);
    } catch (e) {
      console.error('Error al obtener asistencias:', e);
      setRegistros([]);
      addNotification('Error al cargar asistencias', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    try {
      const res = await api.get('/exportar/excel/asistencias', {
        params: { fecha },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `asistencias_${fecha}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addNotification('Exportación exitosa', 'success');
    } catch (e) {
      console.error('Error exportando', e);
      addNotification('Error al exportar asistencias', 'error');
    }
  };

  useEffect(() => { buscarPorFecha(); }, []);

  const handleRegistrar = async () => {
    try {
      const payload = { vendedora_id: Number(form.vendedora_id), fecha, presente: !!form.presente, motivo: form.motivo };
      const valid = validarAsistenciaFrontend(payload);
      if (!valid.valid) {
        addNotification('Errores: ' + valid.errors.join('; '), 'error');
        return;
      }
      await api.post('/asistencias', payload);
      setForm({ vendedora_id: '', presente: true, motivo: '' });
      await buscarPorFecha();
      addNotification('Asistencia registrada', 'success');
    } catch (e) {
      console.error('Error registrar asistencia', e);
      addNotification('Error al registrar asistencia', 'error');
    }
  };

  return (
    <div className="asistencias-container">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      {/* Header y Filtro */}
      <div className="asistencias-header">
        <h3 className="asistencias-title">Gestión de Asistencias</h3>
        <div className="filter-group">
          <input
            type="date"
            className="input-control"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={{ width: 'auto' }}
          />
          <button className="btn btn-secondary" onClick={buscarPorFecha}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Buscar
          </button>
          <button
            className="btn btn-outline"
            style={{ borderColor: 'var(--success-600)', color: 'var(--success-700)', backgroundColor: 'var(--success-50)' }}
            onClick={handleExportar}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar
          </button>
        </div>
      </div>

      {/* Card de Formulario */}
      <div className="asistencias-card">
        <div className="card-header">
          <h4 className="card-title">Registrar asistencia rápida</h4>
        </div>
        <div className="asistencias-form">
          <div className="form-group">
            <select
              className="input-control select-control"
              style={{ minWidth: '200px' }}
              value={form.vendedora_id}
              onChange={(e) => setForm({ ...form, vendedora_id: e.target.value })}
            >
              <option value="">-- Seleccione vendedora --</option>
              {vendedoras.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
            </select>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.presente}
              onChange={(e) => setForm({ ...form, presente: e.target.checked })}
            />
            <span>Presente</span>
          </label>

          <div className="form-group" style={{ flex: 1 }}>
            <input
              className="input-control"
              placeholder="Motivo (opcional)"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            />
          </div>

          <button className="btn btn-primary" onClick={handleRegistrar} style={{ height: '42px' }}>
            Registrar
          </button>
        </div>
      </div>

      {/* Card de Tabla */}
      <div className="asistencias-table-wrapper asistencias-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)' }}>
          <h4 className="card-title" style={{ fontSize: '1rem' }}>Registros ({registros.length})</h4>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : (
          registros.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)', fontStyle: 'italic' }}>
              No hay registros para esta fecha.
            </div>
          ) : (
            <table className="asistencias-table">
              <thead>
                <tr>
                  <th>Vendedor/a</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>
                      {r.vendedora && r.vendedora.nombre
                        ? r.vendedora.nombre
                        : '--'}
                    </td>
                    <td>
                      {r.fecha
                        ? r.fecha.slice(0, 10).split('-').reverse().join('/')
                        : ''
                      }
                    </td>
                    <td>
                      <span className={`badge-asistencia ${r.presente ? 'badge-presente' : 'badge-ausente'}`}>
                        {r.presente ? 'Presente' : 'Ausente'}
                      </span>
                    </td>
                    <td style={{ color: r.motivo ? 'var(--gray-900)' : 'var(--gray-400)' }}>
                      {r.motivo || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}