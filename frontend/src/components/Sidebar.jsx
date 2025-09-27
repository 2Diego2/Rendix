"use client"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "ventas", label: "Ventas", icon: "📈" },
  { id: "actividades", label: "Actividades", icon: "👥" },
  { id: "liquidaciones", label: "Liquidaciones", icon: "📄" },
  { id: "gastos", label: "Gastos", icon: "💰" },
  { id: "reportes", label: "Reportes", icon: "📊" },
]

const shortcuts = [{ id: "inventar", label: "Inventar", icon: "📦" }]

export function Sidebar({ currentPage, onPageChange }) {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img className="logo" src="rendlogo.png" alt="log de rendix" />
        <h1>Rendix</h1>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`nav-item ${currentPage === item.id ? "active" : ""}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
            {currentPage === item.id && <span style={{ marginLeft: "auto" }}>›</span>}
          </button>
        ))}

        {/* Shortcuts Section */}
        <div className="shortcuts-section">
          <p className="shortcuts-title">SHORTCUTS</p>
          {shortcuts.map((item) => (
            <button key={item.id} className="nav-item">
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
