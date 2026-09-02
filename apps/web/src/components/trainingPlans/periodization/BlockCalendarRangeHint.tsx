/**
 * BlockCalendarRangeHint.tsx — Guía contextual de selección de rango en calendario (D-PAP).
 *
 * Sustituye CTA «Añadir bloque»: el calendario es la entrada; este panel orienta in situ.
 */

import React from "react";

import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";

import {
    AUTHORING_STEP_CARD_CLASS,
    AUTHORING_STEP_META_CLASS,
} from "./phaseAuthoringPresentation";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";

function formatDateShort(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

interface Props {
    formPhase: PeriodBlockFormState["phase"];
    startDate: string | null;
    onCancel?: () => void;
}

export const BlockCalendarRangeHint: React.FC<Props> = ({
    formPhase,
    startDate,
    onCancel,
}) => (
    <div
        className={AUTHORING_STEP_CARD_CLASS}
        data-testid="block-calendar-range-hint"
    >
        <NexiaGlassAccentRim />
        <p className={AUTHORING_STEP_META_CLASS}>Nuevo bloque</p>

        {formPhase === "idle" && (
            <>
                <p className="text-sm font-semibold text-foreground">
                    Haz clic en una fecha del calendario
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Elige inicio y fin con dos clics. Verás bloques existentes y la
                    vigencia del plan mientras seleccionas.
                </p>
            </>
        )}

        {formPhase === "rangeStart" && (
            <>
                <p className="text-sm font-semibold text-foreground">
                    Selección de rango
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
                    <span className="text-sm font-medium text-foreground">
                        Inicio:{" "}
                        {startDate ? formatDateShort(startDate) : "…"}
                    </span>
                </div>
                <p className="mt-3 text-xs font-medium text-primary animate-pulse">
                    Haz clic en el día final para cerrar el rango
                </p>
                {onCancel && (
                    <div className="mt-4 flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                    </div>
                )}
            </>
        )}
    </div>
);
