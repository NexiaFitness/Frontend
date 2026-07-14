/**
 * AthleteProgressPageHeader.tsx — Cabecera premium V10 progreso.
 */

import React from "react";
import { ArrowLeft, TrendingUp } from "lucide-react";
import {
    ATHLETE_BACK_LINK,
    ATHLETE_PAGE_HEADER_ICON,
    ATHLETE_SECTION_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";

export interface AthleteProgressPageHeaderProps {
    onBack: () => void;
}

export const AthleteProgressPageHeader: React.FC<AthleteProgressPageHeaderProps> = ({
    onBack,
}) => {
    return (
        <header className="space-y-4">
            <button type="button" onClick={onBack} className={ATHLETE_BACK_LINK}>
                <ArrowLeft className="size-4" aria-hidden />
                Volver
            </button>
            <div className="flex items-start gap-3">
                <span className={ATHLETE_PAGE_HEADER_ICON} aria-hidden>
                    <TrendingUp className="size-5" />
                </span>
                <div className="min-w-0 space-y-1">
                    <p className={ATHLETE_SECTION_LABEL}>Tu evolución</p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Mi progreso
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Adherencia, cargas y marcas personales en un vistazo
                    </p>
                </div>
            </div>
            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};
