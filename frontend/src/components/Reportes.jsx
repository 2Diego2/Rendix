import React, { useEffect, useState } from "react";
import api from "../utils/api";

export function Reportes() {
  const [reportesData, setReportesData] = useState([]);

  // Traer historial del backend
  useEffect(() => {
    api.get("/reportes")
      .then(res => setReportesData(res.data))
      .catch(err => console.error("Error al cargar reportes:", err));
  }, []);


  const eliminarReporte = async (id) => {
    if (!confirm("¿Seguro que querés eliminar este reporte?")) return;
    try {
      await api.delete(`/reportes/${id}`);
      setReportesData(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error eliminando reporte:", err);
      alert("No se pudo eliminar el reporte");
    }
  };

  return (
    <div className="dashboard-content">
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Historial de Reportes</div>
          <div className="chart-subtitle">Reportes generados recientemente</div>
        </div>

        <div style={{ padding: "20px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "center", padding: "12px" }}>Nombre</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Tipo</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Fecha</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Estado</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Tamaño</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportesData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "var(--muted-foreground)" }}>
                    No hay reportes descargados aún
                  </td>
                </tr>
              ) : (
                reportesData.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px", textAlign: "center" }}>{r.nombre}</td>
                    <td style={{ padding: "12px", textAlign: "center", textTransform: "capitalize" }}>{r.tipo}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: "#16a34a",
                        color: "white",
                        display: "inline-block"
                      }}>
                        Completado
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>{r.tamaño || 'N/A'}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button 
                        onClick={() => eliminarReporte(r.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px"
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
