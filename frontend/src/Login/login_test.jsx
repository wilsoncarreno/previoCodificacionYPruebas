/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { useAuth } from "../../hooks/useAuth";

// 🔹 Mock del hook useAuth
jest.mock("../../hooks/useAuth");

describe("Componente <Login />", () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });
  });

  test("renderiza correctamente los campos y botón", () => {
    render(<Login />);
    expect(screen.getByLabelText(/Nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  test("muestra error si los campos están vacíos", async () => {
    render(<Login />);
    const btn = screen.getByRole("button", { name: /Iniciar sesión/i });
    fireEvent.click(btn);

    expect(await screen.findByText(/El nombre de usuario es requerido/)).toBeInTheDocument();
    expect(await screen.findByText(/La contraseña es requerida/)).toBeInTheDocument();
  });

  test("llama a login() con credenciales válidas", async () => {
    mockLogin.mockResolvedValueOnce({ success: true });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "123456" },
    });

    const btn = screen.getByRole("button", { name: /Iniciar sesión/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin", "123456");
    });
  });

  test("muestra mensaje de error si login falla", async () => {
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: "Credenciales inválidas",
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), {
      target: { value: "wrong" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "badpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Iniciar sesión/i }));

    expect(await screen.findByText(/Credenciales inválidas/)).toBeInTheDocument();
  });
});
