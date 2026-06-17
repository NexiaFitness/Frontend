/**
 * AthleteSuggestedLoadHint.tsx — Sugerencia de carga rule-based (F3d-FE-03).
 */

import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/buttons";

export interface AthleteSuggestedLoadHintProps {
    suggestedWeightKg: number;
    explanation: string;
    onApply: () => void;
}

export const AthleteSuggestedLoadHint: React.FC<AthleteSuggestedLoadHintProps> = ({
    suggestedWeightKg,
    explanation,
    onApply,
}) => {
    return (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm text-foreground">
                    <span className="font-medium">Sugerencia:</span> {suggestedWeightKg} kg
                </p>
                <p className="text-caption text-muted-foreground">{explanation}</p>
                <Button type="button" variant="secondary" size="sm" onClick={onApply}>
                    Usar sugerencia
                </Button>
            </div>
        </div>
    );
};
