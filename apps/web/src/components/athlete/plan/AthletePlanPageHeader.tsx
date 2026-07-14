/**
 * AthletePlanPageHeader.tsx — Cabecera premium Mi plan (V08).
 */

import React from "react";
import { ClipboardList, Target } from "lucide-react";
import {
    ATHLETE_PAGE_HEADER_ICON,
    ATHLETE_SECTION_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";

export interface AthletePlanPageHeaderProps {
    planTitle: string;
    planGoalLabel: string;
}

export const AthletePlanPageHeader: React.FC<AthletePlanPageHeaderProps> = ({
    planTitle,
    planGoalLabel,
}) => {
    return (
        <header className="space-y-4">
            <div className="flex items-start gap-3">
                <span className={ATHLETE_PAGE_HEADER_ICON} aria-hidden>
                    <ClipboardList className="size-5" />
                </span>
                <div className="min-w-0 space-y-1">
                    <p className={ATHLETE_SECTION_LABEL}>Plan activo</p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{planTitle}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="size-4 shrink-0 text-primary/80" aria-hidden />
                        <span>{planGoalLabel}</span>
                    </div>
                </div>
            </div>
            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};
