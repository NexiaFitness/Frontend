/**
 * ProfileForm.tsx — Formulario de perfil de cuenta para dashboard.
 *
 * Contexto:
 * - Renderiza secciones internas: Información personal, Seguridad y Zona de peligro.
 * - El encabezado principal se movió a Account.tsx para unificar con dashboards.
 * - Usa useAuthForm pattern y RTK Query (updateAccount).
 * - Unificado con tipografía y BUTTON_PRESETS como Login/Register/etc.
 *
 * Notas de mantenimiento:
 * - Feedback de éxito/error con tipografía consistente.
 * - Botones centralizados en BUTTON_PRESETS para evitar parches.
 *
 * @since v4.2.0
 * @updated v4.3.7 - Header movido a Account.tsx
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useUpdateAccountMutation } from "@nexia/shared/api/accountApi";
import { selectUser, setCurrentUser, logout } from "@nexia/shared/store/authSlice";
import type { AppDispatch } from "@nexia/shared/store";
import type { UpdateAccountPayload } from "@nexia/shared/types/account";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountModal } from "./modals/DeleteAccountModal";

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
    const [isDeleteOpen, setDeleteOpen] = useState(false);

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
            dispatch(setCurrentUser(updated));
            setSuccessMessage("Perfil actualizado correctamente");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setServerError(getServerErrorMessage(err));
        }
    };

    return (
        <div className="space-y-8">
            {/* Mensajes de estado */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className={TYPOGRAPHY_COMBINATIONS.successMessage}>{successMessage}</p>
                </div>
            )}

            <ServerErrorBanner error={serverError} onDismiss={() => setServerError(null)} />

            {/* Información Personal */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <div className="mb-8">
                    <h2 className={`${TYPOGRAPHY.sectionTitle} text-slate-800 mb-2`}>
                        Información Personal
                    </h2>
                    <p className={`${TYPOGRAPHY.body} text-slate-600`}>
                        Actualiza tus datos básicos de perfil
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                    />

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isLoading}
                            disabled={isLoading}
                            className={BUTTON_PRESETS.formPrimary + " md:w-auto md:min-w-[180px]"}
                        >
                            {isLoading ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Seguridad */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <ChangePasswordForm />
            </div>

            {/* Zona de Peligro (solo no-admin) */}
            {user?.role !== "admin" && (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>

                        <h3 className={`${TYPOGRAPHY.sectionTitle} text-slate-800 mb-4`}>
                            Zona de Peligro
                        </h3>
                        <p
                            className={`${TYPOGRAPHY.body} text-slate-600 mb-2 max-w-md mx-auto`}
                        >
                            Una vez eliminada tu cuenta, perderás acceso permanente a todos tus datos.
                        </p>
                        <p
                            className={`${TYPOGRAPHY.errorText} text-red-600 font-medium mb-8`}
                        >
                            Esta acción no se puede deshacer.
                        </p>

                        <Button
                            type="button"
                            variant="danger"
                            size="md"
                            onClick={() => setDeleteOpen(true)}
                            className={BUTTON_PRESETS.formPrimary + " md:w-auto md:min-w-[180px]"}
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            )}

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
