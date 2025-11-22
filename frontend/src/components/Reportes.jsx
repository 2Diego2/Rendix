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

  const exportarExcel = async (tipo) => {
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:3001/exportar/excel/${tipo}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al generar Excel");

      const blob = await res.blob();
      const nombreArchivo = `${tipo}_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Descargar
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Tamaño aproximado
      const tamañoMB = (blob.size / 1024 / 1024).toFixed(2) + " MB";

      // Guardar en backend
      const resBackend = await api.post("/reportes", { nombre: nombreArchivo, tipo, tamaño: tamañoMB });
      setReportesData(prev => [resBackend.data, ...prev]);

    } catch (err) {
      console.error("Error exportando Excel:", err);
      alert("No se pudo generar el Excel. Revisa la consola.");
    }
  };

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
          <div className="chart-title">Registro de Reportes</div>
          <div className="chart-subtitle">Reportes generados recientemente</div>
          <div style={{ marginTop: "8px" }}>
            <button onClick={() => exportarExcel("ventas")}>Exportar Ventas</button>
            <button onClick={() => exportarExcel("gastos")}>Exportar Gastos</button>
          </div>
        </div>

        <div style={{ padding: "20px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Tamaño</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportesData.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td>{r.nombre}</td>
                  <td>{r.tipo}</td>
                  <td>{new Date(r.fechaCreacion).toLocaleDateString()}</td>
                  <td>{r.estado}</td>
                  <td>{r.tamaño}</td>
                  <td>
                    <button onClick={() => eliminarReporte(r.id)}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
