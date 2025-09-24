"use client"

import { useState } from "react"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊", active: true },
  { id: "ventas", label: "Ventas", icon: "📈" },
  { id: "actividades", label: "Actividades", icon: "👥" },
  { id: "liquidaciones", label: "Liquidaciones", icon: "📄" },
  { id: "gastos", label: "Gastos", icon: "💰" },
  { id: "reportes", label: "Reportes", icon: "📊" },
]

const shortcuts = [{ id: "inventar", label: "Inventar", icon: "📦" }]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("dashboard")

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h1>Rendix</h1>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`nav-item ${activeItem === item.id ? "active" : ""}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
            {activeItem === item.id && <span style={{ marginLeft: "auto" }}>›</span>}
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
