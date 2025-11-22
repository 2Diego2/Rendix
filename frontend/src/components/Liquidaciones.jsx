<<<<<<< HEAD
import React, { useState } from 'react';
import api from '../utils/api';
import { validarLiquidacionFrontend } from '../utils/validators';
import './Css/Liquidaciones.css';

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

      const valid = validarLiquidacionFrontend({ periodo: body.periodo, presentismo_threshold: body.presentismo_threshold, presentismo_bonus_rate: body.presentismo_bonus_rate, presentismo_mode: body.presentismo_mode });
      if (!valid.valid) {
        alert('Errores: ' + valid.errors.join('; '));
        setCargando(false);
        return;
      }

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
    <div className="liquidaciones-container">
      
      {/* Header */}
      <div className="page-header">
        <h3 className="page-title">Gestión de Liquidaciones</h3>
      </div>

      {/* Panel de Control */}
      <div className="control-panel">
        <div className="control-group">
          <label className="control-label">Periodo</label>
          <input 
            type="month" 
            className="input-control"
            value={periodo} 
            onChange={(e)=>setPeriodo(e.target.value)} 
          />
        </div>

        <div className="control-group">
          <label className="control-label">Umbral Presentismo (%)</label>
          <input 
            type="number" 
            className="input-control"
            value={umbralPresentismo} 
            onChange={(e)=>setUmbralPresentismo(e.target.value)} 
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
            onChange={(e)=>setTasaBono(e.target.value)} 
            placeholder="Ej: 10"
          />
        </div>

        <div className="control-group">
          <label className="control-label">Modo Presentismo</label>
          <select 
            className="input-control select-control"
            value={modoPresentismo} 
            onChange={(e)=>setModoPresentismo(e.target.value)}
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
            {cargando ? '⚙️ Generando...' : 'Generar'}
          </button>
          <button 
            className="btn btn-outline" 
            onClick={listarLiquidaciones}
          >
            Listar
          </button>
        </div>
      </div>

      {/* Nota Informativa */}
      <div className="info-note">
        <strong>Nota:</strong> El <em>umbral de presentismo</em> es el porcentaje mínimo de días presentes para recibir el bono.
        Si el porcentaje está por debajo del umbral, se aplicará un descuento equivalente. {}
        <br/>
        <em>La tasa bono es el porcentaje adicional que se suma al sueldo base si se cumple el umbral de presentismo.</em>  
        <br/>
        <strong>Es decir, si de 30 días decidimos que el umbral es {umbralPresentismo}, entonces se debe haber asistido al menos {Math.ceil((umbralPresentismo/100)*30)} días para recibir el bono completo.</strong>
      </div>

      {/* Debug Result (Opcional, puedes ocultarlo si prefieres) */}
      {resultado && (
        <div className="debug-area">
          <div className="debug-title">Respuesta del servidor:</div>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}

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
=======
import React, { useEffect, useState } from "react";
import api from "../utils/api";

export function Liquidaciones() {
  const [liquidaciones, setLiquidaciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/liquidaciones");
        setLiquidaciones(res.data);
      } catch (error) {
        console.error("Error cargando liquidaciones", error);
      }
    };
    fetchData();
  }, []);

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem("token");
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
    }
  };

  return (
    <div className="dashboard-content">

      {/* Tabla de Liquidaciones */}
      <div className="chart-card">
        <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="chart-title">Registro de Liquidaciones</div>
          <button
            className="button"
            onClick={handleExportExcel}
            style={{
              padding: "8px 14px",
              backgroundColor: "var(--chart-3)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Exportar Excel
          </button>
        </div>

        <div style={{ padding: "0px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px" }}>Empleado</th>
                <th style={{ padding: "12px" }}>Período</th>
                <th style={{ padding: "12px" }}>Salario Base</th>
                <th style={{ padding: "12px" }}>Bonos</th>
                <th style={{ padding: "12px" }}>Descuentos</th>
                <th style={{ padding: "12px" }}>Total</th>
>>>>>>> origin/franrama
              </tr>
            </thead>

            <tbody>
<<<<<<< HEAD
              {listaLiquidaciones.map(l => (
                <tr key={l.id}>
                
                  <td style={{fontWeight: 500}}>{l.vendedora?.nombre || l.vendedora_id}</td>
                  <td>{l.periodo}</td>
                  <td className="text-right">{Number(l.sueldo_base || 0).toFixed(2)}</td>
                  <td className="text-right">{Number(l.comisiones || 0).toFixed(2)}</td>
                  <td className="text-right" style={{color: '#166534'}}>{Number(l.bonos || 0).toFixed(2)}</td>
                  <td className="text-right" style={{color: '#991b1b'}}>{Number(l.presentismo_descuento || 0).toFixed(2)}</td>
                  <td className="text-right">{Number(gastosMap[l.id] || 0).toFixed(2)}</td>
                  <td className="text-right col-total">{Number(l.total_pagar || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${l.estado === 'pagada' ? 'status-pagada' : 'status-generada'}`}>
                      {l.estado}
                    </span>
                  </td>
                  <td>{l.pagado_por_usuario?.nombre || '-'}</td>
                  <td>{l.pagado_en ? new Date(l.pagado_en).toLocaleDateString() : '-'}</td>
                  <td>
                    {l.estado !== 'pagada' && (
                      <button 
                        className="btn btn-action-pay" 
                        onClick={()=>marcarComoPagada(l.id)}
                      >
                        $ Pagar
                      </button>
                    )}
                  </td>
=======
              {liquidaciones.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}>{l.empleado}</td>
                  <td style={{ padding: "12px" }}>{l.periodo}</td>
                  <td style={{ padding: "12px" }}>${l.salarioBase}</td>
                  <td style={{ padding: "12px", color: "var(--chart-4)" }}>${l.bonos}</td>
                  <td style={{ padding: "12px", color: "var(--chart-2)" }}>${l.descuentos}</td>
                  <td style={{ padding: "12px", color: "var(--chart-1)", fontWeight: "600" }}>${l.total}</td>
>>>>>>> origin/franrama
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/franrama
