/**
 * PhaseSummaryPanel.tsx — Checklist D-RES y gate «Dejar lista» (F2).
 *
 * Contexto: panel lateral de resumen de readiness de fase durante autoría.
 * Consume phaseReadiness de @nexia/shared.
 *
 * Notas de mantenimiento: no persiste estado; deriva checklist del draft del padre.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import React from "react";
import { Check, Circle } from "lucide-react";

import {
    buildPhaseReadinessChecklist,
    canActivatePhase,
    derivePhaseUxLabel,
    type PhaseReadinessInput,
} from "@nexia/shared";

import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";

import {
    PHASE_UX_CHIP_CLASS,
    PHASE_UX_LABEL_ES,
    PHASE_SUMMARY_PANEL_CLASS,
    PHASE_SUMMARY_TITLE_CLASS,
} from "./phaseConstructorPresentation";

interface Props {
    readinessInput: PhaseReadinessInput;
    onMarkReady?: () => void;
    className?: string;
}

function ChecklistRow({
    done,
    label,
}: {
    done: boolean;
    label: string;
}) {
    return (
        <li className="flex items-center gap-2 text-xs">
            {done ? (
                <Check className="h-3.5 w-3.5 text-success shrink-0" aria-hidden />
            ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden />
            )}
            <span className={done ? "text-foreground" : "text-muted-foreground"}>
                {label}
            </span>
        </li>
    );
}

export const PhaseSummaryPanel: React.FC<Props> = ({
    readinessInput,
    onMarkReady,
    className,
}) => {
    const checklist = buildPhaseReadinessChecklist(readinessInput);
    const uxLabel = derivePhaseUxLabel(readinessInput);
    const canMarkReady = canActivatePhase(readinessInput);

    return (
        <section
            className={cn(PHASE_SUMMARY_PANEL_CLASS, className)}
            aria-label="Resumen de fase"
        >
            <NexiaGlassAccentRim />
            <div className="flex items-center justify-between gap-2">
                <h4 className={PHASE_SUMMARY_TITLE_CLASS}>Resumen</h4>
                <span
                    className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                        PHASE_UX_CHIP_CLASS[uxLabel],
                    )}
                >
                    {readinessInput.blockId && !readinessInput.isDirty
                        ? PHASE_UX_LABEL_ES[uxLabel]
                        : "Sin guardar"}
                </span>
            </div>

            <ul className="space-y-1.5">
                <ChecklistRow done={checklist.datesValid} label="Fechas válidas" />
                <ChecklistRow
                    done={checklist.qualitiesComplete}
                    label="Cualidades al 100 %"
                />
                <ChecklistRow
                    done={checklist.loadValid}
                    label="Volumen e intensidad"
                />
                <ChecklistRow
                    done={checklist.structureComplete}
                    label="Patrones en días entrenables"
                />
            </ul>

            {onMarkReady && (
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={!canMarkReady}
                    onClick={onMarkReady}
                >
                    Dejar fase lista
                </Button>
            )}
        </section>
    );
};
