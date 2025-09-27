export function Ventas() {
  const ventasData = [
    {
      id: 1,
      cliente: "Empresa ABC",
      producto: "Servicio Premium",
      monto: "$15,000",
      fecha: "2024-01-15",
      vendedor: "Juan Pérez",
    },
    {
      id: 2,
      cliente: "Corporación XYZ",
      producto: "Consultoría",
      monto: "$8,500",
      fecha: "2024-01-16",
      vendedor: "María López",
    },
    {
      id: 3,
      cliente: "Startup Tech",
      producto: "Desarrollo",
      monto: "$22,000",
      fecha: "2024-01-17",
      vendedor: "Carlos Ruiz",
    },
    {
      id: 4,
      cliente: "Retail Plus",
      producto: "Soporte",
      monto: "$5,200",
      fecha: "2024-01-18",
      vendedor: "Ana García",
    },
  ]

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Ventas Totales</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-1)" }}>
            $125,400
          </div>
          <div className="stat-change">+18% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Número de Ventas</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-2)" }}>
            47
          </div>
          <div className="stat-change">+12% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Ticket Promedio</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-3)" }}>
            $2,668
          </div>
          <div className="stat-change">+5% desde el mes pasado</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Conversión</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-4)" }}>
            23.5%
          </div>
          <div className="stat-change">+2.1% desde el mes pasado</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Registro de Ventas</div>
          <div className="chart-subtitle">Ventas recientes realizadas</div>
        </div>

        <div style={{ padding: "20px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Cliente
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Producto
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Monto
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Fecha
                </th>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--muted-foreground)", fontSize: "14px" }}>
                  Vendedor
                </th>
              </tr>
            </thead>
            <tbody>
              {ventasData.map((venta) => (
                <tr key={venta.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px", color: "var(--foreground)", fontWeight: "500" }}>{venta.cliente}</td>
                  <td style={{ padding: "12px", color: "var(--foreground)" }}>{venta.producto}</td>
                  <td style={{ padding: "12px", color: "var(--chart-1)", fontWeight: "600" }}>{venta.monto}</td>
                  <td style={{ padding: "12px", color: "var(--muted-foreground)" }}>{venta.fecha}</td>
                  <td style={{ padding: "12px", color: "var(--foreground)" }}>{venta.vendedor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
