"use client"


import React, { useState } from 'react';
// 1. Importamos el hook 'useFiltro' que crearemos en el siguiente paso
import { useFiltro } from './Filtro/FiltroContext'; 
import { FaCalendar } from "react-icons/fa"; import { IoMdMoon } from "react-icons/io"; import { FiSun } from "react-icons/fi";

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

    // Descargar el archivo
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


const pageNames = {
  dashboard: "Dashboard",
  actividades: "Actividades",
  ventas: "Ventas",
  gastos: "Gastos",
  liquidaciones: "Liquidaciones",
  reportes: "Reportes",
}

export function Header({ currentPage, isDarkMode, onThemeToggle }) {
  
  const { setRangoDias } = useFiltro();
  
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [label, setLabel] = useState("Hoy");

  // Opciones del filtro
  const opciones = [
    { dias: 0, texto: "Hoy" },
    { dias: 7, texto: "Últimos 7 días" },
    { dias: 15, texto: "Últimos 15 días" },
    { dias: 30, texto: "Últimos 30 días" },
    { dias: 45, texto: "Últimos 45 días" },
  ];

  const handleSelect = (opcion) => {
    setRangoDias(opcion.dias); // Actualiza el estado global
    setLabel(opcion.texto); // Actualiza el texto del botón
    setMenuAbierto(false); // Cierra el menú
  };
  
  return (
    <header className="header">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-item">/</span>
        <span className="breadcrumb-current">{pageNames[currentPage] || "Dashboard"}</span>
      </div>

      {/* Right side */}
      <div className="header-right">
        
        <div style={{ position: 'relative' }}>
          {/* Time selector (Ahora funcional) */}
          <button className="btn btn-outline" onClick={() => setMenuAbierto(!menuAbierto)}>
            <span className="icon"><FaCalendar /></span>
            {label} {/* El texto ahora es dinámico */}
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
                  // Estilo hover simple
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
          <span className="icon">{isDarkMode ? <FiSun /> : <IoMdMoon /> }</span>
        </button>

        {/* User info */}
        <div className="user-info">
          <div className="avatar">R</div>
          <span className="user-name">Rendix</span>
        </div>

      </div>
    </header>
  )
}

