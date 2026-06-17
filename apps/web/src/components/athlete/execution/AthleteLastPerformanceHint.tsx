/**
 * AthleteLastPerformanceHint.tsx — Hint "Última vez" en run (F3c-FE-01).
 */

import React from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/buttons";

export interface AthleteLastPerformanceHintProps {
    weightKg: number;
    reps: number | null;
    rpe: number | null;
    performedAtLabel: string;
    onApply: () => void;
}

function formatHintLine(weightKg: number, reps: number | null, rpe: number | null): string {
    const parts = [`${weightKg} kg`];
    if (reps != null) parts.push(`${reps} reps`);
    if (rpe != null) parts.push(`RPE ${rpe}`);
    return parts.join(" · ");
}

export const AthleteLastPerformanceHint: React.FC<AthleteLastPerformanceHintProps> = ({
    weightKg,
    reps,
    rpe,
    performedAtLabel,
    onApply,
}) => {
    return (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm text-foreground">
                    <span className="font-medium">Última vez:</span>{" "}
                    {formatHintLine(weightKg, reps, rpe)}
                    {performedAtLabel ? ` (${performedAtLabel})` : ""}
                </p>
                <Button type="button" variant="secondary" size="sm" onClick={onApply}>
                    Usar
                </Button>
            </div>
        </div>
    );
};
