/**
 * ProfileForm.tsx — Formulario de perfil de cuenta para dashboard plataforma.
 * Contexto: trainer/admin en Account.tsx. Atleta usa AthleteAccountPage.
 */

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { logout, selectUser, useLogout } from "@nexia/shared";
import type { AppDispatch } from "@nexia/shared/store";
import { useAccountProfileUpdate } from "@/hooks/account/useAccountProfileUpdate";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountModal } from "./modals/DeleteAccountModal";

export const ProfileForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { logout: handleLogout, isLoading: isLoggingOut } = useLogout({
        onNavigate: (path) => navigate(path, { replace: true }),
    });
    const user = useSelector(selectUser);
    const profile = useAccountProfileUpdate();
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    const {
        formData,
        errors,
        serverError,
        successMessage,
        isLoading,
        handleInputChange,
        handleSubmit,
        dismissServerError,
    } = profile;

    return (
        <div className="space-y-8">
            {successMessage && (
                <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                    <p className="text-sm font-medium text-success">{successMessage}</p>
                </div>
            )}

            <ServerErrorBanner error={serverError} onDismiss={dismissServerError} />

            <div className="rounded-2xl border border-border bg-card p-8 backdrop-blur-sm">
                <div className="mb-8">
                    <h2 className="mb-2 text-center text-lg font-semibold text-foreground lg:text-left">
                        Información Personal
                    </h2>
                    <p className="text-center text-sm text-muted-foreground lg:text-left">
                        Actualiza tus datos básicos de perfil
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                    <div className="flex justify-center pt-4 lg:justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isLoading}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 text-base md:w-auto md:min-w-[180px] lg:px-6 lg:py-3 lg:text-lg"
                        >
                            {isLoading ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 backdrop-blur-sm">
                <ChangePasswordForm />
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 backdrop-blur-sm">
                <h3 className="mb-2 text-center text-lg font-semibold text-foreground lg:text-left">
                    Sesión
                </h3>
                <p className="mb-4 text-center text-sm text-muted-foreground lg:text-left">
                    Cierra sesión en este dispositivo.
                </p>
                <div className="flex justify-center lg:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        className="min-h-touch-athlete w-full md:w-auto md:min-w-[180px]"
                        isLoading={isLoggingOut}
                        disabled={isLoggingOut}
                        onClick={() => void handleLogout()}
                    >
                        Cerrar sesión
                    </Button>
                </div>
            </div>

            {user?.role !== "admin" && (
                <div className="rounded-lg border-2 border-destructive/30 bg-destructive/10 p-6">
                    <h3 className="mb-2 text-center text-lg font-semibold text-destructive lg:text-left">
                        Zona de Peligro
                    </h3>
                    <p className="mb-4 text-center text-sm text-destructive lg:text-left">
                        Eliminar tu cuenta es una acción permanente. Todos los datos asociados
                        serán eliminados.
                    </p>
                    <div className="flex justify-center pt-4 lg:justify-end">
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
