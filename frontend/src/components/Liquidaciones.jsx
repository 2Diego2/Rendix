import React, { useState } from 'react';
import api from '../utils/api';

// Componente para generar y listar liquidaciones
// Variables y funciones en español para facilitar mantenimiento
export default function Liquidaciones() {
  // Periodo en formato YYYY-MM
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0,7));

  // Umbral de presentismo: porcentaje mínimo de días presentes para recibir el bono
  // Ejemplo: 85 significa 85%.
  const [umbralPresentismo, setUmbralPresentismo] = useState(85);

  // Ahora se acepta como porcentaje en la UI (ej. 10 = 10%) y se convertirá a decimal al enviar
  const [tasaBono, setTasaBono] = useState(10);

  // Modo de cálculo de presentismo: 'calendario' o 'habiles'
  const [modoPresentismo, setModoPresentismo] = useState('calendario');

  // Mapa temporal de gastos descontados (proviene del resultado de generar, por compatibilidad)
  const [gastosMap, setGastosMap] = useState({});

  // Resultado detallado devuelto por el endpoint al generar las liquidaciones
  const [resultado, setResultado] = useState(null);

  // Lista de liquidaciones ya guardadas en la BD para el periodo seleccionado
  const [listaLiquidaciones, setListaLiquidaciones] = useState([]);

  // Indicador de carga
  const [cargando, setCargando] = useState(false);

  // Genera las liquidaciones para el periodo indicado.
  // Envia opciones al backend para controlar el umbral de presentismo, tasa de bono e incluir gastos.
  const generarLiquidaciones = async () => {
    try {
      setCargando(true);

      // Cuerpo que espera el backend (nombres en inglés por compatibilidad con servicio)
      // presentismo_threshold: porcentaje mínimo (ej. 85)
      // presentismo_bonus_rate: tasa decimal de bono (ej. 0.10) -> convertimos desde porcentaje
      const body = {
        periodo,
        presentismo_threshold: Number(umbralPresentismo),
        presentismo_bonus_rate: Number(tasaBono) / 100,
        presentismo_mode: modoPresentismo,
      };

      const res = await api.post('/liquidaciones/generar', body);
      setResultado(res.data);

      // Mapear gastosDeduct si el backend retorna meta por vendedora
      try {
        const map = {};
        const results = res.data?.result?.results || [];
        for (const r of results) {
          const idCreado = r?.detalle?.created?.id;
          const gastosDeduct = r?.detalle?.meta?.gastosDeduct || 0;
          if (idCreado) map[idCreado] = gastosDeduct;
        }
        setGastosMap(map);
      } catch (err) {
        console.warn('No se pudo mapear gastosDeduct:', err);
      }

      // Luego de generar, recargo la lista para mostrar lo creado
      await listarLiquidaciones();
    } catch (error) {
      console.error('Error al generar liquidaciones:', error);
      alert('Error al generar liquidaciones. Revisa la consola.');
    } finally {
      setCargando(false);
    }
  };

  // Obtiene las liquidaciones existentes para el periodo
  const listarLiquidaciones = async () => {
    try {
      const res = await api.get('/liquidaciones', { params: { periodo } });
      setListaLiquidaciones(res.data.liquidaciones || []);
    } catch (error) {
      console.error('Error al listar liquidaciones:', error);
      setListaLiquidaciones([]);
    }
  };

  // Marca una liquidación como pagada (PUT /liquidaciones/:id/pagar)
  const marcarComoPagada = async (id) => {
    try {
      await api.put(`/liquidaciones/${id}/pagar`);
      alert('Liquidación marcada como pagada');
      await listarLiquidaciones();
    } catch (error) {
      console.error('Error al marcar liquidación como pagada:', error);
      alert('Error al marcar como pagada');
    }
  };

  return (
    <div>
      <h3>Liquidaciones</h3>

      {/* Controles principales: periodo y parámetros de presentismo */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>Periodo:</label>
        <input type="month" value={periodo} onChange={(e)=>setPeriodo(e.target.value)} />

        <label>Umbral presentismo (% mínimo para bono):</label>
        <input type="number" value={umbralPresentismo} onChange={(e)=>setUmbralPresentismo(e.target.value)} style={{width:100}} />

        <label>Tasa bono (%):</label>
        <input type="number" step="0.1" value={tasaBono} onChange={(e)=>setTasaBono(e.target.value)} style={{width:100}} />

        <label>Modo presentismo:</label>
        <select value={modoPresentismo} onChange={(e)=>setModoPresentismo(e.target.value)}>
          <option value="calendario">Calendario (todos los días)</option>
          <option value="habiles">Días hábiles (lun-vie)</option>
        </select>

        <button onClick={generarLiquidaciones} disabled={cargando}>{cargando ? 'Generando...' : 'Generar'}</button>
        <button onClick={listarLiquidaciones}>Listar</button>
      </div>

      {/* Explicación breve sobre el umbral de presentismo para el usuario */}
      <div style={{ marginTop: 8, fontSize: 13, color: '#444' }}>
        <strong>Nota:</strong> El <em>umbral de presentismo</em> es el porcentaje mínimo de días
        presentes que la vendedora debe alcanzar en el período para recibir el bono de presentismo.
        Si el porcentaje de presentismo está por debajo del umbral, se aplica un descuento en lugar del bono.
      </div>

      {/* Resultado detallado tal como lo retorna el backend */}
      {resultado && (
        <div style={{ marginTop: 12, border: '1px solid #ddd', padding: 8 }}>
          <h4>Resultado (detalle del backend)</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}

      {/* Tabla de liquidaciones guardadas para el periodo */}
      <div style={{ marginTop: 12 }}>
        <h4>Liquidaciones ({listaLiquidaciones.length})</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Vendedora</th>
              <th>Periodo</th>
              <th>Sueldo</th>
              <th>Comisiones</th>
              <th>Bonos</th>
              <th>Desc. Presentismo</th>
              <th>Gastos descontados</th>
              <th>Total Pagar</th>
              <th>Estado</th>
              <th>Pagado Por</th>
              <th>Pagado En</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {listaLiquidaciones.map(l => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.vendedora?.nombre || l.vendedora_id}</td>
                <td>{l.periodo}</td>
                <td>{Number(l.sueldo_base || 0).toFixed(2)}</td>
                <td>{Number(l.comisiones || 0).toFixed(2)}</td>
                <td>{Number(l.bonos || 0).toFixed(2)}</td>
                <td>{Number(l.presentismo_descuento || 0).toFixed(2)}</td>
                <td>{Number(gastosMap[l.id] || 0).toFixed(2)}</td>
                <td>{Number(l.total_pagar || 0).toFixed(2)}</td>
                <td>{l.estado}</td>
                <td>{l.pagado_por_usuario?.nombre || ''}</td>
                <td>{l.pagado_en ? new Date(l.pagado_en).toLocaleString() : ''}</td>
                <td>{l.estado !== 'pagada' && <button onClick={()=>marcarComoPagada(l.id)}>Marcar pagada</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
