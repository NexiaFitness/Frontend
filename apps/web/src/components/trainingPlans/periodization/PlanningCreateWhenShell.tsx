/**
 * PlanningCreateWhenShell.tsx — Selección de rango en calendario (primer bloque o añadir fase).
 */

import React from "react";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { PeriodizationCalendar } from "./PeriodizationCalendar";
import { BlockCalendarRangeHint } from "./BlockCalendarRangeHint";
import { PlanningActivePlanCard } from "./PlanningActivePlanCard";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";
import { formatProgramDurationLabel } from "./planningShellUtils";
import {
    PLANNING_CREATE_WHEN_GRID_CLASS,
    PLANNING_CREATE_WHEN_SIDEBAR_CLASS,
    PLANNING_PROGRAM_EYEBROW,
    PLANNING_PROGRAM_SUMMARY_CLASS,
    PLANNING_SHELL_HEADER_CLASS,
    PLANNING_SHELL_SECTION_CLASS,
    PLANNING_SHELL_SUBTITLE_CLASS,
    PLANNING_SHELL_TITLE_CLASS,
} from "./planningShellPresentation";

type PlanningCreateWhenVariant = "firstBlock" | "addPhase";

interface Props {
    variant?: PlanningCreateWhenVariant;
    blocks: PlanPeriodBlock[];
    activePlan?: ActivePlanByClientOut;
    planStartDate?: string | null;
    planEndDate?: string | null;
    trainingFrequencyLabel?: string | null;
    calMonth: Date;
    onMonthChange: (date: Date) => void;
    sessionDates: Set<string>;
    exceptionDates: Set<string>;
    formState: PeriodBlockFormState;
    weekCount: number | null;
    habitualTrainingDays?: readonly string[] | null;
    onDayClick: (dateStr: string) => void;
    onCancel: () => void;
    onContinueRange?: () => void;
    canContinueRange?: boolean;
    continueRangeDisabledReason?: string | null;
}

export const PlanningCreateWhenShell: React.FC<Props> = ({
    variant = "addPhase",
    blocks,
    activePlan,
    planStartDate,
    planEndDate,
    trainingFrequencyLabel = null,
    calMonth,
    onMonthChange,
    sessionDates,
    exceptionDates,
    formState,
    weekCount,
    habitualTrainingDays,
    onDayClick,
    onCancel,
    onContinueRange,
    canContinueRange = true,
    continueRangeDisabledReason = null,
}) => {
    const programDuration =
        planStartDate && planEndDate
            ? formatProgramDurationLabel(planStartDate, planEndDate)
            : null;

    const programMeta = [
        programDuration,
        trainingFrequencyLabel,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <section
            className={PLANNING_SHELL_SECTION_CLASS}
            data-testid="planning-create-when-shell"
        >
            {variant === "firstBlock" ? (
                <div className="space-y-3">
                    <PageTitle titleAs="h3" title="Planificación" />
                    {programMeta ? (
                        <div className="space-y-1">
                            <p className={PLANNING_PROGRAM_EYEBROW}>Programa actual</p>
                            <p className={PLANNING_PROGRAM_SUMMARY_CLASS}>{programMeta}</p>
                        </div>
                    ) : null}
                </div>
            ) : (
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
            )}

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

                <div className={PLANNING_CREATE_WHEN_SIDEBAR_CLASS}>
                    {activePlan ? (
                        <PlanningActivePlanCard activePlan={activePlan} />
                    ) : null}
                    <BlockCalendarRangeHint
                        formPhase={formState.phase}
                        startDate={formState.startDate}
                        endDate={formState.endDate}
                        weekCount={weekCount}
                        onContinue={
                            formState.phase === "rangeComplete" ? onContinueRange : undefined
                        }
                        canContinue={canContinueRange}
                        continueDisabledReason={continueRangeDisabledReason}
                    />
                </div>
            </div>
        </section>
    );
};
