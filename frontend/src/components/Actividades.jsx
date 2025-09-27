export function Actividades() {
  const actividades = [
    { id: 1, empleado: "María García", actividad: "Capacitación", fecha: "2024-01-15", estado: "Completada" },
    { id: 2, empleado: "Carlos López", actividad: "Evaluación", fecha: "2024-01-16", estado: "Pendiente" },
    { id: 3, empleado: "Ana Martínez", actividad: "Reunión", fecha: "2024-01-17", estado: "En Progreso" },
    { id: 4, empleado: "Luis Rodríguez", actividad: "Proyecto", fecha: "2024-01-18", estado: "Completada" },
  ]

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Total Actividades</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-1)" }}>
            156
          </div>
          <div className="stat-change">+8% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Completadas</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-2)" }}>
            142
          </div>
          <div className="stat-change">+12% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">En Progreso</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-3)" }}>
            8
          </div>
          <div className="stat-change">-2% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Pendientes</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-4)" }}>
            6
          </div>
          <div className="stat-change">-15% desde el mes pasado</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Registro de Actividades</div>
          <div className="chart-subtitle">Actividades recientes del equipo</div>
        </div>

        <div style={{ padding: "20px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Empleado
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Actividad
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Fecha
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {actividades.map((actividad) => (
                <tr key={actividad.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px", color: "var(--foreground)" }}>{actividad.empleado}</td>
                  <td style={{ padding: "12px", color: "var(--foreground)" }}>{actividad.actividad}</td>
                  <td style={{ padding: "12px", color: "var(--muted-foreground)" }}>{actividad.fecha}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor:
                          actividad.estado === "Completada"
                            ? "var(--chart-2)"
                            : actividad.estado === "En Progreso"
                              ? "var(--chart-3)"
                              : "var(--chart-4)",
                        color: "white",
                      }}
                    >
                      {actividad.estado}
                    </span>
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

export default Actividades