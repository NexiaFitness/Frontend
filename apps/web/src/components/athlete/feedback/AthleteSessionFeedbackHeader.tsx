/**
 * AthleteSessionFeedbackHeader.tsx — Cabecera premium formulario feedback (V07).
 */

import React from "react";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import {
    ATHLETE_BACK_LINK,
    ATHLETE_DIVIDER,
    ATHLETE_PAGE_HEADER_ICON,
} from "@/components/athlete/account/athleteSettingsPresentation";

export interface AthleteSessionFeedbackHeaderProps {
    onBack: () => void;
    sessionName?: string | null;
}

export const AthleteSessionFeedbackHeader: React.FC<AthleteSessionFeedbackHeaderProps> = ({
    onBack,
    sessionName,
}) => {
    const title = sessionName?.trim() || "Tu entrenamiento";

    return (
        <header className="space-y-4">
            <button type="button" onClick={onBack} className={ATHLETE_BACK_LINK}>
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                Volver
            </button>

            <div className="flex items-start gap-3">
                <span className={ATHLETE_PAGE_HEADER_ICON} aria-hidden>
                    <MessageSquarePlus className="size-5" />
                </span>
                <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        ¿Cómo fue la sesión?
                    </h1>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {title} · Tu entrenador verá esto al revisar tu ficha
                    </p>
                </div>
            </div>

            <div className={`w-full ${ATHLETE_DIVIDER}`} aria-hidden />
        </header>
    );
};
