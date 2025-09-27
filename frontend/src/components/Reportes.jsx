export function Reportes() {
  const reportesData = [
    {
      id: 1,
      nombre: "Reporte Mensual de Ventas",
      tipo: "Ventas",
      fechaCreacion: "2024-01-15",
      estado: "Generado",
      tamaño: "2.4 MB",
    },
    {
      id: 2,
      nombre: "Análisis de Gastos Q1",
      tipo: "Gastos",
      fechaCreacion: "2024-01-10",
      estado: "En Proceso",
      tamaño: "1.8 MB",
    },
    {
      id: 3,
      nombre: "Liquidaciones Enero",
      tipo: "RRHH",
      fechaCreacion: "2024-01-08",
      estado: "Generado",
      tamaño: "3.2 MB",
    },
    {
      id: 4,
      nombre: "Actividades del Equipo",
      tipo: "Actividades",
      fechaCreacion: "2024-01-05",
      estado: "Generado",
      tamaño: "1.1 MB",
    },
  ]

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Reportes Generados</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-1)" }}>
            127
          </div>
          <div className="stat-change">+15% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">En Proceso</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-2)" }}>
            8
          </div>
          <div className="stat-change">-20% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Descargas Totales</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-3)" }}>
            1,456
          </div>
          <div className="stat-change">+22% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Tamaño Total</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-4)" }}>
            245 MB
          </div>
          <div className="stat-change">+8% desde el mes pasado</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Registro de Reportes</div>
          <div className="chart-subtitle">Reportes generados recientemente</div>
        </div>

        <div style={{ padding: "20px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Nombre
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Tipo
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Fecha
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Estado
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Tamaño
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {reportesData.map((reporte) => (
                <tr key={reporte.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px", color: "var(--foreground)", fontWeight: "500" }}>{reporte.nombre}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: "var(--chart-3)",
                        color: "white",
                      }}
                    >
                      {reporte.tipo}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "var(--muted-foreground)" }}>{reporte.fechaCreacion}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: reporte.estado === "Generado" ? "var(--chart-2)" : "var(--chart-4)",
                        color: "white",
                      }}
                    >
                      {reporte.estado}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "var(--muted-foreground)" }}>{reporte.tamaño}</td>
                  <td style={{ padding: "12px" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "12px" }}>
                      📥 Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
