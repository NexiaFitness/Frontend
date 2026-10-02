/**
 * PlanningExploreShell.tsx — Hub F5: programa, fases, calendario y selección de rango inline.
 */

import React, { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import type { VolumeIntensityContext } from "@nexia/shared";
import type { StructureDriftSessionSummary } from "@nexia/shared";
import type { PeriodizationVolumeNominalPhase } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";
import { PeriodizationCalendar } from "./PeriodizationCalendar";
import { PeriodBlockCard } from "./PeriodBlockCard";
import { PeriodBlockAddPhaseCard } from "./PeriodBlockAddPhaseCard";
import { PeriodBlockEmptyCallout } from "./PeriodBlockEmptyCallout";
import { PeriodBlockStructureDriftCallout } from "./PeriodBlockStructureDriftCallout";
import {
    canAddPeriodPhase,
    resolveNextPhaseStartDate,
} from "./planningShellUtils";
import { BlockCalendarRangeHint } from "./BlockCalendarRangeHint";
import { PlanningProgramSummaryCard } from "./PlanningProgramSummaryCard";
import { PlanningShellBodyLayout } from "./PlanningShellBodyLayout";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";
import {
    PLANNING_EXPLORE_BLOCKS_ROW,
    PLANNING_NO_PHASES_CALLOUT_PRIMARY,
    PLANNING_NO_PHASES_CALLOUT_SECONDARY,
    PLANNING_PLANS_HISTORY_TRIGGER,
    PLANNING_PLANS_HISTORY_TRIGGER_ROW,
    PLANNING_PROGRAM_SUMMARY_STACK,
    PLANNING_SHELL_PANEL_STACK,
    PLANNING_SHELL_SECTION_CLASS,
} from "./planningShellPresentation";

interface Props {
    blocks: PlanPeriodBlock[];
    catalog: PhysicalQuality[];
    sessionsByBlock: Map<number, TrainingSession[]>;
    activePlan?: ActivePlanByClientOut;
    clientId?: number;
    planStartDate?: string | null;
    planEndDate?: string | null;
    trainingFrequencyLabel: string | null;
    calMonth: Date;
    onMonthChange: (date: Date) => void;
    sessionDates: Set<string>;
    exceptionDates: Set<string>;
    structurePendingDates?: Set<string>;
    calendarFormState: PeriodBlockFormState;
    isPickingPhaseRange: boolean;
    weekCount: number | null;
    onContinueRange: () => void;
    canContinueRange: boolean;
    continueRangeDisabledReason: string | null;
    habitualTrainingDays?: readonly string[] | null;
    onDayClick: (dateStr: string) => void;
    onDayRightClick?: (dateStr: string) => void;
    onAddPhase: () => void;
    onEditBlock: (block: PlanPeriodBlock) => void;
    onViewWeeks: (block: PlanPeriodBlock) => void;
    onDeleteBlock: (id: number, label: string) => void;
    onCreateSessionForBlock: (block: PlanPeriodBlock) => void;
    focusedBlockId?: number | null;
    onFocusBlock?: (block: PlanPeriodBlock) => void;
    structureDriftByBlockId?: Record<number, StructureDriftSessionSummary[]>;
    buildVolumeContext: (
        volumeLevel: number | null | undefined,
        intensityLevel: number | null | undefined,
    ) => VolumeIntensityContext | null;
    volumeIntensityPhase: PeriodizationVolumeNominalPhase;
    showOtherPlansAction?: boolean;
    onOpenOtherPlans?: () => void;
    structureCoverageBlockId?: number | null;
    structureCoverageIncomplete?: boolean;
    structureCoverageWeeklyStructurePath?: string | null;
}

export const PlanningExploreShell: React.FC<Props> = ({
    blocks,
    catalog,
    sessionsByBlock,
    activePlan,
    clientId,
    planStartDate,
    planEndDate,
    trainingFrequencyLabel,
    calMonth,
    onMonthChange,
    sessionDates,
    exceptionDates,
    structurePendingDates,
    calendarFormState,
    isPickingPhaseRange,
    weekCount,
    onContinueRange,
    canContinueRange,
    continueRangeDisabledReason,
    habitualTrainingDays,
    onDayClick,
    onDayRightClick,
    onAddPhase,
    onEditBlock,
    onViewWeeks,
    onDeleteBlock,
    onCreateSessionForBlock,
    focusedBlockId = null,
    onFocusBlock,
    structureDriftByBlockId = {},
    buildVolumeContext,
    volumeIntensityPhase,
    showOtherPlansAction = false,
    onOpenOtherPlans,
    structureCoverageBlockId = null,
    structureCoverageIncomplete = false,
    structureCoverageWeeklyStructurePath = null,
}) => {
    const hintFormPhase = isPickingPhaseRange ? calendarFormState.phase : "idle";

    const showAddPhaseCard = useMemo(
        () => canAddPeriodPhase(blocks, planStartDate, planEndDate),
        [blocks, planStartDate, planEndDate],
    );

    const suggestedPhaseStartDate = useMemo(
        () => resolveNextPhaseStartDate(blocks, planStartDate),
        [blocks, planStartDate],
    );

    /** Fila horizontal de fases: solo cuando ya hay al menos una (la primera va en el empty callout). */
    const showBlocksRow = blocks.length > 0;

    const focusedStructureDrift =
        focusedBlockId != null
            ? (structureDriftByBlockId[focusedBlockId] ?? [])
            : [];

    return (
        <section
            className={PLANNING_SHELL_SECTION_CLASS}
            data-testid="planning-explore-shell"
        >
            {activePlan ? (
                <div
                    id="planning-program-anchor"
                    className={cn(PLANNING_PROGRAM_SUMMARY_STACK, "scroll-mt-24")}
                >
                    {showOtherPlansAction && onOpenOtherPlans ? (
                        <div className={PLANNING_PLANS_HISTORY_TRIGGER_ROW}>
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                className={PLANNING_PLANS_HISTORY_TRIGGER}
                                data-testid="planning-open-plans-history"
                                onClick={onOpenOtherPlans}
                            >
                                <ChevronDown className="size-3.5" aria-hidden />
                                Historial
                            </Button>
                        </div>
                    ) : null}
                    <PlanningProgramSummaryCard
                        plan={activePlan}
                        phaseCount={blocks.length}
                        trainingFrequencyLabel={trainingFrequencyLabel}
                    />
                </div>
            ) : null}

            {activePlan && blocks.length === 0 ? (
                <PeriodBlockEmptyCallout
                    primaryText={PLANNING_NO_PHASES_CALLOUT_PRIMARY}
                    secondaryText={PLANNING_NO_PHASES_CALLOUT_SECONDARY}
                    clientId={clientId ?? activePlan?.client_id ?? undefined}
                    action={
                        showAddPhaseCard ? (
                            <Button
                                type="button"
                                variant="outline-primary"
                                size="sm"
                                data-testid="planning-add-first-phase"
                                onClick={onAddPhase}
                            >
                                Añadir primera fase
                            </Button>
                        ) : undefined
                    }
                />
            ) : null}

            {showBlocksRow ? (
                <div className={PLANNING_EXPLORE_BLOCKS_ROW} data-testid="planning-explore-blocks-row">
                    {blocks.map((block) => (
                        <div key={block.id} className="shrink-0 snap-start">
                            <PeriodBlockCard
                                block={block}
                                catalog={catalog}
                                sessions={sessionsByBlock.get(block.id) ?? []}
                                onEdit={onEditBlock}
                                onViewWeeks={onViewWeeks}
                                onDelete={onDeleteBlock}
                                onCreateSessionForBlock={onCreateSessionForBlock}
                                isFocused={focusedBlockId === block.id}
                                onSelectFocus={onFocusBlock}
                                volumeIntensityContext={buildVolumeContext(
                                    block.volume_level,
                                    block.intensity_level,
                                )}
                                volumeIntensityPhase={volumeIntensityPhase}
                                structureDriftCount={
                                    structureDriftByBlockId[block.id]?.length ?? 0
                                }
                                structureCoverageIncomplete={
                                    structureCoverageIncomplete &&
                                    structureCoverageBlockId === block.id
                                }
                                structureCoverageWeeklyStructurePath={
                                    structureCoverageIncomplete &&
                                    structureCoverageBlockId === block.id
                                        ? structureCoverageWeeklyStructurePath
                                        : null
                                }
                            />
                        </div>
                    ))}
                    {showAddPhaseCard ? (
                        <div className="shrink-0 snap-start">
                            <PeriodBlockAddPhaseCard
                                onAddPhase={onAddPhase}
                                suggestedStartDate={suggestedPhaseStartDate}
                            />
                        </div>
                    ) : null}
                </div>
            ) : null}

            <PlanningShellBodyLayout
                variant="createWhen"
                main={
                    <div
                        id="planning-calendar-section"
                        data-testid="planning-calendar-section"
                        className="min-w-0 scroll-mt-24 outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        tabIndex={-1}
                        aria-label="Calendario de periodización"
                    >
                        <PeriodizationCalendar
                            currentMonth={calMonth}
                            onMonthChange={onMonthChange}
                            blocks={blocks}
                            focusedBlockId={focusedBlockId}
                            planStartDate={planStartDate}
                            planEndDate={planEndDate}
                            sessionDates={sessionDates}
                            exceptionDates={exceptionDates}
                            structurePendingDates={structurePendingDates}
                            formState={calendarFormState}
                            onDayClick={onDayClick}
                            onDayRightClick={onDayRightClick}
                            habitualTrainingDays={habitualTrainingDays}
                        />
                    </div>
                }
                sidebar={
                    <div className={PLANNING_SHELL_PANEL_STACK}>
                        <BlockCalendarRangeHint
                            formPhase={hintFormPhase}
                            startDate={
                                isPickingPhaseRange ? calendarFormState.startDate : null
                            }
                            endDate={
                                isPickingPhaseRange ? calendarFormState.endDate : null
                            }
                            weekCount={isPickingPhaseRange ? weekCount : null}
                            onContinue={
                                isPickingPhaseRange && hintFormPhase === "rangeComplete"
                                    ? onContinueRange
                                    : undefined
                            }
                            canContinue={canContinueRange}
                            continueDisabledReason={continueRangeDisabledReason}
                        />
                        {focusedStructureDrift.length > 0 ? (
                            <PeriodBlockStructureDriftCallout
                                sessions={focusedStructureDrift}
                            />
                        ) : null}
                    </div>
                }
            />
        </section>
    );
};
