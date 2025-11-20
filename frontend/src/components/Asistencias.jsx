import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { validarAsistenciaFrontend } from '../utils/validators';
// Importamos el CSS específico
import './Css/Asistencias.css'; 

export default function Asistencias() {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
  const [registros, setRegistros] = useState([]);
  const [vendedoras, setVendedoras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ vendedora_id: '', presente: true, motivo: '' });

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { buscarPorFecha(); }, []);

  const handleRegistrar = async () => {
    try {
      const payload = { vendedora_id: Number(form.vendedora_id), fecha, presente: !!form.presente, motivo: form.motivo };
      const valid = validarAsistenciaFrontend(payload);
      if (!valid.valid) return alert('Errores: ' + valid.errors.join('; '));
      await api.post('/asistencias', payload);
      setForm({ vendedora_id: '', presente: true, motivo: '' });
      await buscarPorFecha();
      alert('Asistencia registrada');
    } catch (e) {
      console.error('Error registrar asistencia', e);
      alert('Error al registrar asistencia');
    }
  };

  return (
    <div className="asistencias-container">
      {/* Header y Filtro */}
      <div className="page-header">
        <h3 className="page-title">Gestión de Asistencias</h3>
        <div className="filter-group">
          <input 
            type="date" 
            className="input-field"
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)} 
          />
          <button className="btn btn-secondary" onClick={buscarPorFecha}>
            🔍 Buscar
          </button>
        </div>
      </div>

      {/* Card de Formulario */}
      <div className="card-box">
        <h4 className="card-header-title">Registrar asistencia rápida</h4>
        <div className="form-row">
          <select 
            className="input-field"
            style={{ minWidth: '200px' }}
            value={form.vendedora_id} 
            onChange={(e) => setForm({ ...form, vendedora_id: e.target.value })}
          >
            <option value="">-- Seleccione vendedora --</option>
            {vendedoras.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>
          
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={form.presente} 
              onChange={(e) => setForm({ ...form, presente: e.target.checked })} 
            /> 
            <span>Presente</span>
          </label>
          
          <input 
            className="input-field"
            style={{ flex: 1 }}
            placeholder="Motivo (opcional)" 
            value={form.motivo} 
            onChange={(e) => setForm({ ...form, motivo: e.target.value })} 
          />
          
          <button className="btn btn-primary" onClick={handleRegistrar}>
            Registrar
          </button>
        </div>
      </div>

      {/* Card de Tabla */}
      <div className="card-box" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
           <h4 className="card-header-title" style={{ margin: 0 }}>Registros ({registros.length})</h4>
        </div>
        
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando...</div>
        ) : (
          registros.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No hay registros para esta fecha.</div>
          ) : (
            <table className="data-table">
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
                    { r.fecha
                        ? r.fecha.slice(0, 10).split('-').reverse().join('/') 
                        : ''
                    }
                    </td>
                    <td>
                      <span className={`badge ${r.presente ? 'badge-presente' : 'badge-ausente'}`}>
                        {r.presente ? 'Presente' : 'Ausente'}
                      </span>
                    </td>
                    <td style={{ color: r.motivo ? 'inherit' : '#94a3b8' }}>
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