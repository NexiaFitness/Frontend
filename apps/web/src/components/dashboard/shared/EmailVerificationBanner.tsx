/**
 * EmailVerificationBanner - Aviso para emails no verificados
 * 
 * Mejorado para ocupar todo el ancho visible del dashboard.
 * Estilo más compacto y profesional: tipografía más pequeña, botón outline alineado a la derecha.
 * 
 * @author Frontend
 * @since v2.5.2
 * @updated v4.0.0 - Full width + diseño compacto + botón outline
 * @updated v4.1.0 - Recibe user completo para detectar cambios durante hydration
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { useResendVerificationMutation } from "@nexia/shared/api/authApi";
import type { User } from "@nexia/shared/types/auth";

interface Props {
    user: User | null;
}

// ✅ FASE 1.3: Optimizar re-renders con React.memo
// Solo re-renderizar si cambió is_verified o el email del usuario
const EmailVerificationBannerComponent: React.FC<Props> = ({ user }) => {
    const [resendVerification, { isLoading, isSuccess }] = useResendVerificationMutation();
    
    // Log estratégico del banner
    // eslint-disable-next-line no-console
    console.info("[EmailVerificationBanner]", {
        user: user?.email || 'no user',
        isVerified: user?.is_verified ?? 'no user',
        willRender: user && !user.is_verified
    });
    
    // Limpiar cualquier dismiss previo (banner no dismissable)
    React.useEffect(() => {
        if (user?.email) {
            const dismissKey = `email-verification-dismissed-${user.email}`;
            sessionStorage.removeItem(dismissKey);
        }
    }, [user?.email]);
    
    // Si user es null (loading), no mostrar banner
    if (!user) return null;

    // Si email verificado, no mostrar banner
    if (user.is_verified) return null;

    const handleResend = async () => {
        if (!user?.email) return;
        try {
            await resendVerification({ email: user.email }).unwrap();
        } catch (err) {
            console.error("Error resending verification:", err);
        }
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

                </div>
            </div>
        </div>
    );
};

// Memoizar componente para evitar re-renders innecesarios
export const EmailVerificationBanner = React.memo(EmailVerificationBannerComponent, (prevProps, nextProps) => {
    // Solo re-renderizar si cambió is_verified o el email del usuario
    const prevIsVerified = prevProps.user?.is_verified ?? null;
    const nextIsVerified = nextProps.user?.is_verified ?? null;
    const prevEmail = prevProps.user?.email ?? null;
    const nextEmail = nextProps.user?.email ?? null;
    
    // Si ambos son null, no re-renderizar
    if (prevProps.user === null && nextProps.user === null) {
        return true; // No re-renderizar
    }
    
    // Si cambió is_verified o email, re-renderizar
    if (prevIsVerified !== nextIsVerified || prevEmail !== nextEmail) {
        return false; // Re-renderizar
    }
    
    // Si no cambió nada relevante, no re-renderizar
    return true; // No re-renderizar
});