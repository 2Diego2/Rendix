import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export function DashboardContent() {
  const [ventas, setVentas] = useState({ total: 0, cantidad: 0 });
  const [gastos, setGastos] = useState({ total: 0, cantidad: 0 });
  const [periodo, setPeriodo] = useState("hoy"); // 'hoy' | 'semana' | 'mes'
  const [loading, setLoading] = useState(true);

  // Cargar datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [resVentas, resGastos] = await Promise.all([
          fetch(`http://localhost:3001/ventas/${periodo}`),
          fetch(`http://localhost:3001/gastos/${periodo}`)
        ]);

        const dataVentas = await resVentas.json();
        const dataGastos = await resGastos.json();

        setVentas({ total: dataVentas.totalHoy || 0, cantidad: dataVentas.cantidadHoy || 0 });
        setGastos({ total: dataGastos.totalHoy || 0, cantidad: dataGastos.cantidadHoy || 0 });
      } catch (err) {
        console.error("Error al obtener datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo]);

  const dataPie = [
    { name: "Ventas", value: ventas.total },
    { name: "Gastos", value: gastos.total }
  ];

  const COLORS = ["#0088FE", "#FF8042"];

  if (loading) return <div className="dashboard-content">Cargando datos...</div>;

  return (
    <div className="dashboard-content">
      <h2 className="text-2xl font-semibold mb-4">Dashboard General</h2>

      {/* Selector de periodo */}
      <div className="periodo-selector mb-6">
        <label>Periodo: </label>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          style={{ marginLeft: "8px", padding: "4px" }}
        >
          <option value="hoy">Hoy</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
        </select>
      </div>

      {/* Tarjetas de resumen */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        <div className="card p-4 rounded-xl shadow-md bg-white">
          <h3 className="font-semibold text-lg mb-2">Ventas ({periodo})</h3>
          <p className="text-2xl font-bold text-blue-600">${ventas.total.toLocaleString()}</p>
          <span className="text-sm text-gray-500">{ventas.cantidad} operaciones registradas</span>
        </div>

        <div className="card p-4 rounded-xl shadow-md bg-white">
          <h3 className="font-semibold text-lg mb-2">Gastos ({periodo})</h3>
          <p className="text-2xl font-bold text-red-500">${gastos.total.toLocaleString()}</p>
          <span className="text-sm text-gray-500">{gastos.cantidad} gastos registrados</span>
        </div>
      </div>

      {/* Gráfico de torta */}
      <div className="chart-card mt-8 p-4 rounded-xl shadow-md bg-white">
        <h3 className="font-semibold mb-2">Relación Ventas vs Gastos</h3>
        <PieChart width={400} height={300}>
          <Pie
            data={dataPie}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {dataPie.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}
