/**
 * CompleteProfileBanner - Aviso para perfiles incompletos.
 * 
 * Versión compacta y de ancho completo, con estilo coherente con el banner de email.
 * Tipografía más pequeña, botón outline a la derecha.
 * 
 * @since v2.4.1
 * @updated v4.0.0 - Full width + diseño compacto + botón outline
 * @updated v4.1.0 - Recibe user completo para detectar cambios durante hydration
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons/Button";
import { useCompleteProfile } from "@nexia/shared";
import type { User } from "@nexia/shared/types/auth";

interface Props {
    user: User | null;
    redirectTo?: string;
    isProfileComplete?: boolean; // ✅ OPTIMIZACIÓN: Recibir como prop para evitar hook dentro del componente
}

// ✅ OPTIMIZACIÓN: Recibir isProfileComplete como prop para evitar hook dentro del componente
const CompleteProfileBannerComponent: React.FC<Props> = ({
    user,
    redirectTo = "/dashboard/trainer/complete-profile",
    isProfileComplete: isProfileCompleteProp,
}) => {
    const navigate = useNavigate();
    
    // ✅ OPTIMIZACIÓN: Solo usar hook como fallback si no viene como prop
    // Esto previene re-renders innecesarios cuando se pasa como prop
    const { isProfileComplete: isProfileCompleteFromHook } = useCompleteProfile();
    const isProfileComplete = isProfileCompleteProp ?? isProfileCompleteFromHook;

    // Log estratégico del banner
    // eslint-disable-next-line no-console
    console.info("[CompleteProfileBanner]", {
        user: user?.email || 'no user',
        role: user?.role || 'no role',
        isProfileComplete,
        willRender: user && user.role === 'trainer' && !isProfileComplete
    });

    // Si user es null (loading), no mostrar banner
    if (!user) {
        return null;
    }

    // Solo mostrar para trainers
    if (user.role !== 'trainer') {
        return null;
    }

    // Si el perfil está completo, no mostrar banner
    if (isProfileComplete) {
        return null;
    }

    return (
        <div className="w-full mb-4">
            <div className="bg-yellow-400/90 text-yellow-900 flex flex-col md:flex-row md:items-center md:justify-between border-b-2 border-yellow-600/40 p-3 md:p-4 lg:p-5 shadow-md">
                <div className="flex items-start space-x-3 flex-1">
                    <svg
                        className="w-5 h-5 text-yellow-900 mt-0.5 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div className="flex-1 text-sm leading-snug">
                        <p className="font-medium">
                            Completa tu perfil profesional
                        </p>
                        <p className="opacity-90 mt-0.5">
                            Necesitamos algunos datos más para que puedas gestionar clientes y entrenamientos.
                        </p>
                    </div>
                </div>

                <div className="flex items-center mt-3 md:mt-0">
                        <Button
                            onClick={() => {
                                // Usar navigate con replace para evitar problemas de historial
                                navigate(redirectTo, { replace: true });
                            }}
                        variant="outline"
                        size="sm"
                    >
                        Completar ahora
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ✅ OPTIMIZACIÓN: Memoizar componente con comparación que incluye isProfileComplete
export const CompleteProfileBanner = React.memo(CompleteProfileBannerComponent, (prevProps, nextProps) => {
    // Comparar props básicas
    const prevRole = prevProps.user?.role ?? null;
    const nextRole = nextProps.user?.role ?? null;
    const prevEmail = prevProps.user?.email ?? null;
    const nextEmail = nextProps.user?.email ?? null;
    const prevUserId = prevProps.user?.id ?? null;
    const nextUserId = nextProps.user?.id ?? null;
    const prevIsComplete = prevProps.isProfileComplete ?? null;
    const nextIsComplete = nextProps.isProfileComplete ?? null;
    
    // Si ambos son null, no re-renderizar
    if (prevProps.user === null && nextProps.user === null) {
        return true; // No re-renderizar
    }
    
    // Si cambió el rol, email, ID o isProfileComplete, re-renderizar
    if (
        prevRole !== nextRole || 
        prevEmail !== nextEmail || 
        prevUserId !== nextUserId ||
        prevIsComplete !== nextIsComplete
    ) {
        return false; // Re-renderizar
    }
    
    // Si no cambió nada relevante, no re-renderizar
    return true; // No re-renderizar
});