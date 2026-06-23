/**
 * AthleteRunStepperControl.tsx — Stepper peso/reps premium (paridad V07).
 */

import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_RUN_FIELD_LABEL,
    ATHLETE_RUN_STEPPER_BTN,
    ATHLETE_RUN_STEPPER_ROW,
    ATHLETE_RUN_VALUE_PILL,
} from "./athleteRunPresentation";

export interface AthleteRunStepperControlProps {
    label: string;
    value: number;
    unit?: string;
    onDecrease: () => void;
    onIncrease: () => void;
    decreaseDisabled?: boolean;
    increaseDisabled?: boolean;
    className?: string;
}

export const AthleteRunStepperControl: React.FC<AthleteRunStepperControlProps> = ({
    label,
    value,
    unit,
    onDecrease,
    onIncrease,
    decreaseDisabled = false,
    increaseDisabled = false,
    className,
}) => {
    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-baseline justify-between gap-2">
                <span className={ATHLETE_RUN_FIELD_LABEL}>{label}</span>
                {unit ? (
                    <span className="text-xs text-muted-foreground/70">{unit}</span>
                ) : null}
            </div>
            <div className={ATHLETE_RUN_STEPPER_ROW}>
                <button
                    type="button"
                    className={ATHLETE_RUN_STEPPER_BTN}
                    onClick={onDecrease}
                    disabled={decreaseDisabled}
                    aria-label={`Reducir ${label.toLowerCase()}`}
                >
                    <Minus className="size-5" aria-hidden />
                </button>
                <span className={ATHLETE_RUN_VALUE_PILL}>{value}</span>
                <button
                    type="button"
                    className={ATHLETE_RUN_STEPPER_BTN}
                    onClick={onIncrease}
                    disabled={increaseDisabled}
                    aria-label={`Aumentar ${label.toLowerCase()}`}
                >
                    <Plus className="size-5" aria-hidden />
                </button>
            </div>
        </div>
    );
};
