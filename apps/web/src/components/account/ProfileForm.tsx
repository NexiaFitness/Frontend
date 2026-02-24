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
import { useUpdateAccountMutation, selectUser, setCurrentUser, logout } from "@nexia/shared";
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
                <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-success">{successMessage}</p>
                </div>
            )}

            <ServerErrorBanner error={serverError} onDismiss={() => setServerError(null)} />

            {/* Información Personal */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <div className="mb-8">
                    <h2 className={`${TYPOGRAPHY.sectionTitle} text-slate-800 mb-2 text-center lg:text-left`}>
                        Información Personal
                    </h2>
                    <p className={`${TYPOGRAPHY.body} text-slate-600 text-center lg:text-left`}>
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

                    <div className="flex justify-center lg:justify-end pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isLoading}
                            disabled={isLoading}
                            className="w-full text-base px-4 py-2.5 lg:text-lg lg:px-6 lg:py-3 md:w-auto md:min-w-[180px]"
                        >
                            {isLoading ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Seguridad */}
            <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <ChangePasswordForm />
            </div>

            {user?.role !== "admin" && (
                <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-destructive mb-2 text-center lg:text-left">
                        Zona de Peligro
                    </h3>
                    <p className="text-sm text-destructive mb-4 text-center lg:text-left">
                        Eliminar tu cuenta es una acción permanente. Todos los datos asociados
                        serán eliminados.
                    </p>
                    <div className="flex justify-center lg:justify-end pt-4">
                        <Button
                            type="button"
                            variant="danger"
                            size="md"
                            onClick={() => setDeleteOpen(true)}
                        >
                            Eliminar Cuenta
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
