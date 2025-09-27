"use client"

const pageNames = {
  dashboard: "Dashboard",
  actividades: "Actividades",
  ventas: "Ventas",
  gastos: "Gastos",
  liquidaciones: "Liquidaciones",
  reportes: "Reportes",
}

export function Header({ currentPage, isDarkMode, onThemeToggle }) {
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
        {/* Time selector */}
        <button className="btn btn-outline">
          <span className="icon">📅</span>
          Últimos 30 días
          <span className="icon">▼</span>
        </button>

        <button
          className="btn btn-ghost"
          onClick={onThemeToggle}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <span className="icon">{isDarkMode ? "☀️" : "🌙"}</span>
        </button>

        {/* Export button */}
        <button className="btn btn-primary">Exportar</button>

        {/* User info */}
        <div className="user-info">
          <div className="avatar">JD</div>
          <span className="user-name">Juan Díaz</span>
        </div>

        {/* More options */}
        <button className="btn btn-ghost">
          <span className="icon">⋯</span>
        </button>
      </div>
    </header>
  )
}
