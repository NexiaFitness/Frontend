/**
 * AthleteAgendaPageHeader — Cabecera premium (paridad Mi plan).
 */

import React from "react";
import { CalendarDays } from "lucide-react";
import {
    ATHLETE_PAGE_HEADER_ICON,
    ATHLETE_SECTION_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";

export const AthleteAgendaPageHeader: React.FC = () => (
    <header className="space-y-4">
        <div className="flex items-start gap-3">
            <span className={ATHLETE_PAGE_HEADER_ICON} aria-hidden>
                <CalendarDays className="size-5" />
            </span>
            <div className="min-w-0 space-y-1">
                <p className={ATHLETE_SECTION_LABEL}>Calendario</p>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi agenda</h1>
                <p className="text-sm text-muted-foreground">
                    Entrenos y citas de las próximas semanas, día a día.
                </p>
            </div>
        </div>
        <NexiaPremiumDivider className="w-full" />
    </header>
);
