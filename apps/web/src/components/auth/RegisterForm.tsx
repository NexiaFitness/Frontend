/**
 * RegisterForm.tsx — Formulario de registro con autologin automático.
 *
 * Contexto:
 * - Usa RTK Query (authApi) para registro con autologin.
 * - Redirección automática según rol tras registro exitoso.
 * - Compatible con React Web y React Native.
 * - Arquitectura limpia: navegación delegada al componente padre.
 *
 * Flujo:
 * 1. Usuario completa formulario → useRegisterMutation()
 * 2. Backend devuelve tokens → autologin automático
 * 3. Redirección automática según rol (trainer/athlete/admin)
 *
 * @since v1.0.0
 * @updated v2.0.0 - Integración con useAuth y autologin
 * @updated v4.4.0 - Migrado a RTK Query (authApi)
 */

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { TYPOGRAPHY } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useRegisterMutation, loginSuccess, loginFailure } from "@nexia/shared";
import { useAuthForm } from "@nexia/shared/hooks/useAuthForm";
import { USER_ROLES } from "@nexia/shared/config/constants";
import { validateRegisterForm } from "@nexia/shared/utils/validations";
import type { AppDispatch } from "@nexia/shared/store";
import type { RegisterCredentials, UserRole } from "@nexia/shared/types/auth";
import type { SelectOption } from "@/components/ui/forms";

interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    nombre: string;
    apellidos: string;
    role: UserRole | ""; // Puede empezar vacío hasta que el usuario seleccione
    [key: string]: unknown;
}

const initialFormState: RegisterFormData = {
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellidos: "",
    role: "",
};

// Opciones para el selector de roles - Solo registro público
const roleOptions: SelectOption[] = [
    { value: USER_ROLES.TRAINER, label: "Entrenador Personal" },
    { value: USER_ROLES.ATHLETE, label: "Atleta" },
];

export const RegisterForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // RTK Query mutation para registro
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
            // Validación explícita de role
            if (!formData.role) {
                handleServerError({
                    status: 400,
                    data: { detail: "Debes seleccionar un tipo de cuenta" }
                });
                return;
            }

            const credentials: RegisterCredentials = {
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                role: formData.role as UserRole,
            };

            // RTK Query mutation
            const response = await register(credentials).unwrap();

            // ✅ RECOMENDACIÓN 2: Validar que response tiene datos válidos
            if (!response?.user || !response?.access_token) {
                console.error('[RegisterForm] Invalid response from server:', response);
                handleServerError({
                    status: 500,
                    data: { 
                        detail: "Respuesta inválida del servidor. El usuario puede haberse creado correctamente. Por favor, intenta iniciar sesión." 
                    }
                });
                return;
            }

            // Auto-login: dispatch tokens to Redux
            dispatch(
                loginSuccess({
                    user: response.user,
                    token: response.access_token,
                })
            );

            // CORRECCIÓN: Ir a /dashboard (no /dashboard/trainer)
            // DashboardRouter maneja la redirección según rol
            navigate("/dashboard", { replace: true });

        } catch (error: unknown) {
            // CORRECCIÓN: Manejo de error mejorado
            const apiError = error as { status?: number; data?: { detail?: string }; message?: string };
            console.error('[RegisterForm] Registration failed:', {
                error,
                status: apiError?.status,
                data: apiError?.data,
                message: apiError?.message,
            });
            
                // ✅ RECOMENDACIÓN 4: Manejar caso de usuario ya existente
                if (apiError?.status === 422) {
                    const errorDetail = apiError?.data?.detail || '';
                    const isDuplicateUser = 
                        typeof errorDetail === 'string' && 
                        (errorDetail.toLowerCase().includes('already exists') ||
                         errorDetail.toLowerCase().includes('ya existe') ||
                         errorDetail.toLowerCase().includes('duplicate') ||
                         errorDetail.toLowerCase().includes('duplicado'));
                    
                    if (isDuplicateUser) {
                        const errorMessage = "Este email ya está registrado. ¿Quieres iniciar sesión?";
                        handleServerError({
                            status: 422,
                            data: { detail: errorMessage }
                        });
                        // Redirigir a login con email prellenado
                        navigate("/auth/login", { 
                            state: { email: formData.email },
                            replace: true 
                        });
                        return;
                    }
                }
                
                // Extraer mensaje de error de RTK Query
                const errorMessage = apiError?.data?.detail || 
                                   apiError?.message || 
                                   "Error al crear la cuenta. Intenta de nuevo.";
                
                // Actualizar UI con error
                handleServerError({
                    status: apiError?.status || 500,
                    data: { detail: errorMessage }
                });
                
                // Dispatch failure a Redux
                dispatch(loginFailure(errorMessage));
        }
    };

    const handleLogin = () => {
        navigate("/auth/login");
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className={`${TYPOGRAPHY.pageTitle} mb-2`} style={{ color: '#4A67B3' }}>
                    Únete a NEXIA
                </h1>
                <p className={`${TYPOGRAPHY.body} text-gray-600`}>
                    Crea tu cuenta para empezar a entrenar de forma profesional
                </p>
            </div>

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                    size="md"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className={BUTTON_PRESETS.formPrimary}
                >
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={handleLogin}
                        className={`${TYPOGRAPHY.linkText} underline disabled:opacity-50`}
                        style={{ color: '#4A67B3' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#3a5db3'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#4A67B3'}
                        disabled={isLoading}
                    >
                        Inicia sesión
                    </button>
                </div>
            </form>
        </div>
    );
};
