/**
 * Formulario de perfil de cuenta optimizado para dashboard context
 * Permite editar datos básicos (nombre, apellidos, email), cambiar contraseña
 * y (para roles Trainer/Athlete) eliminar la cuenta.
 * REDISEÑADO: Cohesivo con dashboard layout y glassmorphism design
 *
 * Integraciones:
 * - RTK Query (accountApi) para actualizar datos del usuario actual.
 * - DeleteAccountModal para confirmación de eliminación de cuenta.
 * - ChangePasswordForm para lógica aislada de cambio de contraseña.
 *
 * Reglas de negocio:
 * - Trainer y Athlete: pueden editar su perfil y eliminar la cuenta.
 * - Admin: puede editar su perfil, pero no eliminar la cuenta (restricción).
 *
 * Manejo de errores sin acoplar a @reduxjs/toolkit/query: guard local que
 * detecta la forma { data?: { detail?: string } } y devuelve mensaje estable.
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v2.3.0 - Dashboard-optimized design with glassmorphism cards
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useUpdateAccountMutation } from "@shared/api/accountApi";
import { selectUser, setCurrentUser, logout } from "@shared/store/authSlice";
import type { AppDispatch } from "@shared/store";
import type { UpdateAccountPayload } from "@shared/types/account";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountModal } from "./modals/DeleteAccountModal";

/** 
 * Extrae un mensaje de error estable desde el shape típico de RTK Query:
 * { data?: { detail?: string } }. Evita dependencias de tipos externos.
 */
const getServerErrorMessage = (err: unknown): string => {
    if (typeof err === "object" && err !== null && "data" in err) {
        const maybe = err as { data?: { detail?: string } };
        return maybe?.data?.detail || "Error al actualizar la cuenta";
    }
    return "Error al actualizar la cuenta";
};

export const ProfileForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const user = useSelector(selectUser);

    const [updateAccount, { isLoading }] = useUpdateAccountMutation();

    const [formData, setFormData] = useState<UpdateAccountPayload>({
        nombre: "",
        apellidos: "",
        email: "",
    });

    const [errors, setErrors] = useState<Partial<UpdateAccountPayload>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Estado modal de eliminación
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    // Cargar valores iniciales desde auth.user
    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre,
                apellidos: user.apellidos,
                email: user.email,
            });
        }
    }, [user]);

    const handleInputChange =
        (field: keyof UpdateAccountPayload) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, [field]: e.target.value });
                // Clear field error on change
                if (errors[field]) {
                    setErrors({ ...errors, [field]: undefined });
                }
            };

    const validateForm = (): boolean => {
        const newErrors: Partial<UpdateAccountPayload> = {};
        if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
        if (!formData.apellidos) newErrors.apellidos = "Los apellidos son obligatorios";
        if (!formData.email) newErrors.email = "El email es obligatorio";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);
        setSuccessMessage(null);

        if (!validateForm()) return;

        try {
            const updated = await updateAccount(formData).unwrap();
            dispatch(setCurrentUser(updated.user));
            setSuccessMessage("Perfil actualizado correctamente");

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            // ✅ Sin any y sin dependencia de tipos RTK en apps/web
            setServerError(getServerErrorMessage(err));
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4">Mi Cuenta</h1>
                <p className="text-white/80 text-xl">
                    Gestiona tu información personal y configuración de seguridad
                </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Success message */}
                {successMessage && (
                    <div className="bg-green-50/95 backdrop-blur-sm border border-green-200 rounded-2xl p-6">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-green-800 font-medium">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Server Error */}
                <ServerErrorBanner
                    error={serverError}
                    onDismiss={() => setServerError(null)}
                />

                {/* Profile Information Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Información Personal</h2>
                        <p className="text-slate-600">
                            Actualiza tus datos básicos de perfil
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                label="Nombre"
                                value={formData.nombre || ""}
                                onChange={handleInputChange("nombre")}
                                error={errors.nombre}
                                placeholder="Tu nombre"
                                isRequired
                                disabled={isLoading}
                                size="lg"
                            />

                            <Input
                                type="text"
                                label="Apellidos"
                                value={formData.apellidos || ""}
                                onChange={handleInputChange("apellidos")}
                                error={errors.apellidos}
                                placeholder="Tus apellidos"
                                isRequired
                                disabled={isLoading}
                                size="lg"
                            />
                        </div>

                        <Input
                            type="email"
                            label="Correo electrónico"
                            value={formData.email || ""}
                            onChange={handleInputChange("email")}
                            error={errors.email}
                            placeholder="Introduce tu correo electrónico"
                            isRequired
                            disabled={isLoading}
                            size="lg"
                        />

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                isLoading={isLoading}
                                className="px-8 min-w-[180px]"
                            >
                                {isLoading ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Change Password Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                    <ChangePasswordForm />
                </div>

                {/* Account Actions Card - Only for non-admin users */}
                {user?.role !== "admin" && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-800 mb-4">Zona de Peligro</h3>
                            <p className="text-slate-600 mb-2 max-w-md mx-auto">
                                Una vez eliminada tu cuenta, perderás acceso permanente a todos tus datos.
                            </p>
                            <p className="text-sm text-red-600 font-medium mb-8">
                                Esta acción no se puede deshacer.
                            </p>

                            <Button
                                type="button"
                                variant="danger"
                                size="lg"
                                onClick={() => setDeleteOpen(true)}
                                className="px-8 min-w-[180px]"
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de eliminación */}
            <DeleteAccountModal
                isOpen={isDeleteOpen}
                onClose={() => setDeleteOpen(false)}
                onDeleteSuccess={async () => {
                    await dispatch(logout());
                    navigate("/auth/login", { replace: true });
                }}
                userName={`${user?.nombre ?? ""} ${user?.apellidos ?? ""}`.trim()}
                userEmail={user?.email}
            />
        </div>
    );
};
