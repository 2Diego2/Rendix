import { useState } from 'react'
import './App.css'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/header'
import { DashboardContent } from './components/Dash'

export default function Home() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="main-area">
          <DashboardContent />
        </main>
      </div>
    </div>
  )
}