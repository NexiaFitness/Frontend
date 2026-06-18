/**
 * AthleteSessionsHeader.tsx — Cabecera premium Mis sesiones (V02).
 */

import React from "react";
import { CalendarDays } from "lucide-react";
import {
    ATHLETE_DIVIDER,
    ATHLETE_PAGE_HEADER_ICON,
    ATHLETE_SECTION_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";

export interface AthleteSessionsHeaderProps {
    showSwipeHint?: boolean;
}

export const AthleteSessionsHeader: React.FC<AthleteSessionsHeaderProps> = ({
    showSwipeHint = false,
}) => {
    return (
        <header className="space-y-4">
            <div className="flex items-start gap-3">
                <span className={ATHLETE_PAGE_HEADER_ICON} aria-hidden>
                    <CalendarDays className="size-5" />
                </span>
                <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Mis sesiones
                    </h1>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Historial y sesiones programadas
                        {showSwipeHint && (
                            <span className="text-caption"> · Desliza una fila para vista rápida</span>
                        )}
                    </p>
                </div>
            </div>

            <div className={`w-full ${ATHLETE_DIVIDER}`} aria-hidden />
        </header>
    );
};

export const AthleteSessionsFilterLabel: React.FC = () => (
    <p className={ATHLETE_SECTION_LABEL}>Filtrar</p>
);
