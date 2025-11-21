import React, { useEffect, useState } from "react";
import api from "../utils/api";

export function Liquidaciones() {
  const [liquidaciones, setLiquidaciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/liquidaciones");
        setLiquidaciones(res.data);
      } catch (error) {
        console.error("Error cargando liquidaciones", error);
      }
    };
    fetchData();
  }, []);

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/liquidaciones/excel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "liquidaciones.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Error exportando Excel", err);
    }
  };

  return (
    <div className="dashboard-content">

      {/* Tabla de Liquidaciones */}
      <div className="chart-card">
        <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="chart-title">Registro de Liquidaciones</div>
          <button
            className="button"
            onClick={handleExportExcel}
            style={{
              padding: "8px 14px",
              backgroundColor: "var(--chart-3)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Exportar Excel
          </button>
        </div>

        <div style={{ padding: "0px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px" }}>Empleado</th>
                <th style={{ padding: "12px" }}>Período</th>
                <th style={{ padding: "12px" }}>Salario Base</th>
                <th style={{ padding: "12px" }}>Bonos</th>
                <th style={{ padding: "12px" }}>Descuentos</th>
                <th style={{ padding: "12px" }}>Total</th>
              </tr>
            </thead>

            <tbody>
              {liquidaciones.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}>{l.empleado}</td>
                  <td style={{ padding: "12px" }}>{l.periodo}</td>
                  <td style={{ padding: "12px" }}>${l.salarioBase}</td>
                  <td style={{ padding: "12px", color: "var(--chart-4)" }}>${l.bonos}</td>
                  <td style={{ padding: "12px", color: "var(--chart-2)" }}>${l.descuentos}</td>
                  <td style={{ padding: "12px", color: "var(--chart-1)", fontWeight: "600" }}>${l.total}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
