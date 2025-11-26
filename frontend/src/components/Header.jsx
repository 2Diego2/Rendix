import React, { useState, useEffect } from 'react';
import { useFiltro } from './Filtro/FiltroContext';
import './Css/Header.css';

const pageNames = {
  ventas: "Ventas",
  liquidaciones: "Liquidaciones",
  gastos: "Gastos",
  actividades: "Actividades",
  reportes: "Reportes",
  dashboard: "Dashboard",
  asistencias: "Asistencias",
  vendedoras: "Vendedoras",
  gestionar_vendedoras: "Vendedoras"
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



  return (
    <header className="header">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-current">{pageNames[currentPage] || "Dashboard"}</span>
      </div>

      {/* Right side */}
      <div className="header-right">

        <div style={{ position: 'relative' }}>
          <button className="btn-outline" onClick={() => setMenuAbierto(!menuAbierto)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {menuAbierto && (
            <div className="dropdown-menu">
              {opciones.map((op) => (
                <button
                  key={op.dias}
                  onClick={() => handleSelect(op)}
                  className="dropdown-item"
                >
                  {op.texto}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn-ghost"
          onClick={onThemeToggle}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {/* User info */}
        <div className="user-info">
          <div className="avatar">
            {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="user-name">{usuario.nombre}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              {usuario.rol || 'Usuario'}
            </span>
          </div>
        </div>



      </div>
    </header>
  );
}
