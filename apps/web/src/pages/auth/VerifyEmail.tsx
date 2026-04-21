/**
 * VerifyEmail — Página de verificación de correo electrónico.
 *
 * - Usa RTK Query (useVerifyEmailMutation)
 * - Feedback visual coherente con LoginForm / RegisterForm
 * - Envuelto en AuthLayout para consistencia con resto de auth (Fase 3)
 *
 * @since v2.3.0
 * @updated v5.0.0 - Nexia Sparkle Flow (Fase 3): AuthLayout, tokens
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/buttons";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useVerifyEmailMutation } from "@nexia/shared/api/authApi";
import { setCurrentUser } from "@nexia/shared/store/authSlice";
import type { AppDispatch } from "@nexia/shared/store";

const VerifyEmailForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [verifyEmail, { isLoading, isSuccess, isError, error }] =
        useVerifyEmailMutation();

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (token) verifyEmail({ token });
    }, [verifyEmail]);

    useEffect(() => {
        if (isSuccess) {
            // Recuperar usuario actual del localStorage y marcar como verificado
            const storedUser = JSON.parse(localStorage.getItem("nexia_user") || "{}");
            if (storedUser && Object.keys(storedUser).length > 0) {
                dispatch(setCurrentUser({ ...storedUser, is_verified: true }));
            }

            const timer = setTimeout(() => navigate("/dashboard", { replace: true }), 2500);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, dispatch, navigate]);

    return (
        <AuthLayout>
            <div className="space-y-6 text-center">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                    Verificación de correo electrónico
                </h1>

                {isLoading && (
                    <p className="text-sm text-muted-foreground">
                        Verificando tu cuenta, por favor espera...
                    </p>
                )}

                {isSuccess && (
                    <div className="rounded-lg border border-success/30 bg-success/10 p-6">
                        <h2 className="mb-2 font-semibold text-success">
                            ¡Correo verificado correctamente!
                        </h2>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Serás redirigido a tu panel en unos segundos.
                        </p>
                        <Button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            variant="primary"
                            size="md"
                            className="w-full"
                        >
                            Ir al Dashboard
                        </Button>
                    </div>
                )}

                {isError && (
                    <>
                        <ServerErrorBanner
                            error={
                                (error as { data?: { detail?: string } })?.data?.detail ||
                                "El enlace de verificación no es válido o ha expirado."
                            }
                            onDismiss={() => navigate("/auth/login")}
                        />
                        <Button
                            type="button"
                            onClick={() => navigate("/auth/login")}
                            variant="outline"
                            size="md"
                            className="w-full"
                        >
                            Volver al login
                        </Button>
                    </>
                )}
            </div>
        </AuthLayout>
    );
};

// Exportación por defecto para compatibilidad con App.tsx
const VerifyEmail = VerifyEmailForm;
export default VerifyEmail;
