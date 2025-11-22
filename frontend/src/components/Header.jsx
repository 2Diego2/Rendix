import React, { useState, useEffect } from 'react';
import { useFiltro } from './Filtro/FiltroContext'; // Asegúrate de que esté bien importado
import { FaCalendar } from "react-icons/fa";
import { IoMdMoon } from "react-icons/io";
import { FiSun } from "react-icons/fi";

const pageNames = {
  ventas: "Ventas",
  liquidaciones: "Liquidaciones",
  gastos: "Gastos",
  actividades: "Actividades",
  reportes: "Reportes",
  dashboard: "Dashboard"
};

export function Header({ currentPage, isDarkMode, onThemeToggle }) {
  const { setRangoDias } = useFiltro();
  const [usuario, setUsuario] = useState({ nombre: 'Usuario' });
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [label, setLabel] = useState("Hoy");

  // Cargar usuario desde localStorage
  useEffect(() => {
    try {
      const userStored = localStorage.getItem('usuario');
      if (userStored) {
        setUsuario(JSON.parse(userStored));
      }
    } catch (e) {
      console.error("Error al leer usuario", e);
    }
  }, []);

  const opciones = [
    { dias: 0, texto: "Hoy" },
    { dias: 7, texto: "Últimos 7 días" },
    { dias: 15, texto: "Últimos 15 días" },
    { dias: 30, texto: "Últimos 30 días" },
    { dias: 45, texto: "Últimos 45 días" },
  ];

  const handleSelect = (opcion) => {
    setRangoDias(opcion.dias);
    setLabel(opcion.texto);
    setMenuAbierto(false);
  };

  const exportar = async () => {
    try {
      let endpoint = "";

      switch (currentPage) {
        case "ventas":
          endpoint = "/reportes/exportar/pdf?tipo=ventas";
          break;
        case "liquidaciones":
          endpoint = "/reportes/exportar/pdf?tipo=liquidaciones";
          break;
        case "gastos":
          endpoint = "/reportes/exportar/pdf?tipo=gastos";
          break;
        case "actividades":
          endpoint = "/reportes/exportar/pdf?tipo=actividades";
          break;
        case "reportes":
          endpoint = "/reportes/exportar/pdf?tipo=reportes";
          break;
        default:
          alert("Esta página no tiene exportación todavía.");
          return;
      }

      const res = await fetch("http://localhost:3000" + endpoint, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (!res.ok) throw new Error("Error al generar PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-${currentPage}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo exportar el PDF");
    }
  };

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
  };

  return (
    <header className="header">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-current">{pageNames[currentPage] || "Dashboard"}</span>
      </div>

      {/* Right side */}
      <div className="header-right">

        <div style={{ position: 'relative' }}>
          <button className="btn btn-outline" onClick={() => setMenuAbierto(!menuAbierto)}>
            <span className="icon"><FaCalendar /></span>
            {label}
            <span className="icon">▼</span>
          </button>

          {menuAbierto && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                backgroundColor: 'var(--card-bg, white)',
                border: '1px solid var(--border, #eee)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px',
                zIndex: 10,
                minWidth: '180px',
              }}
            >
              {opciones.map((op) => (
                <button
                  key={op.dias}
                  onClick={() => handleSelect(op)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 12px',
                    textAlign: 'left',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    color: 'var(--text-color, black)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f4f4f4)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {op.texto}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn btn-ghost"
          onClick={onThemeToggle}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <span className="icon">{isDarkMode ? <FiSun /> : <IoMdMoon />}</span>
        </button>

        {/* User info */}
        <div className="user-info">
          <div className="avatar">
            {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="user-name">{usuario.nombre}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
              {usuario.rol || 'Usuario'} • Vista de {label.toLowerCase()}
            </span>
          </div>
        </div>

        <button
          className="btn btn-ghost"
          onClick={handleLogout}
          title="Cerrar sesión"
          style={{ color: 'var(--destructive)' }}
        >
          Cerrar Sesión
        </button>


      </div>
    </header>
  );
}
