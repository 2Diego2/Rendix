"use client"

import { useState, useEffect } from "react"
import "./App.css"
import { Sidebar } from "./components/Sidebar"
import { Header } from "./components/Header"
import { DashboardContent } from "./components/Dash"
import { Actividades } from "./components/Actividades"
import  Ventas  from "./components/Ventas"
import { Gastos } from "./components/Gastos"
import Liquidaciones from "./components/Liquidaciones"
import { Reportes } from "./components/Reportes"
import Login from './components/Login';
import Vendedoras from "./components/Vendedoras"
import Asistencias from "./components/Asistencias"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [usuarioLogueado, setUsuarioLogueado] = useState(null)

  useEffect(() => {
    // Verificar si hay token en localStorage para mantener sesión
    const token = localStorage.getItem('token');
    if (token) {
      // Aquí podríamos decodificar el token para obtener datos del usuario
      // por simplicidad, dejamos que el backend valide en cada request.
      setUsuarioLogueado(true);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)

    if (newTheme) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardContent />
      case "actividades":
        return <Actividades />
      case "asistencias":
        return <Asistencias />
      case "ventas":
        return <Ventas />
      case "gastos":
        return <Gastos />
      case "liquidaciones":
        return <Liquidaciones />
      case "reportes":
        return <Reportes />
        case "gestionar_vendedoras":
        return <Vendedoras />
      default:
        return <DashboardContent />
    }
  }

  // Si no hay token, mostramos el componente Login
  if (!usuarioLogueado) {
    return (
      <div className="app-login-wrapper">
        <Login onLoginExitoso={() => setUsuarioLogueado(true)} />
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="main-content">
        <Header currentPage={currentPage} isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
        <main className="main-area">{renderCurrentPage()}</main>
      </div>
    </div>
  )
}
