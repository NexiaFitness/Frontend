/**
 * BlockAuthoringStepLoad.tsx — Paso volumen e intensidad (sliders premium).
 */

import React from "react";

import type { VolumeIntensityContext } from "@nexia/shared";
import type { PeriodizationVolumeNominalPhase } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";
import { cn } from "@/lib/utils";

import { BlockLevelMeter } from "./BlockLevelMeter";
import { VolumeIntensityExplainer } from "./VolumeIntensityExplainer";
import { AUTHORING_STEP_INNER_PANEL_CLASS } from "./phaseAuthoringPresentation";

interface Props {
    volumeLevel: number;
    intensityLevel: number;
    onVolumeChange: (value: number) => void;
    onIntensityChange: (value: number) => void;
    volumeIntensityContext?: VolumeIntensityContext | null;
    volumeIntensityPhase?: PeriodizationVolumeNominalPhase;
    volumeIntensityHint?: string | null;
    premiumLayout?: boolean;
}

export const BlockAuthoringStepLoad: React.FC<Props> = ({
    volumeLevel,
    intensityLevel,
    onVolumeChange,
    onIntensityChange,
    volumeIntensityContext,
    volumeIntensityPhase,
    volumeIntensityHint,
    premiumLayout = false,
}) => {
    const panelClass = premiumLayout ? AUTHORING_STEP_INNER_PANEL_CLASS : undefined;

    return (
        <div className={cn("space-y-6", premiumLayout && "md:space-y-8")}>
            <div className={panelClass}>
                <BlockLevelMeter
                    tone="volume"
                    prefix="Volumen"
                    level={volumeLevel}
                    min={1}
                    max={10}
                    step={1}
                    onChange={onVolumeChange}
                />
            </div>

            <div className={panelClass}>
                <BlockLevelMeter
                    tone="intensity"
                    prefix="Intensidad"
                    level={intensityLevel}
                    min={1}
                    max={10}
                    step={1}
                    onChange={onIntensityChange}
                />
            </div>

            {volumeIntensityPhase != null ? (
                <VolumeIntensityExplainer
                    context={volumeIntensityContext ?? null}
                    phase={volumeIntensityPhase}
                    hint={volumeIntensityHint}
                />
            ) : null}
        </div>
    );
};
