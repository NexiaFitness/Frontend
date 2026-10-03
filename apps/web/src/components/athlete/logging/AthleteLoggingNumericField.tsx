/**
 * AthleteLoggingNumericField.tsx — Campo numérico atleta (teclado + ±, FE-4 P1-6).
 * Contexto: guiado y futuro registro al final; sin spinners nativos.
 * Notas de mantenimiento: objetivos táctiles mín. 44 px en botones ±.
 * @author Frontend Team
 * @since v8.3.0
 */

import React, { useCallback, useEffect, useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    clampWeightKg,
    parseDecimalInput,
    shouldCommitNumericDraftOnChange,
} from "@nexia/shared/utils/athlete/athleteLoggingUtils";
import {
    ATHLETE_RUN_FIELD_LABEL,
    ATHLETE_RUN_STEPPER_BTN,
    ATHLETE_RUN_STEPPER_ROW,
    ATHLETE_RUN_VALUE_PILL,
} from "@/components/athlete/execution/athleteRunPresentation";

export interface AthleteLoggingNumericFieldProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    unit?: string;
    step?: number;
    min?: number;
    max?: number;
    inputMode?: "decimal" | "numeric";
    allowDecimal?: boolean;
    className?: string;
}

const INPUT_CLASS =
    "h-12 min-h-[44px] w-full min-w-0 rounded-lg border border-border bg-background px-3 text-center text-xl font-semibold tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export const AthleteLoggingNumericField: React.FC<AthleteLoggingNumericFieldProps> = ({
    label,
    value,
    onChange,
    unit,
    step = 1,
    min = 0,
    max,
    inputMode = "numeric",
    allowDecimal = false,
    className,
}) => {
    const inputId = useId();
    const [draft, setDraft] = useState(String(value));
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        if (!focused) {
            setDraft(allowDecimal ? String(value) : String(Math.round(value)));
        }
    }, [allowDecimal, focused, value]);

    const commitDraft = useCallback(
        (raw: string) => {
            const parsed = allowDecimal ? parseDecimalInput(raw) : Number.parseInt(raw, 10);
            if (parsed == null || Number.isNaN(parsed)) {
                onChange(min);
                return;
            }
            let next = allowDecimal ? clampWeightKg(parsed) : Math.round(parsed);
            if (next < min) next = min;
            if (max != null && next > max) next = max;
            onChange(next);
        },
        [allowDecimal, max, min, onChange]
    );

    const adjust = (delta: number) => {
        let next = value + delta;
        if (next < min) next = min;
        if (max != null && next > max) next = max;
        if (allowDecimal) next = clampWeightKg(next);
        else next = Math.round(next);
        onChange(next);
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={inputId} className={ATHLETE_RUN_FIELD_LABEL}>
                    {label}
                </label>
                {unit ? (
                    <span className="text-xs text-muted-foreground/70">{unit}</span>
                ) : null}
            </div>
            <div className={ATHLETE_RUN_STEPPER_ROW}>
                <button
                    type="button"
                    className={cn(ATHLETE_RUN_STEPPER_BTN, "min-h-11 min-w-11")}
                    onClick={() => adjust(-step)}
                    disabled={value <= min}
                    aria-label={`Reducir ${label.toLowerCase()}`}
                >
                    <Minus className="size-5" aria-hidden />
                </button>
                <input
                    id={inputId}
                    type="text"
                    inputMode={inputMode}
                    autoComplete="off"
                    enterKeyHint="done"
                    className={cn(ATHLETE_RUN_VALUE_PILL, INPUT_CLASS, "flex-1")}
                    value={draft}
                    onChange={(event) => {
                        const raw = event.target.value;
                        const normalized = allowDecimal
                            ? raw.replace(",", ".")
                            : raw.replace(/\D/g, "");
                        setDraft(normalized);
                        if (shouldCommitNumericDraftOnChange(normalized, allowDecimal)) {
                            commitDraft(normalized);
                        }
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setFocused(false);
                        commitDraft(draft);
                    }}
                    aria-label={label}
                />
                <button
                    type="button"
                    className={cn(ATHLETE_RUN_STEPPER_BTN, "min-h-11 min-w-11")}
                    onClick={() => adjust(step)}
                    disabled={max != null && value >= max}
                    aria-label={`Aumentar ${label.toLowerCase()}`}
                >
                    <Plus className="size-5" aria-hidden />
                </button>
            </div>
        </div>
    );
};
