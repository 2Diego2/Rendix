const chartData = [
  { month: "Ene", contrataciones: 45, bajas: 12 },
  { month: "Feb", contrataciones: 52, bajas: 18 },
  { month: "Mar", contrataciones: 48, bajas: 15 },
  { month: "Abr", contrataciones: 61, bajas: 22 },
  { month: "May", contrataciones: 55, bajas: 19 },
  { month: "Jun", contrataciones: 67, bajas: 25 },
  { month: "Jul", contrataciones: 59, bajas: 21 },
  { month: "Ago", contrataciones: 64, bajas: 28 },
  { month: "Sep", contrataciones: 58, bajas: 24 },
  { month: "Oct", contrataciones: 72, bajas: 31 },
  { month: "Nov", contrataciones: 69, bajas: 27 },
  { month: "Dic", contrataciones: 75, bajas: 33 },
]

function SimpleBarChart({ data }) {
  const maxValue = Math.max(...data.flatMap((d) => [d.contrataciones, d.bajas]))

  return (
    <div style={{ display: "flex", alignItems: "end", gap: "8px", height: "280px", padding: "20px 0" }}>
      {data.map((item, index) => (
        <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "end", gap: "2px", marginBottom: "8px" }}>
            <div
              style={{
                width: "16px",
                height: `${(item.contrataciones / maxValue) * 200}px`,
                backgroundColor: "var(--chart-1)",
                borderRadius: "2px 2px 0 0",
                minHeight: "4px",
              }}
              title={`Contrataciones: ${item.contrataciones}`}
            />
            <div
              style={{
                width: "16px",
                height: `${(item.bajas / maxValue) * 200}px`,
                backgroundColor: "var(--chart-2)",
                borderRadius: "2px 2px 0 0",
                minHeight: "4px",
              }}
              title={`Bajas: ${item.bajas}`}
            />
          </div>
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{item.month}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardContent() {
  return (
    <div className="dashboard-content">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Nuevas Contrataciones</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-1)" }}>
            40
          </div>
          <div className="stat-change">+12% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Bajas</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-2)" }}>
            15
          </div>
          <div className="stat-change">-8% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Total Empleados</div>
          </div>
          <div className="stat-value">1,247</div>
          <div className="stat-change">+3% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Tasa de Retención</div>
          </div>
          <div className="stat-value">94.2%</div>
          <div className="stat-change">+1.2% desde el mes pasado</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Contrataciones vs. Bajas</div>
          <div className="chart-subtitle">Comparativa mensual del último año</div>
        </div>

        <div className="chart-container">
          <SimpleBarChart data={chartData} />
        </div>

        {/* Legend */}
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color contrataciones"></div>
            <span className="legend-text">Contrataciones</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bajas"></div>
            <span className="legend-text">Bajas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
