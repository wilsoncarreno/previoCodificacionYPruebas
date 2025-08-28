"use client"

import { useState } from "react"
import axios from "axios"
import "./Login.css"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
  })

  // Validación de campos
  const validateFields = () => {
    const errors = { username: "", password: "" }
    let isValid = true

    if (!username.trim()) {
      errors.username = "El nombre de usuario es requerido"
      isValid = false
    } else if (username.trim().length < 3) {
      errors.username = "El nombre de usuario debe tener al menos 3 caracteres"
      isValid = false
    }

    if (!password.trim()) {
      errors.password = "La contraseña es requerida"
      isValid = false
    } 

    setFieldErrors(errors)
    return isValid
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    // Limpiar mensajes previos
    setError("")
    setSuccess("")

    // Validar campos
    if (!validateFields()) {
      return
    }

    setIsLoading(true)

    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    console.log("Intentando login con:", { trimmedUsername })

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"}/api/auth/login/`,
        {
          username: trimmedUsername,
          password: trimmedPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 segundos de timeout
        },
      )

      console.log("Login exitoso")
      localStorage.setItem("token", response.data.access)

      // Opcional: guardar información adicional del usuario
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }

      setSuccess("¡Login exitoso! Redirigiendo...")

      // Simular redirección después de 1.5 segundos
      setTimeout(() => {
        console.log("Redirigiendo al dashboard...")
        // Aquí podrías usar navigate('/dashboard') si usas React Router
      }, 1500)
    } catch (err) {
      console.error("Error de login:", err.response?.status, err.response?.data)

      // Manejo de errores más específico
      if (err.response?.status === 401) {
        setError("Credenciales inválidas. Verifica tu usuario y contraseña.")
      } else if (err.response?.status === 429) {
        setError("Demasiados intentos. Intenta de nuevo más tarde.")
      } else if (err.code === "ECONNABORTED") {
        setError("Tiempo de espera agotado. Verifica tu conexión.")
      } else if (!err.response) {
        setError("Error de conexión. Verifica tu conexión a internet.")
      } else {
        setError("Error del servidor. Intenta de nuevo más tarde.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    if (field === "username") {
      setUsername(value)
      if (fieldErrors.username) {
        setFieldErrors((prev) => ({ ...prev, username: "" }))
      }
    } else {
      setPassword(value)
      if (fieldErrors.password) {
        setFieldErrors((prev) => ({ ...prev, password: "" }))
      }
    }

    // Limpiar mensajes de error/éxito al escribir
    if (error) setError("")
    if (success) setSuccess("")
  }

  return (
    <div className="login-container">
      <div className={`login-card ${isLoading ? "loading" : ""}`}>
        <div className="login-header">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {/* Mensaje de error */}
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Mensaje de éxito */}
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Campo de usuario */}
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              disabled={isLoading}
              className={fieldErrors.username ? "error" : ""}
              autoComplete="username"
            />
            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          </div>

          {/* Campo de contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                className={fieldErrors.password ? "error" : ""}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
        
              </button>
            </div>
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="login-button" disabled={isLoading || !username.trim() || !password.trim()}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>

          <div className="login-footer">
            <button type="button" className="link-button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
