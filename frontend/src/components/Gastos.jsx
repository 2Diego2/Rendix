import React, { useState, useEffect } from "react"

export function Gastos() {
  const [gastos, setGastos] = useState([])
  const [sueldos, setSueldos] = useState("")
  const [compras, setCompras] = useState("")
  const [adicionales, setAdicionales] = useState("")

  useEffect(() => {
    // Cargar gastos desde el backend
    fetch("http://localhost:3001/gastos/hoy")
      .then((res) => res.json())
      .then((data) => setGastos(data.gastosHoy))
      .catch(() => console.log("No se pudieron cargar los gastos."))
  }, [])

  // Calcular totales (aseguramos que sean números)
  const totalGastos = gastos.reduce((acc, g) => acc + Number(g.monto || 0), 0)
  const gastosFijos = gastos.filter(g => g.categoria === "Fijo").reduce((acc, g) => acc + Number(g.monto || 0), 0)
  const gastosVariables = gastos.filter(g => g.categoria === "Variable").reduce((acc, g) => acc + Number(g.monto || 0), 0)
  const gastosAdicionales = gastos.filter(g => g.categoria === "Adicional").reduce((acc, g) => acc + Number(g.monto || 0), 0)

  const handleSubmit = (e) => {
    e.preventDefault()

    const nuevosGastos = []
    if (sueldos) {
      nuevosGastos.push({
        concepto: "Sueldos",
        descripcion: "Pago de empleados",
        monto: parseFloat(sueldos),
        fecha: new Date().toISOString().split("T")[0],
        categoria: "Fijo",
      })
    }
    if (compras) {
      nuevosGastos.push({
        concepto: "Compras de ropa",
        descripcion: "Reposición de stock",
        monto: parseFloat(compras),
        fecha: new Date().toISOString().split("T")[0],
        categoria: "Variable",
      })
    }
    if (adicionales) {
      nuevosGastos.push({
        concepto: "Gastos adicionales",
        descripcion: "Otros gastos (publicidad, mantenimiento, etc.)",
        monto: parseFloat(adicionales),
        fecha: new Date().toISOString().split("T")[0],
        categoria: "Adicional",
      })
    }

    // Enviar al backend y actualizar el estado localmente
    fetch("http://localhost:3001/gastos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevosGastos),
    })
      .then((res) => res.json())
      .then((data) => { // ✅ Recibe la respuesta del backend
        // Actualiza el estado con los datos del servidor
        setGastos(data.gastosHoy); 
      })
      .catch((err) => console.error("Error al guardar gastos:", err))

    // Limpiar inputs
    setSueldos("")
    setCompras("")
    setAdicionales("")
  }

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        {/* GASTOS TOTALES */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Gastos Totales</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-1)" }}>
            ${totalGastos.toFixed(2)}
          </div>
          <div className="stat-change">Suma de todos los gastos</div>
        </div>

        {/* GASTOS FIJOS */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Gastos Fijos (Sueldos)</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-2)" }}>
            ${gastosFijos.toFixed(2)}
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              className="sin-flechitas"
              placeholder="Monto sueldos"
              value={sueldos}
              onChange={(e) => setSueldos(e.target.value)}
              style={{ width: "90%", marginTop: "8px", padding: "6px" }}
            />
          </form>
        </div>

        {/* GASTOS VARIABLES */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Gastos Variables (Compras de Ropa)</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-3)" }}>
            ${gastosVariables.toFixed(2)}
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              className="sin-flechitas"
              placeholder="Monto compras"
              value={compras}
              onChange={(e) => setCompras(e.target.value)}
              style={{ width: "90%", marginTop: "8px", padding: "6px" }}
            />
          </form>
        </div>

        {/* GASTOS ADICIONALES */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Gastos Adicionales</div>
          </div>
          <div className="stat-value" style={{ color: "var(--chart-4)" }}>
            ${gastosAdicionales.toFixed(2)}
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              className="sin-flechitas"
              placeholder="Monto adicional"
              value={adicionales}
              onChange={(e) => setAdicionales(e.target.value)}
              style={{ width: "90%", marginTop: "8px", padding: "6px" }}
            />
          </form>
        </div>
      </div>

      {/* REGISTRO DE GASTOS */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Registro de Gastos</div>
          <div className="chart-subtitle">Gastos registrados este mes</div>
          <button
            onClick={() => {
              if (confirm("¿Seguro que querés reiniciar los gastos del día?")) {
                fetch("http://localhost:3001/gastos/reiniciar", { method: "DELETE" })
                  .then((res) => res.json())
                  .then(() => setGastos([]));
              }
            }}
            style={{
              marginBottom: "15px",
              padding: "8px 14px",
              backgroundColor: "var(--chart-4)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Reiniciar gastos del día
          </button>
        </div>

        <div style={{ padding: "20px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Concepto</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Descripción</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Monto</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Fecha</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((gasto, index) => (
                <tr key={index} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}>{gasto.concepto}</td>
                  <td style={{ padding: "12px" }}>{gasto.descripcion}</td>
                  <td style={{ padding: "12px", color: "var(--chart-1)", fontWeight: "600" }}>
                    ${Number(gasto.monto || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px" }}>{gasto.fecha}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor:
                          gasto.categoria === "Fijo"
                            ? "var(--chart-2)"
                            : gasto.categoria === "Variable"
                            ? "var(--chart-3)"
                            : "var(--chart-4)",
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
