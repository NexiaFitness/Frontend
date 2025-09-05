/**
 * Formulario de login en español según wireframes
 * CONECTADO: Integración real con backend FastAPI de Sosina
 * Maneja autenticación, navegación y error handling profesional
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@/components/forms";
import { useLoginMutation } from "@shared/api/authApi";
import { loginSuccess, loginFailure, clearError } from "@shared/store/authSlice";
import type { AppDispatch } from "@shared/store";
import type { LoginCredentials } from "@shared/types/auth";


interface LoginFormData {
  email: string;      // UI sigue mostrando "email" al usuario
  password: string;
}

export const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // RTK Query hook - maneja la llamada al servidor
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = React.useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = React.useState<Partial<LoginFormData>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Limpiar errores cuando usuario escribe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Limpiar error de servidor cuando usuario escribe
    if (serverError) {
      setServerError(null);
      dispatch(clearError(undefined));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Introduce un correo válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Limpiar errores previos
    setServerError(null);
    dispatch(clearError(undefined));


    try {
      // Llamada real al backend
      const credentials: LoginCredentials = {
        username: formData.email,
        password: formData.password,
      };

      const response = await login(credentials).unwrap();

      // Login exitoso - actualizar estado Redux
      dispatch(loginSuccess({
        user: response.user,
        token: response.access_token,
      }));

      // Navegación a dashboard entrenador
      navigate("/dashboard");

    } catch (error: any) {
      console.error("Login falló:", error);

      // Manejo de errores profesional
      let errorMessage = "Error de conexión. Intenta de nuevo.";

      if (error?.status === 401) {
        errorMessage = "Correo o contraseña incorrectos";
      } else if (error?.status === 429) {
        errorMessage = "Demasiados intentos. Espera un momento.";
      } else if (error?.data?.detail) {
        errorMessage = error.data.detail;
      }

      setServerError(errorMessage);
      dispatch(loginFailure(errorMessage));
    }
  };

  const handleForgotPassword = () => {
    navigate("/auth/forgot-password");
  };

  const handleRegister = () => {
    navigate("/auth/register");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2 text-primary-400">
          Bienvenido
        </h1>

        <p className="text-gray-600">
          Inicia sesión en tu cuenta para continuar
        </p>
      </div>

      {/* Error del servidor */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">
            {serverError}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="email"
          label="Correo electrónico"
          value={formData.email}
          onChange={handleInputChange("email")}
          error={errors.email}
          placeholder="Introduce tu correo electrónico"
          isRequired
          disabled={isLoading}
        />

        <Input
          type="password"
          label="Contraseña"
          value={formData.password}
          onChange={handleInputChange("password")}
          error={errors.password}
          placeholder="Introduce tu contraseña"
          isRequired
          disabled={isLoading}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
            disabled={isLoading}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

        <div className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <button
            type="button"
            onClick={handleRegister}
            className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50"
            disabled={isLoading}
          >
            Regístrate
          </button>
        </div>
      </form>
    </div>
  );
};