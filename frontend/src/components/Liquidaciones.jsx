export function Liquidaciones() {
  const liquidacionesData = [
    {
      id: 1,
      empleado: "María García",
      periodo: "Enero 2024",
      salarioBase: "$4,500",
      bonos: "$800",
      descuentos: "$450",
      total: "$4,850",
    },
    {
      id: 2,
      empleado: "Carlos López",
      periodo: "Enero 2024",
      salarioBase: "$3,800",
      bonos: "$600",
      descuentos: "$380",
      total: "$4,020",
    },
    {
      id: 3,
      empleado: "Ana Martínez",
      periodo: "Enero 2024",
      salarioBase: "$5,200",
      bonos: "$1,000",
      descuentos: "$520",
      total: "$5,680",
    },
    {
      id: 4,
      empleado: "Luis Rodríguez",
      periodo: "Enero 2024",
      salarioBase: "$4,100",
      bonos: "$700",
      descuentos: "$410",
      total: "$4,390",
    },
  ]

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Total Liquidaciones</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-1)" }}>
            $186,450
          </div>
          <div className="stat-change">+5% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Empleados Liquidados</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-2)" }}>
            42
          </div>
          <div className="stat-change">+3% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Promedio por Empleado</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-3)" }}>
            $4,439
          </div>
          <div className="stat-change">+2% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Bonos Totales</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-4)" }}>
            $31,200
          </div>
          <div className="stat-change">+12% desde el mes pasado</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Registro de Liquidaciones</div>
          <div className="chart-subtitle">Liquidaciones procesadas recientemente</div>
        </div>

        <div style={{ padding: "20px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Empleado
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Período
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Salario Base
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Bonos
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Descuentos
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {liquidacionesData.map((liquidacion) => (
                <tr key={liquidacion.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px", color: "var(--foreground)", fontWeight: "500" }}>
                    {liquidacion.empleado}
                  </td>
                  <td style={{ padding: "12px", color: "var(--muted-foreground)" }}>{liquidacion.periodo}</td>
                  <td style={{ padding: "12px", color: "var(--foreground)" }}>{liquidacion.salarioBase}</td>
                  <td style={{ padding: "12px", color: "var(--chart-4)" }}>{liquidacion.bonos}</td>
                  <td style={{ padding: "12px", color: "var(--chart-2)" }}>{liquidacion.descuentos}</td>
                  <td style={{ padding: "12px", color: "var(--chart-1)", fontWeight: "600" }}>{liquidacion.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
