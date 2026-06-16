/**
 * AthleteSetLogger.tsx — Steppers peso/reps + chips RPE (DESIGN §7.4).
 */

import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button, SegmentButton } from "@/components/ui/buttons";

const RPE_OPTIONS = [6, 7, 8, 9, 10] as const;

export interface AthleteSetLoggerProps {
    weight: number;
    reps: number;
    rpe: number | null;
    onWeightChange: (value: number) => void;
    onRepsChange: (value: number) => void;
    onRpeChange: (value: number | null) => void;
}

export const AthleteSetLogger: React.FC<AthleteSetLoggerProps> = ({
    weight,
    reps,
    rpe,
    onWeightChange,
    onRepsChange,
    onRpeChange,
}) => {
    return (
        <div className="space-y-6">
            <div>
                <p className="mb-2 text-sm font-medium text-foreground">Peso (kg)</p>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="min-h-touch-athlete min-w-touch-athlete"
                        onClick={() => onWeightChange(Math.max(0, weight - 2.5))}
                    >
                        <Minus className="size-5" />
                    </Button>
                    <span className="min-w-[4rem] text-center text-2xl font-bold tabular-nums">
                        {weight}
                    </span>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="min-h-touch-athlete min-w-touch-athlete"
                        onClick={() => onWeightChange(weight + 2.5)}
                    >
                        <Plus className="size-5" />
                    </Button>
                </div>
            </div>

            <div>
                <p className="mb-2 text-sm font-medium text-foreground">Reps</p>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="min-h-touch-athlete min-w-touch-athlete"
                        onClick={() => onRepsChange(Math.max(1, reps - 1))}
                    >
                        <Minus className="size-5" />
                    </Button>
                    <span className="min-w-[4rem] text-center text-2xl font-bold tabular-nums">
                        {reps}
                    </span>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="min-h-touch-athlete min-w-touch-athlete"
                        onClick={() => onRepsChange(reps + 1)}
                    >
                        <Plus className="size-5" />
                    </Button>
                </div>
            </div>

            <div>
                <p className="mb-2 text-sm font-medium text-foreground">RPE (opcional)</p>
                <div className="flex flex-wrap gap-2">
                    {RPE_OPTIONS.map((value) => (
                        <SegmentButton
                            key={value}
                            selected={rpe === value}
                            onClick={() => onRpeChange(rpe === value ? null : value)}
                            size="md"
                        >
                            {value}
                        </SegmentButton>
                    ))}
                </div>
            </div>
        </div>
    );
};
