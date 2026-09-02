/**
 * BlockAuthoringStepLoad.tsx — Paso volumen e intensidad (sliders premium).
 */

import React from "react";

import type { VolumeIntensityContext } from "@nexia/shared";
import type { PeriodizationVolumeNominalPhase } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";

import { VolumeIntensityExplainer } from "./VolumeIntensityExplainer";
import { SliderLevelBadge } from "./SliderLevelBadge";
import { AUTHORING_STEP_META_CLASS } from "./phaseAuthoringPresentation";

interface Props {
    volumeLevel: number;
    intensityLevel: number;
    onVolumeChange: (value: number) => void;
    onIntensityChange: (value: number) => void;
    volumeIntensityContext?: VolumeIntensityContext | null;
    volumeIntensityPhase?: PeriodizationVolumeNominalPhase;
    volumeIntensityHint?: string | null;
}

export const BlockAuthoringStepLoad: React.FC<Props> = ({
    volumeLevel,
    intensityLevel,
    onVolumeChange,
    onIntensityChange,
    volumeIntensityContext,
    volumeIntensityPhase,
    volumeIntensityHint,
}) => (
    <div className="space-y-6">
        <div>
            <div className="mb-2 flex items-center justify-between gap-2">
                <p className={AUTHORING_STEP_META_CLASS}>Volumen</p>
                <div className="flex items-center gap-2">
                    <SliderLevelBadge level={volumeLevel} tone="volume" />
                    <span className="text-sm font-bold tabular-nums text-primary">
                        {volumeLevel}/10
                    </span>
                </div>
            </div>
            <input
                type="range"
                min={1}
                max={10}
                value={volumeLevel}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-2 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                aria-label="Volumen"
            />
        </div>

        <div>
            <div className="mb-2 flex items-center justify-between gap-2">
                <p className={AUTHORING_STEP_META_CLASS}>Intensidad</p>
                <div className="flex items-center gap-2">
                    <SliderLevelBadge level={intensityLevel} tone="intensity" />
                    <span className="text-sm font-bold tabular-nums text-warning">
                        {intensityLevel}/10
                    </span>
                </div>
            </div>
            <input
                type="range"
                min={1}
                max={10}
                value={intensityLevel}
                onChange={(e) => onIntensityChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-2 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-warning [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-warning [&::-webkit-slider-thumb]:shadow-md"
                aria-label="Intensidad"
            />
        </div>

        {volumeIntensityPhase != null && (
            <VolumeIntensityExplainer
                context={volumeIntensityContext ?? null}
                phase={volumeIntensityPhase}
                hint={volumeIntensityHint}
            />
        )}
    </div>
);
