import React, { useEffect, useState } from 'react';
import api from '../utils/api';

// Componente simple para gestionar asistencias: listado por fecha y formulario rápido
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
      if (!form.vendedora_id) return alert('Selecciona una vendedora');
      const payload = { vendedora_id: Number(form.vendedora_id), fecha, presente: !!form.presente, motivo: form.motivo };
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
    <div>
      <h3>Asistencias</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>Fecha:</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <button onClick={buscarPorFecha}>Buscar</button>
      </div>

      <div style={{ marginTop: 12, border: '1px solid #ddd', padding: 12 }}>
        <h4>Registrar asistencia rápida</h4>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={form.vendedora_id} onChange={(e) => setForm({ ...form, vendedora_id: e.target.value })}>
            <option value="">--Seleccione vendedora--</option>
            {vendedoras.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>
          <label>
            <input type="checkbox" checked={form.presente} onChange={(e) => setForm({ ...form, presente: e.target.checked })} /> Presente
          </label>
          <input placeholder="Motivo (opcional)" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
          <button onClick={handleRegistrar}>Registrar</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>Registros ({registros.length})</h4>
        {loading ? <p>Cargando...</p> : (
          registros.length === 0 ? <p>No hay registros</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Vendedora</th>
                  <th>Fecha</th>
                  <th>Presente</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(r => (
                  <tr key={r.id}>
                    <td>{r.vendedora_id ? (r.vendedora?.nombre || r.vendedora_id) : '--'}</td>
                    <td>{r.fecha ? new Date(r.fecha).toLocaleDateString() : ''}</td>
                    <td>{r.presente ? 'Sí' : 'No'}</td>
                    <td>{r.motivo || ''}</td>
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
