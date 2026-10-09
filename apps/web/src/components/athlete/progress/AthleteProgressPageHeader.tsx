/**
 * AthleteProgressPageHeader.tsx — Cabecera premium V10 progreso.
 * Contexto: volver, chip de bloque (PROG-3) y selector de periodo.
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { ArrowLeft, TrendingUp } from "lucide-react";
import {
    ATHLETE_BACK_LINK,
    ATHLETE_PAGE_HEADER_ICON,
    ATHLETE_SECTION_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import { ATHLETE_PROGRESS_BLOCK_CHIP } from "./athleteProgressViewPresentation";

export interface AthleteProgressPageHeaderProps {
    onBack: () => void;
    blockChipLabel?: string | null;
    onBlockChipClick?: () => void;
    periodSelector?: React.ReactNode;
}

export const AthleteProgressPageHeader: React.FC<AthleteProgressPageHeaderProps> = ({
    onBack,
    blockChipLabel,
    onBlockChipClick,
    periodSelector,
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
            {blockChipLabel && onBlockChipClick && (
                <button
                    type="button"
                    className={ATHLETE_PROGRESS_BLOCK_CHIP}
                    onClick={onBlockChipClick}
                >
                    <span className="truncate">{blockChipLabel}</span>
                </button>
            )}
            {periodSelector}
            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};
