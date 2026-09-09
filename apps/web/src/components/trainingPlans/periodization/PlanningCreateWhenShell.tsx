/**
 * PlanningCreateWhenShell.tsx — Modo createWhen F5: calendario hero + selección de rango.
 */

import React from "react";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { Button } from "@/components/ui/buttons";
import { PeriodizationCalendar } from "./PeriodizationCalendar";
import { BlockCalendarRangeHint } from "./BlockCalendarRangeHint";
import { PlanningActivePlanCard } from "./PlanningActivePlanCard";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";
import {
    PLANNING_CREATE_WHEN_GRID_CLASS,
    PLANNING_SHELL_HEADER_CLASS,
    PLANNING_SHELL_SECTION_CLASS,
    PLANNING_SHELL_SUBTITLE_CLASS,
    PLANNING_SHELL_TITLE_CLASS,
} from "./planningShellPresentation";

interface Props {
    blocks: PlanPeriodBlock[];
    activePlan?: ActivePlanByClientOut;
    planStartDate?: string | null;
    planEndDate?: string | null;
    calMonth: Date;
    onMonthChange: (date: Date) => void;
    sessionDates: Set<string>;
    exceptionDates: Set<string>;
    formState: PeriodBlockFormState;
    weekCount: number | null;
    habitualTrainingDays?: readonly string[] | null;
    onDayClick: (dateStr: string) => void;
    onCancel: () => void;
    onCancelRange?: () => void;
}

export const PlanningCreateWhenShell: React.FC<Props> = ({
    blocks,
    activePlan,
    planStartDate,
    planEndDate,
    calMonth,
    onMonthChange,
    sessionDates,
    exceptionDates,
    formState,
    weekCount,
    habitualTrainingDays,
    onDayClick,
    onCancel,
    onCancelRange,
}) => (
    <section
        className={PLANNING_SHELL_SECTION_CLASS}
        data-testid="planning-create-when-shell"
    >
        <div className={PLANNING_SHELL_HEADER_CLASS}>
            <div className="space-y-1">
                <h3 className={PLANNING_SHELL_TITLE_CLASS}>Crear nuevo bloque</h3>
                <p className={PLANNING_SHELL_SUBTITLE_CLASS}>
                    Selecciona en el calendario cuándo empieza y termina la fase.
                </p>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="planning-create-when-cancel"
                onClick={onCancel}
            >
                Cancelar
            </Button>
        </div>

        <div className={PLANNING_CREATE_WHEN_GRID_CLASS}>
            <div className="min-w-0">
                <PeriodizationCalendar
                    currentMonth={calMonth}
                    onMonthChange={onMonthChange}
                    blocks={blocks}
                    planStartDate={planStartDate}
                    planEndDate={planEndDate}
                    sessionDates={sessionDates}
                    exceptionDates={exceptionDates}
                    formState={formState}
                    onDayClick={onDayClick}
                    habitualTrainingDays={habitualTrainingDays}
                />
            </div>

            <div className="flex min-w-0 flex-col gap-4">
                <BlockCalendarRangeHint
                    formPhase={formState.phase}
                    startDate={formState.startDate}
                    endDate={formState.endDate}
                    weekCount={weekCount}
                    onCancel={
                        formState.phase === "rangeStart" ? onCancelRange : undefined
                    }
                />
                {activePlan ? (
                    <PlanningActivePlanCard activePlan={activePlan} />
                ) : null}
            </div>
        </div>
    </section>
);
