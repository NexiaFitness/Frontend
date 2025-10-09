/**
 * EmailVerificationBanner - Aviso para emails no verificados
 * 
 * Mejorado para ocupar todo el ancho visible del dashboard.
 * Estilo más compacto y profesional: tipografía más pequeña, botón outline alineado a la derecha.
 * 
 * @author Frontend
 * @since v2.5.2
 * @updated v4.0.0 - Full width + diseño compacto + botón outline
 */

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/buttons";
import { useResendVerificationMutation } from "@nexia/shared/api/authApi";
import type { RootState } from "@nexia/shared/store";

interface Props {
    isEmailVerified: boolean;
}

export const EmailVerificationBanner: React.FC<Props> = ({ isEmailVerified }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [resendVerification, { isLoading, isSuccess, isError }] = useResendVerificationMutation();

    const [isDismissed, setIsDismissed] = useState(false);
    const DISMISS_KEY = `email-verification-dismissed-${user?.email}`;

    useEffect(() => {
        const dismissed = sessionStorage.getItem(DISMISS_KEY);
        if (dismissed === "true") setIsDismissed(true);
    }, [DISMISS_KEY]);

    if (isEmailVerified || isDismissed) return null;

    const handleResend = async () => {
        if (!user?.email) return;
        try {
            await resendVerification({ email: user.email }).unwrap();
        } catch (err) {
            console.error("Error resending verification:", err);
        }
    };

    const handleDismiss = () => {
        sessionStorage.setItem(DISMISS_KEY, "true");
        setIsDismissed(true);
    };

    return (
        <div className="w-full mb-4">
            <div className="bg-blue-500/90 text-white flex flex-col md:flex-row md:items-center md:justify-between border-b-2 border-blue-600/40 p-3 md:p-4 lg:p-5 shadow-md">
                <div className="flex items-start space-x-3 flex-1">
                    <svg
                        className="w-5 h-5 text-white mt-0.5 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <div className="flex-1 text-sm leading-snug">
                        <p className="font-medium">
                            Verifica tu correo electrónico
                        </p>
                        <p className="opacity-90 mt-0.5">
                            Para poder crear clientes y acceder a todas las funciones, necesitas verificar tu email:{" "}
                            <strong>{user?.email}</strong>
                        </p>
                    </div>
                </div>

                <div className="flex items-center mt-3 md:mt-0 gap-2">
                    <Button
                        onClick={handleResend}
                        variant="outline"
                        size="sm"
                        isLoading={isLoading}
                        disabled={isLoading || isSuccess}
                    >
                        {isLoading
                            ? "Enviando..."
                            : isSuccess
                            ? "Email enviado"
                            : "Reenviar verificación"}
                    </Button>

                    <button
                        onClick={handleDismiss}
                        className="text-white/80 hover:text-white transition-colors p-1"
                        aria-label="Cerrar"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
