/**
 * AthleteSessionsHeader.tsx — Cabecera premium Mis sesiones (V02).
 */

import React from "react";
import { CalendarDays } from "lucide-react";
import {
    ATHLETE_PAGE_HEADER_ICON,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";

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

            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};

export const AthleteSessionsFilterLabel: React.FC = () => (
    <AthleteSectionHeading title="Filtrar" as="p" />
);
