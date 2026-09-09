/**
 * BlockCalendarRangeHint.tsx — Guía contextual de selección de rango en calendario (D-PAP).
 */

import React from "react";
import { CalendarRange, Target } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";
import {
    PLANNING_CREATE_BLOCK_ACTIVE_HINT,
    PLANNING_CREATE_BLOCK_DESCRIPTION,
    PLANNING_CREATE_BLOCK_FOOTER_STACK,
    PLANNING_CREATE_BLOCK_GLOW,
    PLANNING_CREATE_BLOCK_HINT_DOT,
    PLANNING_CREATE_BLOCK_HINT_ITEM,
    PLANNING_CREATE_BLOCK_HINTS,
    PLANNING_CREATE_BLOCK_ICON_WRAP,
    PLANNING_CREATE_BLOCK_IDLE_BODY,
    PLANNING_CREATE_BLOCK_META,
    PLANNING_CREATE_BLOCK_PANEL_CLASS,
    PLANNING_CREATE_BLOCK_PANEL_INNER,
    PLANNING_CREATE_BLOCK_STAT_ROW,
    PLANNING_CREATE_BLOCK_TITLE,
} from "./planningShellPresentation";

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
    endDate?: string | null;
    weekCount?: number | null;
    onContinue?: () => void;
    canContinue?: boolean;
    continueDisabledReason?: string | null;
}

const RANGE_HINTS = [
    "El calendario muestra la vigencia del plan y los bloques ya creados.",
    "Con dos clics defines inicio y fin; luego pulsa Continuar para configurar la fase.",
] as const;

export const BlockCalendarRangeHint: React.FC<Props> = ({
    formPhase,
    startDate,
    endDate = null,
    weekCount = null,
    onContinue,
    canContinue = true,
    continueDisabledReason = null,
}) => (
    <article
        className={PLANNING_CREATE_BLOCK_PANEL_CLASS}
        data-testid="block-calendar-range-hint"
    >
        <NexiaGlassAccentRim />
        {formPhase === "idle" ? (
            <div className={PLANNING_CREATE_BLOCK_GLOW} aria-hidden />
        ) : null}

        <div className={PLANNING_CREATE_BLOCK_PANEL_INNER}>
            <p className={PLANNING_CREATE_BLOCK_META}>Nuevo bloque</p>

            {formPhase === "idle" && (
                <div className={PLANNING_CREATE_BLOCK_IDLE_BODY}>
                    <div className={PLANNING_CREATE_BLOCK_ICON_WRAP}>
                        <Target className="size-6" aria-hidden />
                    </div>
                    <h4 className={PLANNING_CREATE_BLOCK_TITLE}>Selecciona un rango</h4>
                    <p className={PLANNING_CREATE_BLOCK_DESCRIPTION}>
                        Haz clic en un día del calendario para iniciar la selección, luego
                        en el día final para configurar el bloque de entrenamiento.
                    </p>

                    <div className={PLANNING_CREATE_BLOCK_HINTS}>
                        {RANGE_HINTS.map((hint) => (
                            <p key={hint} className={PLANNING_CREATE_BLOCK_HINT_ITEM}>
                                <span className={PLANNING_CREATE_BLOCK_HINT_DOT} aria-hidden />
                                <span>{hint}</span>
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {formPhase === "rangeStart" && (
                <div className="flex min-h-0 flex-1 flex-col pt-4">
                    <div className={PLANNING_CREATE_BLOCK_ICON_WRAP}>
                        <CalendarRange className="size-6" aria-hidden />
                    </div>
                    <h4 className={cn(PLANNING_CREATE_BLOCK_TITLE, "mt-4")}>
                        Selección de rango
                    </h4>
                    <p className={cn(PLANNING_CREATE_BLOCK_DESCRIPTION, "mt-2 max-w-none text-left")}>
                        Fecha de inicio fijada. Elige el último día del bloque en el calendario.
                    </p>

                    <div className={cn(PLANNING_CREATE_BLOCK_STAT_ROW, "mt-5")}>
                        <span className="text-muted-foreground">Inicio</span>
                        <span className="font-medium text-foreground">
                            {startDate ? formatDateShort(startDate) : "…"}
                        </span>
                    </div>

                    <p className={cn(PLANNING_CREATE_BLOCK_ACTIVE_HINT, "mt-auto pt-6")}>
                        Haz clic en el día final para cerrar el rango. Puedes cambiar el inicio
                        eligiendo otro día en el calendario.
                    </p>
                </div>
            )}

            {formPhase === "rangeComplete" && startDate && endDate && (
                <div className="flex min-h-0 flex-1 flex-col pt-4">
                    <div className={PLANNING_CREATE_BLOCK_ICON_WRAP}>
                        <CalendarRange className="size-6" aria-hidden />
                    </div>
                    <h4 className={cn(PLANNING_CREATE_BLOCK_TITLE, "mt-4")}>
                        Rango seleccionado
                    </h4>
                    <p className={cn(PLANNING_CREATE_BLOCK_DESCRIPTION, "mt-2 max-w-none text-left")}>
                        Revisa las fechas y ajusta el rango en el calendario si hace falta.
                    </p>

                    <dl className="mt-5 space-y-2">
                        <div className={PLANNING_CREATE_BLOCK_STAT_ROW}>
                            <dt className="text-muted-foreground">Inicio</dt>
                            <dd className="font-medium text-foreground">
                                {formatDateShort(startDate)}
                            </dd>
                        </div>
                        <div className={PLANNING_CREATE_BLOCK_STAT_ROW}>
                            <dt className="text-muted-foreground">Fin</dt>
                            <dd className="font-medium text-foreground">
                                {formatDateShort(endDate)}
                            </dd>
                        </div>
                        {weekCount != null && weekCount > 0 ? (
                            <div
                                className={cn(
                                    PLANNING_CREATE_BLOCK_STAT_ROW,
                                    "border-border/60 bg-surface-2/40",
                                )}
                            >
                                <dt className="text-muted-foreground">Duración</dt>
                                <dd className="font-medium text-foreground">
                                    {weekCount} semana{weekCount === 1 ? "" : "s"}
                                </dd>
                            </div>
                        ) : null}
                    </dl>

                    {continueDisabledReason ? (
                        <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                            {continueDisabledReason}
                        </p>
                    ) : null}

                    {onContinue ? (
                        <div className={PLANNING_CREATE_BLOCK_FOOTER_STACK}>
                            <p className={cn(PLANNING_CREATE_BLOCK_ACTIVE_HINT, "text-left")}>
                                Haz clic en cualquier día del calendario para cambiar las fechas.
                            </p>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={onContinue}
                                    disabled={!canContinue}
                                >
                                    Continuar
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    </article>
);
