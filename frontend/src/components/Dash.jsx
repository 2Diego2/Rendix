import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useFiltro } from './Filtro/FiltroContext';
import api from '../utils/api';
import './Css/Dash.css';

// --- Colores para los gráficos ---
const COLORS_PIE = ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#8b5cf6", "#ec4899"];
const COLOR_VENTAS = "#0ea5e9"; // primary-500
const COLOR_GASTOS = "#f97316"; // orange-500

export function DashboardContent() {
  const { rangoDias } = useFiltro();
  const [loading, setLoading] = useState(true);

  // --- Estados para KPIs ---
  const [ventas, setVentas] = useState({ total: 0, cantidad: 0 });
  const [gastos, setGastos] = useState({ total: 0, cantidad: 0 });
  const [gananciaNeta, setGananciaNeta] = useState(0);
  const [ticketPromedio, setTicketPromedio] = useState(0);

  // --- Estados para Gráficos ---
  const [lineChartData, setLineChartData] = useState([]);
  const [gastosPieData, setGastosPieData] = useState([]);
  const [ultimosGastos, setUltimosGastos] = useState([]);

  const getPeriodoLabel = (dias) => {
    if (dias === 0) return "Hoy";
    return `Últimos ${dias} días`;
  };
  const periodoLabel = getPeriodoLabel(rangoDias);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const endpointVentas = rangoDias === 0
          ? `/ventas/hoy`
          : `/ventas/rango?dias=${rangoDias}`;

        const endpointGastos = rangoDias === 0
          ? `/gastos/hoy`
          : `/gastos/rango?dias=${rangoDias}`;

        const [{ data: dataVentas }, { data: dataGastos }] = await Promise.all([
          api.get(endpointVentas),
          api.get(endpointGastos),
        ]);

        // --- 1. Procesar KPIs ---
        const totalVentas = dataVentas.totalHoy || 0;
        const cantVentas = dataVentas.cantidadHoy || 0;
        const totalGastos = dataGastos.totalHoy || dataGastos.total || 0;
        const cantGastos = dataGastos.cantidadHoy || (dataGastos.gastosHoy || dataGastos.gastos || []).length || 0;

        setVentas({ total: totalVentas, cantidad: cantVentas });
        setGastos({ total: totalGastos, cantidad: cantGastos });

        const ganancia = totalVentas - totalGastos;
        setGananciaNeta(ganancia);

        const promedio = cantVentas === 0 ? 0 : totalVentas / cantVentas;
        setTicketPromedio(promedio);

        // --- 2. Procesar Datos para Gráfico de Líneas (Tendencia) ---
        const datosAgrupados = {};

        (dataVentas.ventasHoy || []).forEach(venta => {
          let fechaStr = venta.fecha;
          if (fechaStr instanceof Date) {
            fechaStr = fechaStr.toISOString().split('T')[0];
          } else if (typeof fechaStr === 'string') {
            fechaStr = fechaStr.split('T')[0];
          }
          datosAgrupados[fechaStr] = datosAgrupados[fechaStr] || { fecha: fechaStr, ventas: 0, gastos: 0 };
          datosAgrupados[fechaStr].ventas += Number(venta.total || 0);
        });

        (dataGastos.gastosHoy || dataGastos.gastos || []).forEach(gasto => {
          let fechaStr = gasto.fecha;
          if (fechaStr instanceof Date) {
            fechaStr = fechaStr.toISOString().split('T')[0];
          } else if (typeof fechaStr === 'string') {
            fechaStr = fechaStr.split('T')[0];
          }
          datosAgrupados[fechaStr] = datosAgrupados[fechaStr] || { fecha: fechaStr, ventas: 0, gastos: 0 };
          datosAgrupados[fechaStr].gastos += Number(gasto.monto || 0);
        });

        const processedLineData = Object.values(datosAgrupados).sort(
          (a, b) => new Date(a.fecha) - new Date(b.fecha)
        );
        setLineChartData(processedLineData);

        // --- 3. Procesar Datos para Gráfico de Torta (Gastos por Categoría) ---
        const gastosPorCategoria = {};
        (dataGastos.gastosHoy || dataGastos.gastos || []).forEach(gasto => {
          const cat = gasto.categoria || "Sin Categoría";
          gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + Number(gasto.monto || 0);
        });

        const processedPieData = Object.keys(gastosPorCategoria).map(name => ({
          name,
          value: gastosPorCategoria[name],
        }));
        setGastosPieData(processedPieData);

        // --- 4. Obtener Últimos Gastos ---
        setUltimosGastos((dataGastos.gastosHoy || dataGastos.gastos || []).slice(-5).reverse());

      } catch (err) {
        console.error("Error al obtener datos:", err);
        setVentas({ total: 0, cantidad: 0 });
        setGastos({ total: 0, cantidad: 0 });
        setGananciaNeta(0);
        setTicketPromedio(0);
        setLineChartData([]);
        setGastosPieData([]);
        setUltimosGastos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rangoDias]);

  const formatCurrency = (value) => `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;

  if (loading) return (
    <div className="dash-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="dash-container">

      {/* --- SECCIÓN 1: KPIs --- */}
      <div className="stats-grid">
        {/* Ganancia Neta */}
        <div className="kpi-card">
          <h3 className="kpi-title">Ganancia Neta ({periodoLabel})</h3>
          <p className={`kpi-value ${gananciaNeta >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(gananciaNeta)}
          </p>
          <span className="kpi-subtitle">Ventas - Gastos</span>
        </div>

        {/* Ventas Totales */}
        <div className="kpi-card">
          <h3 className="kpi-title">Ventas ({periodoLabel})</h3>
          <p className="kpi-value neutral" style={{ color: COLOR_VENTAS }}>
            {formatCurrency(ventas.total)}
          </p>
          <span className="kpi-subtitle">{ventas.cantidad} operaciones</span>
        </div>

        {/* Gastos Totales */}
        <div className="kpi-card">
          <h3 className="kpi-title">Gastos ({periodoLabel})</h3>
          <p className="kpi-value neutral" style={{ color: COLOR_GASTOS }}>
            {formatCurrency(gastos.total)}
          </p>
          <span className="kpi-subtitle">{gastos.cantidad} registros</span>
        </div>

        {/* Ticket Promedio */}
        <div className="kpi-card">
          <h3 className="kpi-title">Ticket Promedio</h3>
          <p className="kpi-value neutral" style={{ color: '#8b5cf6' }}>
            {formatCurrency(ticketPromedio)}
          </p>
          <span className="kpi-subtitle">Por venta realizada</span>
        </div>
      </div>

      {/* --- SECCIÓN 2: Gráfico de Tendencia --- */}
      <div className="chart-card">
        <h3 className="chart-title">
          Tendencia de Rentabilidad
        </h3>
        <div style={{ width: '100%', height: 300 }}>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer>
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="fecha"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  tickFormatter={(val) => `$${val}`}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="ventas" name="Ventas" stroke={COLOR_VENTAS} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="gastos" name="Gastos" stroke={COLOR_GASTOS} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
              No hay suficientes datos para mostrar tendencia.
            </div>
          )}
        </div>
      </div>

      {/* --- SECCIÓN 3: Desgloses --- */}
      <div className="bottom-grid">
        {/* Gastos por Categoría */}
        <div className="chart-card">
          <h3 className="chart-title">
            Gastos por Categoría
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            {gastosPieData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={gastosPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {gastosPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatCurrency} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                No hay gastos registrados.
              </div>
            )}
          </div>
        </div>

        {/* Últimos Gastos */}
        <div className="chart-card">
          <h3 className="chart-title">
            Últimos Gastos
          </h3>
          <div style={{ overflowY: "auto", maxHeight: "300px" }}>
            {ultimosGastos.length > 0 ? (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Categoría</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosGastos.map((gasto, index) => (
                    <tr key={index}>
                      <td>{gasto.concepto || gasto.detalle}</td>
                      <td>
                        <span
                          className="badge-cat"
                          style={{
                            backgroundColor: gasto.categoria === 'Fijo' ? '#f97316' :
                              (COLORS_PIE[gastosPieData.findIndex(p => p.name === gasto.categoria) % COLORS_PIE.length] || "#9ca3af")
                          }}
                        >
                          {gasto.categoria}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: "600" }}>
                        {formatCurrency(gasto.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)' }}>
                No hay gastos recientes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}