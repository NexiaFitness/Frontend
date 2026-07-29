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
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { useCompleteProfile } from "@nexia/shared";
import {
    TRAINER_DASHBOARD_BANNER,
    TRAINER_DASHBOARD_BANNER_ACTIONS,
    TRAINER_DASHBOARD_BANNER_TEXT,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";
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
        <div className={TRAINER_DASHBOARD_BANNER}>
            <NexiaGlassAccentRim />
            <div className="flex items-start gap-3 sm:items-center">
                <AlertTriangle className="h-5 w-5 shrink-0 text-warning" aria-hidden />
                <p className={TRAINER_DASHBOARD_BANNER_TEXT}>
                    Completa tu perfil profesional para gestionar clientes y entrenamientos.
                </p>
            </div>
            <div className={TRAINER_DASHBOARD_BANNER_ACTIONS}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(redirectTo, { replace: true })}
                    className="min-h-touch w-full text-warning hover:bg-warning/10 hover:text-warning sm:min-h-0 sm:w-auto"
                >
                    Completar ahora
                </Button>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="min-h-touch px-2 text-warning/60 transition-colors hover:text-warning sm:min-h-0"
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
