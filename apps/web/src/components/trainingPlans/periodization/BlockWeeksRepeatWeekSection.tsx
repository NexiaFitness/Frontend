/**
 * BlockWeeksRepeatWeekSection.tsx — Repetir semana (legacy editor) en gestión de semanas.
 *
 * Contexto: WeeklyStructureEditor incluye «Repetir semana» y toast weeks_skipped (D-REP-6);
 * no estaba montado en ninguna ruta tras D-PAP. Sección acotada bajo Ver semanas (APB-03).
 */

import React from "react";

import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";

import { WeeklyStructureEditor } from "./WeeklyStructureEditor";

export interface BlockWeeksRepeatWeekSectionProps {
    planId: number;
    block: PlanPeriodBlock;
}

export const BlockWeeksRepeatWeekSection: React.FC<
    BlockWeeksRepeatWeekSectionProps
> = ({ planId, block }) => {
    return (
        <section
            className="mt-6 rounded-lg border border-border/60 bg-surface/50 p-4"
            aria-label="Repetir semana y sesiones"
            data-testid="weekly-structure-editor"
        >
            <p className="text-xs text-muted-foreground mb-3">
                Repetir semana copia estructura y sesiones planificadas a otras
                semanas del bloque.
            </p>
            <WeeklyStructureEditor
                planId={planId}
                blockId={block.id}
                block={{
                    start_date: block.start_date,
                    end_date: block.end_date,
                }}
            />
        </section>
    );
};
