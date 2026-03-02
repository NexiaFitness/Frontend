/**
 * CompleteProfileBanner — Aviso para perfiles incompletos (onboarding).
 *
 * Estilo semi-transparente amarillo/naranja (warning), coherente con el banner
 * de alertas del dashboard. Layout: icono + texto a la izquierda, botón + cerrar a la derecha.
 *
 * @since v2.4.1
 * @updated v5.x - Diseño spec: bg-warning/10, border-warning/20, botón ghost
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { useCompleteProfile } from "@nexia/shared";
import type { User } from "@nexia/shared/types/auth";

interface Props {
    user: User | null;
    redirectTo?: string;
    isProfileComplete?: boolean;
}

const CompleteProfileBannerComponent: React.FC<Props> = ({
    user,
    redirectTo = "/dashboard/trainer/complete-profile",
    isProfileComplete: isProfileCompleteProp,
}) => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(true);

    const { isProfileComplete: isProfileCompleteFromHook } = useCompleteProfile();
    const isProfileComplete = isProfileCompleteProp ?? isProfileCompleteFromHook;

    if (!user || user.role !== "trainer" || isProfileComplete || !visible) {
        return null;
    }

    return (
        <div className="flex items-center justify-between rounded-lg bg-warning/10 border border-warning/20 px-5 py-3">
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                <p className="text-sm text-warning">
                    Completa tu perfil profesional para gestionar clientes y entrenamientos.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(redirectTo, { replace: true })}
                    className="text-warning hover:text-warning hover:bg-warning/10"
                >
                    Completar ahora
                </Button>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="text-warning/60 hover:text-warning transition-colors"
                    aria-label="Cerrar aviso"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export const CompleteProfileBanner = React.memo(CompleteProfileBannerComponent, (prevProps, nextProps) => {
    const prevRole = prevProps.user?.role ?? null;
    const nextRole = nextProps.user?.role ?? null;
    const prevEmail = prevProps.user?.email ?? null;
    const nextEmail = nextProps.user?.email ?? null;
    const prevUserId = prevProps.user?.id ?? null;
    const nextUserId = nextProps.user?.id ?? null;
    const prevIsComplete = prevProps.isProfileComplete ?? null;
    const nextIsComplete = nextProps.isProfileComplete ?? null;

    if (prevProps.user === null && nextProps.user === null) return true;
    if (prevRole !== nextRole || prevEmail !== nextEmail || prevUserId !== nextUserId || prevIsComplete !== nextIsComplete) {
        return false;
    }
    return true;
});
