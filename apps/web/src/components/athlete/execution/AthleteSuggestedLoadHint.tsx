/**
 * AthleteSuggestedLoadHint.tsx — Sugerencia de carga premium (F3d-FE-03).
 */

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ATHLETE_RUN_FIELD_HINT,
    ATHLETE_RUN_HINT_APPLY_BTN,
    ATHLETE_RUN_HINT_VALUE,
    ATHLETE_RUN_LOGGER_SECTION_LABEL,
} from "./athleteRunPresentation";

export interface AthleteSuggestedLoadHintProps {
    suggestedWeightKg: number;
    explanation: string;
    onApply: () => void;
    className?: string;
}

export const AthleteSuggestedLoadHint: React.FC<AthleteSuggestedLoadHintProps> = ({
    suggestedWeightKg,
    explanation,
    onApply,
    className,
}) => {
    return (
        <div className={cn("relative", className)}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="size-4 shrink-0 text-primary/80" aria-hidden />
                    <p className={ATHLETE_RUN_LOGGER_SECTION_LABEL}>Sugerencia de carga</p>
                </div>

                <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <p className={ATHLETE_RUN_HINT_VALUE}>{suggestedWeightKg} kg</p>
                        <p className={ATHLETE_RUN_FIELD_HINT}>{explanation}</p>
                    </div>
                    <button type="button" className={ATHLETE_RUN_HINT_APPLY_BTN} onClick={onApply}>
                        Usar
                    </button>
                </div>
            </div>
        </div>
    );
};
