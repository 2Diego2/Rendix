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
  ResponsiveContainer, // Importante para que los gráficos se adapten
} from "recharts";
import { useFiltro } from './Filtro/FiltroContext'; // Asumo que está en esa ruta
import api from '../utils/api';

// --- Colores para los gráficos ---
const COLORS_PIE = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]; // Azul, Verde, Amarillo, Naranja
const COLOR_VENTAS = "#0088FE"; // Azul
const COLOR_GASTOS = "#FF8042"; // Naranja

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


  // Función para mostrar el texto del filtro actual
  const getPeriodoLabel = (dias) => {
    if (dias === 0) return "Hoy";
    return `Últimos ${dias} días`;
  };
  const periodoLabel = getPeriodoLabel(rangoDias);

  // Cargar y PROCESAR datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const endpointVentas = rangoDias === 0
          ? `http://localhost:3001/ventas/hoy`
          : `http://localhost:3001/ventas/rango?dias=${rangoDias}`;

        const endpointGastos = rangoDias === 0
          ? `http://localhost:3001/gastos/hoy`
          : `http://localhost:3001/gastos/rango?dias=${rangoDias}`;

        // ===================================================================
        // --- COMENTARIO PARA FUTURA BASE DE DATOS (PostgreSQL/Prisma) ---
        //
        // Con una BD real, el procesamiento de datos (agrupar por día,
        // sumar categorías) debería hacerse en el BACKEND, no aquí.
        // La API debería devolver los datos listos para los gráficos.
        //
        // EJEMPLO:
        // En lugar de usar fetch, usamos el cliente `api` con interceptores:
        // const res = await api.get(`/api/dashboard?dias=${rangoDias}`);
        // const data = await res.json();
        // setVentas(data.kpis.ventas);
        // setGastos(data.kpis.gastos);
        // setLineChartData(data.tendencia);
        // setGastosPieData(data.gastosPorCategoria);
        //
        // ===================================================================

        // Usamos el cliente Axios `api` (con interceptores) para llamadas al backend
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
        // Agrupamos todas las transacciones por fecha
        const datosAgrupados = {};

        // (Usamos los arrays '...Hoy' que en realidad contienen todos los datos del rango)
        (dataVentas.ventasHoy || []).forEach(venta => {
          // Formatear fecha correctamente (puede venir como Date o string)
          let fechaStr = venta.fecha;
          if (fechaStr instanceof Date) {
            fechaStr = fechaStr.toISOString().split('T')[0];
          } else if (typeof fechaStr === 'string') {
            fechaStr = fechaStr.split('T')[0]; // Tomar solo la parte de la fecha
          }
          datosAgrupados[fechaStr] = datosAgrupados[fechaStr] || { fecha: fechaStr, ventas: 0, gastos: 0 };
          datosAgrupados[fechaStr].ventas += Number(venta.total || 0);
        });

        (dataGastos.gastosHoy || dataGastos.gastos || []).forEach(gasto => {
          // Formatear fecha correctamente
          let fechaStr = gasto.fecha;
          if (fechaStr instanceof Date) {
            fechaStr = fechaStr.toISOString().split('T')[0];
          } else if (typeof fechaStr === 'string') {
            fechaStr = fechaStr.split('T')[0];
          }
          datosAgrupados[fechaStr] = datosAgrupados[fechaStr] || { fecha: fechaStr, ventas: 0, gastos: 0 };
          datosAgrupados[fechaStr].gastos += Number(gasto.monto || 0);
        });

        // Convertimos el objeto a array y lo ordenamos por fecha
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
        // Resetear todo en caso de error
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
  }, [rangoDias]); // Se ejecuta cada vez que cambia el filtro del Header

  // Formateador de moneda para los gráficos
  const formatCurrency = (value) => `$${value.toLocaleString()}`;

  if (loading) return <div className="dashboard-content">Cargando datos del dashboard...</div>;

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>


      {/* --- SECCIÓN 1: KPIs (Tarjetas de Resumen) --- */}
      <div
        className="stats-grid"
        style={{
          display: "grid",
          // 4 columnas en desktop, 2 en tablet, 1 en móvil
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px"
        }}
      >
        {/* Tarjeta de Ganancia Neta */}
        <div className="card" style={{ padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#555" }}>Ganancia Neta ({periodoLabel})</h3>
          <p style={{ fontSize: "28px", fontWeight: "700", color: gananciaNeta >= 0 ? "#00C49F" : "#FF8042" }}>
            {formatCurrency(gananciaNeta)}
          </p>
          <span style={{ fontSize: "14px", color: "#777" }}>Ventas - Gastos</span>
        </div>

        {/* Tarjeta de Ventas Totales */}
        <div className="card" style={{ padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#555" }}>Ventas ({periodoLabel})</h3>
          <p style={{ fontSize: "28px", fontWeight: "700", color: COLOR_VENTAS }}>
            {formatCurrency(ventas.total)}
          </p>
          <span style={{ fontSize: "14px", color: "#777" }}>{ventas.cantidad} operaciones</span>
        </div>

        {/* Tarjeta de Gastos Totales */}
        <div className="card" style={{ padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#555" }}>Gastos ({periodoLabel})</h3>
          <p style={{ fontSize: "28px", fontWeight: "700", color: COLOR_GASTOS }}>
            {formatCurrency(gastos.total)}
          </p>
          <span style={{ fontSize: "14px", color: "#777" }}>{gastos.cantidad} registros</span>
        </div>

        {/* Tarjeta de Ticket Promedio */}
        <div className="card" style={{ padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#555" }}>Ticket Promedio ({periodoLabel})</h3>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#8884d8" }}>
            {formatCurrency(ticketPromedio)}
          </p>
          <span style={{ fontSize: "14px", color: "#777" }}>Ventas / Operaciones</span>
        </div>
      </div>

      {/* --- SECCIÓN 2: Gráfico de Tendencia (Líneas) --- */}
      <div className="chart-card" style={{ padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
          Tendencia de Rentabilidad ({periodoLabel})
        </h3>
        {lineChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="fecha" fontSize={12} />
              <YAxis tickFormatter={formatCurrency} fontSize={12} />
              <Tooltip formatter={formatCurrency} />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke={COLOR_VENTAS} strokeWidth={2} />
              <Line type="monotone" dataKey="gastos" stroke={COLOR_GASTOS} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No hay suficientes datos para mostrar una tendencia.</p>
        )}
      </div>

      {/* --- SECCIÓN 3: Desgloses (2 Columnas) --- */}
      <div
        className="bottom-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px"
        }}
      >
        {/* Columna Izquierda: Gastos por Categoría */}
        <div className="chart-card" style={{ padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
            Gastos por Categoría ({periodoLabel})
          </h3>
          {gastosPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gastosPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60} // Esto lo convierte en Donut
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {gastosPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatCurrency} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay gastos registrados en este período.</p>
          )}
        </div>

        {/* Columna Derecha: Últimos Gastos */}
        <div className="chart-card" style={{ padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
            Últimos Gastos Registrados
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {ultimosGastos.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Concepto</th>
                    <th style={{ padding: "8px" }}>Categoría</th>
                    <th style={{ padding: "8px" }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosGastos.map((gasto, index) => (
                    <tr key={index} style={{ borderBottom: "1Gpx solid #f9f9f9" }}>
                      <td style={{ padding: "8px" }}>{gasto.concepto}</td>
                      <td style={{ padding: "8px" }}>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          // Si es "Fijo" (sueldos), forzamos el color Naranja, si no busca en el array, si no gris.
                          backgroundColor: gasto.categoria === 'Fijo' ? '#FF8042' : (COLORS_PIE[gastosPieData.findIndex(p => p.name === gasto.categoria) % COLORS_PIE.length] || "#ccc"),
                          color: "white"
                        }}>
                          {gasto.categoria}
                        </span>
                      </td>
                      <td style={{ padding: "8px", fontWeight: "600" }}>
                        {formatCurrency(gasto.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay gastos recientes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}