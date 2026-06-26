/**
 * AthleteDashboardHeader.tsx — Saludo + campana feedback (V01 F2/F3b).
 */

import React from "react";
import { Bell } from "lucide-react";
import {
    ATHLETE_DASHBOARD_BELL_BADGE,
    ATHLETE_DASHBOARD_BELL_BUTTON,
} from "@/components/athlete/dashboard/athleteDashboardPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import {
    NEXIA_PORTAL_GREETING_H1,
    NEXIA_PORTAL_GREETING_NAME,
    NEXIA_PORTAL_GREETING_SUBTITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";

export interface AthleteDashboardHeaderProps {
    userName: string;
    subtitle: string;
    showFeedbackBadge?: boolean;
    onBellClick: () => void;
}

function displayFirstName(fullName: string): string {
    const trimmed = fullName.trim();
    if (!trimmed) return "Atleta";
    return trimmed.split(/\s+/)[0] ?? trimmed;
}

export const AthleteDashboardHeader: React.FC<AthleteDashboardHeaderProps> = ({
    userName,
    subtitle,
    showFeedbackBadge = false,
    onBellClick,
}) => {
    const firstName = displayFirstName(userName);

    return (
        <header className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                    <h1 className={NEXIA_PORTAL_GREETING_H1}>
                        Hola,{" "}
                        <span className={NEXIA_PORTAL_GREETING_NAME}>{firstName}</span>
                    </h1>
                    <p className={NEXIA_PORTAL_GREETING_SUBTITLE}>{subtitle}</p>
                </div>
                <button
                    type="button"
                    onClick={onBellClick}
                    className={ATHLETE_DASHBOARD_BELL_BUTTON}
                    aria-label={
                        showFeedbackBadge
                            ? "Respuesta nueva del entrenador — ver notas"
                            : "Ver notas y feedback"
                    }
                >
                    <Bell className="size-5" aria-hidden />
                    {showFeedbackBadge && (
                        <span className={ATHLETE_DASHBOARD_BELL_BADGE} aria-hidden />
                    )}
                </button>
            </div>

            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};
