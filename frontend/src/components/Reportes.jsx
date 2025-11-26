import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { NotificationContainer } from './Notification';
import { ConfirmModal } from './ConfirmModal';
import './Css/Reportes.css';

export function Reportes() {
  const [reportesData, setReportesData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration: 3000 }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Traer historial del backend
  useEffect(() => {
    api.get("/reportes")
      .then(res => setReportesData(res.data))
      .catch(err => {
        console.error("Error al cargar reportes:", err);
        addNotification("Error al cargar historial de reportes", "error");
      });
  }, []);


  const eliminarReporte = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Reporte',
      message: '¿Seguro que querés eliminar este reporte?',
      onConfirm: async () => {
        try {
          await api.delete(`/reportes/${id}`);
          setReportesData(prev => prev.filter(r => r.id !== id));
          addNotification("Reporte eliminado", "success");
        } catch (err) {
          console.error("Error eliminando reporte:", err);
          addNotification("No se pudo eliminar el reporte", "error");
        }
      }
    });
  };

  return (
    <div className="reportes-container">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Eliminar"
        type="danger"
      />

      <div className="reportes-header">
        <h3 className="reportes-title">Historial de Reportes</h3>
        <p className="reportes-subtitle">Reportes generados recientemente</p>
      </div>

      <div className="reportes-table-wrapper">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Tamaño</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reportesData.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state" style={{ textAlign: "center", padding: "40px", color: "var(--gray-500)" }}>
                  No hay reportes descargados aún
                </td>
              </tr>
            ) : (
              reportesData.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.nombre}</td>
                  <td style={{ textTransform: "capitalize" }}>{r.tipo}</td>
                  <td>
                    {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </td>
                  <td>
                    <span className="badge-status badge-success">
                      Completado
                    </span>
                  </td>
                  <td>{r.tamaño || 'N/A'}</td>
                  <td className="text-center">
                    <button
                      onClick={() => eliminarReporte(r.id)}
                      className="btn-icon btn-delete"
                      title="Eliminar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
