/**
 * Formulario de registro usando arquitectura reutilizable.
 * Usa useAuthForm hook + validation utilities + ServerErrorBanner.
 * Sin duplicación de código respecto a LoginForm.
 * Incluye selector de roles dinámico usando FormSelect.
 * Components migrados a @shared para reutilización web/móvil.
 * 
 * @author Frontend
 * @since v1.0.0
 */

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Input, FormSelect } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useRegisterMutation } from "@shared/api/authApi";
import { loginSuccess, loginFailure } from "@shared/store/authSlice";
import { useAuthForm, USER_ROLES } from "@/components/ui/forms";
import { validateRegisterForm } from "@/components/ui/forms";
import type { AppDispatch } from "@shared/store";
import type { RegisterCredentials, UserRole } from "@shared/types/auth";
import type { SelectOption } from "@/components/ui/forms";

interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    nombre: string;
    apellidos: string;
    role: UserRole;
}

const initialFormState: RegisterFormData = {
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellidos: "",
    role: "" as UserRole,
};

// Opciones para el selector de roles - Solo registro público
const roleOptions: SelectOption[] = [
    { value: USER_ROLES.TRAINER, label: "Entrenador Personal" },
    { value: USER_ROLES.ATHLETE, label: "Atleta" },
];

export const RegisterForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [register, { isLoading }] = useRegisterMutation();

    const {
        formData,
        errors,
        serverError,
        handleInputChange,
        validateForm,
        handleServerError,
        clearErrors,
    } = useAuthForm({
        initialState: initialFormState,
        validate: validateRegisterForm,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        clearErrors();

        try {
            const credentials: RegisterCredentials = {
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                role: formData.role,
            };

            await register(credentials).unwrap();

            // Redirigir a login con mensaje de éxito (backend no devuelve token en registro)
            navigate("/auth/login", {
                state: {
                    message: "Cuenta creada exitosamente. Inicia sesión con tus credenciales.",
                    email: formData.email
                }
            });
        } catch (error: any) {
            const errorMessage = handleServerError(error);
            dispatch(loginFailure(errorMessage));
        }
    };

    const handleLogin = () => {
        navigate("/auth/login");
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-2 text-primary-400">Únete a NEXIA</h1>
                <p className="text-gray-600">
                    Crea tu cuenta para empezar a entrenar de forma profesional
                </p>
            </div>

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="text"
                        label="Nombre"
                        value={formData.nombre}
                        onChange={handleInputChange("nombre")}
                        error={errors.nombre}
                        placeholder="Tu nombre"
                        isRequired
                        disabled={isLoading}
                    />

                    <Input
                        type="text"
                        label="Apellidos"
                        value={formData.apellidos}
                        onChange={handleInputChange("apellidos")}
                        error={errors.apellidos}
                        placeholder="Tus apellidos"
                        isRequired
                        disabled={isLoading}
                    />
                </div>

                <FormSelect
                    label="Tipo de cuenta"
                    value={formData.role}
                    onChange={handleInputChange("role")}
                    options={roleOptions}
                    error={errors.role}
                    placeholder="Selecciona tu tipo de cuenta"
                    isRequired
                    disabled={isLoading}
                />

                <Input
                    type="password"
                    label="Contraseña"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    error={errors.password}
                    placeholder="Mínimo 6 caracteres"
                    isRequired
                    disabled={isLoading}
                />

                <Input
                    type="password"
                    label="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    error={errors.confirmPassword}
                    placeholder="Repite tu contraseña"
                    isRequired
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full"
                >
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={handleLogin}
                        className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50"
                        disabled={isLoading}
                    >
                        Inicia sesión
                    </button>
                </div>
            </form>
        </div>
    );
};