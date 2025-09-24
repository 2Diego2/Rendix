export function Header() {
  return (
    <header className="header">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-item">/</span>
        <span className="breadcrumb-current">Resumen</span>
      </div>

      {/* Right side */}
      <div className="header-right">
        {/* Time selector */}
        <button className="btn btn-outline">
          <span className="icon">📅</span>
          Últimos 30 días
          <span className="icon">▼</span>
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
