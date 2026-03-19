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
import { useResendVerificationMutation } from "@nexia/shared";
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
        <div className="flex items-center justify-between rounded-lg bg-success/10 border border-success/20 px-5 py-3">
            <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-success" />
                <p className="text-sm text-success">
                    Para crear clientes y acceder a todas las funciones, verifica tu email:{" "}
                    <strong>{user?.email}</strong>
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    isLoading={isLoading}
                    disabled={isLoading || isSuccess}
                    className="text-success hover:text-success hover:bg-success/10"
                >
                    {isLoading ? "Enviando..." : isSuccess ? "Email enviado" : "Reenviar verificación"}
                </Button>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="text-success/60 hover:text-success transition-colors"
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
