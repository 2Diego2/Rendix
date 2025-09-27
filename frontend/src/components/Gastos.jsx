export function Gastos() {
  const gastosData = [
    {
      id: 1,
      concepto: "Oficina",
      descripcion: "Alquiler mensual",
      monto: "$3,200",
      fecha: "2024-01-01",
      categoria: "Fijo",
    },
    {
      id: 2,
      concepto: "Marketing",
      descripcion: "Campaña publicitaria",
      monto: "$1,800",
      fecha: "2024-01-05",
      categoria: "Variable",
    },
    {
      id: 3,
      concepto: "Tecnología",
      descripcion: "Software licencias",
      monto: "$950",
      fecha: "2024-01-10",
      categoria: "Fijo",
    },
    {
      id: 4,
      concepto: "Viajes",
      descripcion: "Conferencia anual",
      monto: "$2,400",
      fecha: "2024-01-12",
      categoria: "Variable",
    },
  ]

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Gastos Totales</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-1)" }}>
            $28,450
          </div>
          <div className="stat-change">+7% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Gastos Fijos</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-2)" }}>
            $18,200
          </div>
          <div className="stat-change">+2% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Gastos Variables</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-3)" }}>
            $10,250
          </div>
          <div className="stat-change">+15% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Presupuesto Restante</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-4)" }}>
            $11,550
          </div>
          <div className="stat-change">-7% desde el mes pasado</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Registro de Gastos</div>
          <div className="chart-subtitle">Gastos recientes registrados</div>
        </div>

        <div style={{ padding: "20px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Concepto
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Descripción
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Monto
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Fecha
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Categoría
                </th>
              </tr>
            </thead>
            <tbody>
              {gastosData.map((gasto) => (
                <tr key={gasto.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px", color: "var(--foreground)", fontWeight: "500" }}>{gasto.concepto}</td>
                  <td style={{ padding: "12px", color: "var(--foreground)" }}>{gasto.descripcion}</td>
                  <td style={{ padding: "12px", color: "var(--chart-1)", fontWeight: "600" }}>{gasto.monto}</td>
                  <td style={{ padding: "12px", color: "var(--muted-foreground)" }}>{gasto.fecha}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: gasto.categoria === "Fijo" ? "var(--chart-2)" : "var(--chart-3)",
                        color: "white",
                      }}
                    >
                      {gasto.categoria}
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
