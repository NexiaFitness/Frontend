/**
 * EmailVerificationBanner — Aviso para emails no verificados.
 *
 * Estilo semi-transparente verde (success), coherente con el banner de alertas.
 * Layout: icono + texto a la izquierda, botón + cerrar a la derecha.
 *
 * @since v2.5.2
 * @updated v5.x - Diseño spec: bg-success/10, border-success/20, botón ghost
 */

import React, { useState } from "react";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { useResendVerificationMutation } from "@nexia/shared";
import {
    TRAINER_DASHBOARD_BANNER_ACTIONS,
    TRAINER_DASHBOARD_BANNER_SUCCESS,
    TRAINER_DASHBOARD_BANNER_SUCCESS_TEXT,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";
import type { User } from "@nexia/shared/types/auth";

interface Props {
    user: User | null;
}

const EmailVerificationBannerComponent: React.FC<Props> = ({ user }) => {
    const [visible, setVisible] = useState(true);
    const [resendVerification, { isLoading, isSuccess }] = useResendVerificationMutation();

    if (!user || user.is_verified || !visible) {
        return null;
    }

    const handleResend = async () => {
        if (!user?.email) return;
        try {
            await resendVerification({ email: user.email }).unwrap();
        } catch (err) {
            console.error("Error resending verification:", err);
        }
    };

    return (
        <div className={TRAINER_DASHBOARD_BANNER_SUCCESS}>
            <NexiaGlassAccentRim />
            <div className="flex items-start gap-3 sm:items-center">
                <Mail className="h-5 w-5 shrink-0 text-success" aria-hidden />
                <p className={TRAINER_DASHBOARD_BANNER_SUCCESS_TEXT}>
                    Para crear clientes y acceder a todas las funciones, verifica tu email:{" "}
                    <strong>{user?.email}</strong>
                </p>
            </div>
            <div className={TRAINER_DASHBOARD_BANNER_ACTIONS}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    isLoading={isLoading}
                    disabled={isLoading || isSuccess}
                    className="min-h-touch w-full text-success hover:bg-success/10 hover:text-success sm:min-h-0 sm:w-auto"
                >
                    {isLoading ? "Enviando..." : isSuccess ? "Email enviado" : "Reenviar verificación"}
                </Button>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="min-h-touch px-2 text-success/60 transition-colors hover:text-success sm:min-h-0"
                    aria-label="Cerrar aviso"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export const EmailVerificationBanner = React.memo(EmailVerificationBannerComponent, (prevProps, nextProps) => {
    const prevIsVerified = prevProps.user?.is_verified ?? null;
    const nextIsVerified = nextProps.user?.is_verified ?? null;
    const prevEmail = prevProps.user?.email ?? null;
    const nextEmail = nextProps.user?.email ?? null;

    if (prevProps.user === null && nextProps.user === null) return true;
    if (prevIsVerified !== nextIsVerified || prevEmail !== nextEmail) return false;
    return true;
});
