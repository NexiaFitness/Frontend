/**
 * VerifyEmailForm.tsx — Formulario de verificación de correo electrónico.
 *
 * - Usa RTK Query (useVerifyEmailMutation)
 * - Feedback visual coherente con LoginForm / RegisterForm
 * - Actualiza el usuario verificado en Redux y redirige al Dashboard
 *
 * @since v2.3.0
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/buttons";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { TYPOGRAPHY } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
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
        <div className="space-y-6 text-center">
            <h1 className={`${TYPOGRAPHY.pageTitle} text-primary-400`}>
                Verificación de correo electrónico
            </h1>

            {isLoading && (
                <p className={`${TYPOGRAPHY.body} text-gray-600`}>
                    Verificando tu cuenta, por favor espera...
                </p>
            )}

            {isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-green-700 font-semibold mb-2">
                        ¡Correo verificado correctamente!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Serás redirigido a tu panel en unos segundos.
                    </p>
                    <Button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        variant="primary"
                        className={BUTTON_PRESETS.formPrimary}
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
                        variant="secondary"
                        className={BUTTON_PRESETS.formSecondary}
                    >
                        Volver al login
                    </Button>
                </>
            )}
        </div>
    );
};

// Exportación por defecto para compatibilidad con App.tsx
const VerifyEmail = VerifyEmailForm;
export default VerifyEmail;
