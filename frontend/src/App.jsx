"use client"

import { useState, useEffect } from "react"
import "./App.css"
import { Sidebar } from "./components/Sidebar"
import { Header } from "./components/Header"
import { DashboardContent } from "./components/Dash"
import { Actividades } from "./components/Actividades"
import  Ventas  from "./components/Ventas"
import { Gastos } from "./components/Gastos"
import { Liquidaciones } from "./components/Liquidaciones"
import { Reportes } from "./components/Reportes"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [isDarkMode, setIsDarkMode] = useState(false)

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
      case "ventas":
        return <Ventas />
      case "gastos":
        return <Gastos />
      case "liquidaciones":
        return <Liquidaciones />
      case "reportes":
        return <Reportes />
      default:
        return <DashboardContent />
    }
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
