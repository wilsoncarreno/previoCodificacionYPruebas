"use client"

import { useState, useEffect } from "react"
import Login from "./components/Login/Login.jsx"
import Dashboard from "./components/DashBoard/Dash.jsx"
import "./App.css"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar si el usuario ya está autenticado al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    console.log("Sesión cerrada, redirigiendo al login...")
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">📦</div>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="App">
      {isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Login onLoginSuccess={handleLoginSuccess} />}
    </div>
  )
}

export default App

