"use client"

import { useState } from "react"
import { useAuth } from "../hooks/useAuth" // ✅ Usar el hook
import "./Login.css"

export default function Login({ onLoginSuccess }) {
  const { login, isLoading, error: authError } = useAuth(); // ✅ Usar el hook en lugar de axios directo
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
  })
  const [localError, setLocalError] = useState("")
  const [success, setSuccess] = useState("")

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
    setLocalError("")
    setSuccess("")

    // Validar campos
    if (!validateFields()) {
      return
    }

    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    console.log("Intentando login con:", { trimmedUsername })

    // ✅ Usar el método login del hook
    const result = await login(trimmedUsername, trimmedPassword);

    if (result.success) {
      console.log("Login exitoso")
      setSuccess("¡Login exitoso! Redirigiendo...")
      
      // Notificar al componente padre (App.js)
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      }
    } else {
      // El error ya está en authError, pero podemos usar result.error también
      setLocalError(result.error || "Error al iniciar sesión")
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
    if (localError) setLocalError("")
    if (success) setSuccess("")
  }

  // Usar el error del hook o el local
  const displayError = authError || localError;

  return (
    <div className="login-container">
      <div className={`login-card ${isLoading ? "loading" : ""}`}>
        <div className="login-header">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {/* Mensaje de error */}
          {displayError && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{displayError}</span>
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
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
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
