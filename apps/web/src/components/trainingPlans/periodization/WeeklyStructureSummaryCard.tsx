/**
 * WeeklyStructureSummaryCard.tsx — Card resumen compacta de la estructura semanal
 * para el panel de creación/edición de bloques de periodización.
 *
 * Reemplaza al render inline largo del draft: muestra solo título, contador
 * `withPatterns / totalTrainable`, barra de progreso y un botón "Configurar"
 * que delega la edición al `PeriodizationWeeklyStructureModal`.
 *
 * Spec: docs/specs/estructura-semanal/02_SPEC_TECNICO_MODAL.md §4.1
 */

import React from "react";

import { Button } from "@/components/ui/buttons";

export interface WeeklyStructureSummaryCardProps {
    totalTrainable: number;
    withPatterns: number;
    hasTrainingDays: boolean;
    onOpen: () => void;
}

export const WeeklyStructureSummaryCard: React.FC<
    WeeklyStructureSummaryCardProps
> = ({ totalTrainable, withPatterns, hasTrainingDays, onOpen }) => {
    const pct =
        totalTrainable > 0
            ? Math.min(100, Math.round((withPatterns / totalTrainable) * 100))
            : 0;
    const pending = Math.max(0, totalTrainable - withPatterns);

    return (
        <div className="rounded-md border border-border bg-surface-2/30 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estructura semanal
                </p>
                {hasTrainingDays && totalTrainable > 0 && (
                    <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                        {withPatterns} / {totalTrainable} días
                    </span>
                )}
            </div>

            {!hasTrainingDays ? (
                <p className="text-[11px] text-muted-foreground">
                    Define los días de entreno del cliente primero.
                </p>
            ) : totalTrainable === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                    El rango seleccionado no contiene días de entreno del cliente.
                </p>
            ) : (
                <>
                    <div
                        className="w-full h-1 bg-surface-2 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={withPatterns}
                        aria-valuemin={0}
                        aria-valuemax={totalTrainable}
                    >
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        {pending > 0 ? (
                            <p className="text-[11px] text-muted-foreground">
                                {pending} {pending === 1 ? "día pendiente" : "días pendientes"}
                            </p>
                        ) : (
                            <p className="text-[11px] text-success">
                                Todos los días configurados
                            </p>
                        )}
                        <Button variant="outline" size="sm" onClick={onOpen}>
                            Configurar
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
