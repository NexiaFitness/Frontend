/**
 * PeriodBlockAddPhaseCard.tsx — CTA en fila de fases (paridad visual con PeriodBlockCard).
 */

import React from "react";
import { Plus } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    PERIOD_BLOCK_ADD_PHASE_CARD_BODY_CLASS,
    PERIOD_BLOCK_ADD_PHASE_CARD_CLASS,
    PERIOD_BLOCK_ADD_PHASE_DESCRIPTION,
    PERIOD_BLOCK_ADD_PHASE_ICON_WRAP,
    PERIOD_BLOCK_ADD_PHASE_TITLE,
} from "./periodBlockCardPresentation";

function formatDateShort(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

interface Props {
    onAddPhase: () => void;
    /** Primer día sugerido dentro del plan (informativo). */
    suggestedStartDate?: string | null;
}

export const PeriodBlockAddPhaseCard: React.FC<Props> = ({
    onAddPhase,
    suggestedStartDate = null,
}) => (
    <button
        type="button"
        className={PERIOD_BLOCK_ADD_PHASE_CARD_CLASS}
        data-testid="planning-add-phase-card"
        onClick={onAddPhase}
    >
        <NexiaGlassAccentRim />
        <div className={PERIOD_BLOCK_ADD_PHASE_CARD_BODY_CLASS}>
            <div className={PERIOD_BLOCK_ADD_PHASE_ICON_WRAP} aria-hidden>
                <Plus className="size-5" strokeWidth={2.25} />
            </div>
            <div className="space-y-1">
                <p className={PERIOD_BLOCK_ADD_PHASE_TITLE}>Añadir fase</p>
                <p className={PERIOD_BLOCK_ADD_PHASE_DESCRIPTION}>
                    {suggestedStartDate
                        ? `Siguiente hueco desde el ${formatDateShort(suggestedStartDate)}. Elige el rango en el calendario.`
                        : "Continúa el programa con otra fase. Elige el rango en el calendario."}
                </p>
            </div>
        </div>
    </button>
);
