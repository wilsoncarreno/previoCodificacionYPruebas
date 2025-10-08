import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      await api.get("/api/auth/verify/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token) {
        const isValid = await validateToken();
        if (isValid && savedUser) {
          try {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          } catch (e) {
            console.error("Error parsing user:", e);
            logout();
          }
        } else {
          logout();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [validateToken, logout]);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/api/auth/login/", { username, password });

      // ✅ Guardar tokens
      localStorage.setItem("token", data.access);
      if (data.refresh) localStorage.setItem("refresh", data.refresh);

      // ✅ Guardar usuario si viene en la respuesta
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        // Si no viene el usuario, crear uno básico
        const basicUser = { username };
        localStorage.setItem("user", JSON.stringify(basicUser));
        setUser(basicUser);
      }

      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      // Logging detallado para debugging
      console.error("=== ERROR DE LOGIN ===");
      console.error("Error completo:", err);
      console.error("Configuración:", err.config);
      console.error("Request:", err.request);
      console.error("Response:", err.response);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      console.error("======================");

      let msg = "Error al iniciar sesión.";
      
      if (err.response?.status === 401) {
        msg = "Credenciales inválidas. Verifica tu usuario y contraseña.";
      } else if (err.response?.status === 429) {
        msg = "Demasiados intentos. Intenta de nuevo más tarde.";
      } else if (err.code === "ECONNABORTED") {
        msg = "Tiempo de espera agotado. Verifica tu conexión.";
      } else if (!err.response) {
        msg = "Error de conexión. ¿Está el backend corriendo en http://127.0.0.1:8000?";
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }

      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isAuthenticated, isLoading, user, login, logout, error };
};