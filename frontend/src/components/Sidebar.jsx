"use client"

import { LuLayoutDashboard } from "react-icons/lu"; import { BsPeople } from "react-icons/bs";import { MdMoneyOff } from "react-icons/md"; import { MdAttachMoney } from "react-icons/md";
import { FaChartLine } from "react-icons/fa"; import { TbReportAnalytics } from "react-icons/tb"; import { PiListBulletsBold } from "react-icons/pi";  import { FaDropbox } from "react-icons/fa";


const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <LuLayoutDashboard /> },
  { id: "ventas", label: "Ventas", icon: <FaChartLine /> },
  { id: "actividades", label: "Actividades", icon: <PiListBulletsBold /> },
  { id: "liquidaciones", label: "Liquidaciones", icon: <MdAttachMoney /> },
  { id: "gastos", label: "Gastos", icon: <MdMoneyOff /> },
  { id: "reportes", label: "Reportes", icon: <TbReportAnalytics /> },
  { id: "gestionar_vendedoras", label: "Gestionar vendedoras", icon: <BsPeople /> },
]

const shortcuts = [{ id: "inventar", label: "Inventar", icon: <FaDropbox /> }]

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
