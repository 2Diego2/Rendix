import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { validarLiquidacionFrontend } from '../utils/validators';
import { NotificationContainer } from './Notification';
import './Css/Liquidaciones.css';

// Componente para generar y listar liquidaciones
// Variables y funciones en español para facilitar mantenimiento
export default function Liquidaciones() {
  // Periodo en formato YYYY-MM
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0, 7));

  // Umbral de presentismo: porcentaje mínimo de días presentes para recibir el bono
  // Ejemplo: 85 significa 85%.
  const [umbralPresentismo, setUmbralPresentismo] = useState(85);

  // Ahora se acepta como porcentaje en la UI (ej. 10 = 10%) y se convertirá a decimal al enviar
  const [tasaBono, setTasaBono] = useState(10);

  // Modo de cálculo de presentismo: 'calendario' o 'habiles'
  const [modoPresentismo, setModoPresentismo] = useState('calendario');

  // Lista de liquidaciones ya guardadas en la BD para el periodo seleccionado
  const [listaLiquidaciones, setListaLiquidaciones] = useState([]);

  // Notificaciones
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration: 3000 }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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

      const valid = validarLiquidacionFrontend({ periodo: body.periodo, presentismo_threshold: body.presentismo_threshold, presentismo_bonus_rate: body.presentismo_bonus_rate, presentismo_mode: body.presentismo_mode });
      if (!valid.valid) {
        addNotification('Errores: ' + valid.errors.join('; '), 'error');
        setCargando(false);
        return;
      }

      const res = await api.post('/liquidaciones/generar', body);

      if (res.data?.result?.results) {
        const errores = res.data.result.results.filter(r => !r.ok);
        if (errores.length > 0) {
          const sonDuplicados = errores.every(e => e.error && e.error.includes('ya existente'));
          if (sonDuplicados) {
            addNotification('Las liquidaciones para este periodo ya están generadas.', 'warning');
          } else {
            addNotification(`Se generaron con ${errores.length} errores.`, 'warning');
          }
        } else {
          addNotification('Liquidaciones generadas correctamente', 'success');
        }
      }

      // Luego de generar, recargo la lista para mostrar lo creado
      await listarLiquidaciones();
    } catch (error) {
      console.error('Error al generar liquidaciones:', error);
      addNotification('Error al generar liquidaciones.', 'error');
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
      addNotification('Liquidación marcada como pagada', 'success');
      await listarLiquidaciones();
    } catch (error) {
      console.error('Error al marcar liquidación como pagada:', error);
      addNotification('Error al marcar como pagada', 'error');
    }
  };

  // Eliminar una liquidación (DELETE /liquidaciones/:id)
  const eliminarLiquidacion = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta liquidación? Podrás volver a generarla.')) return;
    try {
      await api.delete(`/liquidaciones/${id}`);
      addNotification('Liquidación eliminada correctamente', 'success');
      await listarLiquidaciones();
    } catch (error) {
      console.error('Error al eliminar liquidación:', error);
      addNotification('Error al eliminar liquidación', 'error');
    }
  };

  // Exportar a Excel (Funcionalidad de Fran)
  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      // Usamos fetch directo para manejar el blob, o podríamos usar axios con responseType: 'blob'
      const res = await fetch("http://localhost:3001/liquidaciones/excel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "liquidaciones.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Error exportando Excel", err);
      addNotification("Error al exportar Excel", "error");
    }
  };

  // Cargar al inicio
  useEffect(() => {
    listarLiquidaciones();
  }, [periodo]);

  return (
    <div className="liquidaciones-container">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      {/* Header */}
      <div className="page-header">
        <h3 className="page-title">Gestión de Liquidaciones</h3>
        <button
          className="btn btn-outline"
          onClick={handleExportExcel}
          title="Descargar reporte en Excel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Exportar Excel
        </button>
      </div>

      {/* Panel de Control */}
      <div className="control-panel">
        <div className="control-group">
          <label className="control-label">Periodo</label>
          <input
            type="month"
            className="input-control"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          />
        </div>

        <div className="control-group">
          <label className="control-label">Umbral Presentismo (%)</label>
          <input
            type="number"
            className="input-control"
            value={umbralPresentismo}
            onChange={(e) => setUmbralPresentismo(e.target.value)}
            placeholder="Ej: 85"
          />
        </div>

        <div className="control-group">
          <label className="control-label">Tasa Bono (%)</label>
          <input
            type="number"
            step="0.1"
            className="input-control"
            value={tasaBono}
            onChange={(e) => setTasaBono(e.target.value)}
            placeholder="Ej: 10"
          />
        </div>

        <div className="control-group">
          <label className="control-label">Modo Presentismo</label>
          <select
            className="input-control select-control"
            value={modoPresentismo}
            onChange={(e) => setModoPresentismo(e.target.value)}
          >
            <option value="calendario">Calendario (todos los días)</option>
            <option value="habiles">Días hábiles (lun-vie)</option>
          </select>
        </div>

        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={generarLiquidaciones}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <div className="spinner"></div>
                Generando...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
                Generar
              </>
            )}
          </button>
          <button
            className="btn btn-outline"
            onClick={listarLiquidaciones}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Listar
          </button>
        </div>
      </div>

      {/* Nota Informativa */}
      <div className="info-note">
        <div style={{ display: 'flex', gap: '12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--info-600)', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div>
            <strong>Nota:</strong> El <em>umbral de presentismo</em> es el porcentaje mínimo de días presentes para recibir el bono.
            Si el porcentaje está por debajo del umbral, se aplicará un descuento equivalente.
            <br />
            <em>La tasa bono es el porcentaje adicional que se suma al sueldo base si se cumple el umbral de presentismo.</em>
            <br />
            <strong>Es decir, si de 30 días decidimos que el umbral es {umbralPresentismo}, entonces se debe haber asistido al menos {Math.ceil((umbralPresentismo / 100) * 30)} días para recibir el bono completo.</strong>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="table-wrapper">
        <h4 className="table-header-title">Liquidaciones del Periodo ({listaLiquidaciones.length})</h4>

        {listaLiquidaciones.length === 0 ? (
          <div className="empty-state">No hay liquidaciones generadas para este periodo.</div>
        ) : (
          <table className="financial-table">
            <thead>
              <tr>
                <th>Vendedor/a</th>
                <th>Periodo</th>
                <th className="text-right">Sueldo Base</th>
                <th className="text-right">Comisiones</th>
                <th className="text-right">Bonos</th>
                <th className="text-right">Desc. Pres.</th>
                <th className="text-right">Gastos Desc.</th>
                <th className="text-right">Total a Pagar</th>
                <th>Estado</th>
                <th>Pagado Por</th>
                <th>Fecha Pago</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {listaLiquidaciones.map(l => (
                <tr key={l.id}>

                  <td style={{ fontWeight: 500 }}>{l.vendedora?.nombre || l.vendedora_id}</td>
                  <td>{l.periodo}</td>
                  <td className="text-right">${Number(l.sueldo_base || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  <td className="text-right">${Number(l.comisiones || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  <td className="text-right" style={{ color: 'var(--success-600)' }}>${Number(l.bonos || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  <td className="text-right" style={{ color: 'var(--error-600)' }}>${Number(l.presentismo_descuento || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  <td className="text-right">${Number(l.gastos_deduct || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  <td className="text-right col-total">${Number(l.total_pagar || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`status-badge ${l.estado === 'pagada' ? 'status-pagada' : 'status-generada'}`}>
                      {l.estado}
                    </span>
                  </td>
                  <td>{l.pagado_por_usuario?.nombre || '-'}</td>
                  <td>{l.pagado_en ? new Date(l.pagado_en).toLocaleDateString() : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {l.estado !== 'pagada' && (
                        <>
                          <button
                            className="btn btn-action-pay"
                            onClick={() => marcarComoPagada(l.id)}
                            title="Marcar como pagada"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23"></line>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            Pagar
                          </button>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', borderColor: 'var(--error-300)', color: 'var(--error-600)' }}
                            onClick={() => eliminarLiquidacion(l.id)}
                            title="Eliminar liquidación"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

    </div>
  );
}
