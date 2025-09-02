/**
 * Formulario de login en español según wireframes
 * Componente modular con validación y estados
 * 
 * @author Frontend Team
 * @since v1.0.0
 */
import React from "react";
import { Button, Input } from "@nexia/ui-web";

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = React.useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = React.useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("Intento de login:", formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Login falló:", error);
    } finally {
      setIsLoading(false);
    }
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="email"
          label="Correo electrónico"
          value={formData.email}
          onChange={handleInputChange("email")}
          error={errors.email}
          placeholder="Introduce tu correo electrónico"
          isRequired
        />

        <Input
          type="password"
          label="Contraseña"
          value={formData.password}
          onChange={handleInputChange("password")}
          error={errors.password}
          placeholder="Introduce tu contraseña"
          isRequired
        />

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
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
          Iniciar sesión
        </Button>

        <div className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Regístrate
          </button>
        </div>
      </form>
    </div>
  );
};