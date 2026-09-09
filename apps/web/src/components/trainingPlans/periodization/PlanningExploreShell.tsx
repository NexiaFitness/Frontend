/**
 * PlanningExploreShell.tsx — Modo explore F5: chips + calendario + panel fase.
 */

import React from "react";
import { ArrowRight } from "lucide-react";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import type { VolumeIntensityContext } from "@nexia/shared";
import type { PeriodizationVolumeNominalPhase } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { PeriodizationCalendar } from "./PeriodizationCalendar";
import { PeriodBlockCard } from "./PeriodBlockCard";
import { PeriodBlockEmptyCallout } from "./PeriodBlockEmptyCallout";
import { PlanningActivePlanCard } from "./PlanningActivePlanCard";
import { PlanningPhaseChipStrip } from "./PlanningPhaseChipStrip";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";
import { formatProgramDurationLabel } from "./planningShellUtils";
import {
    PLANNING_EXPLORE_GRID_CLASS,
    PLANNING_FOOTER_ACTIONS_CLASS,
    PLANNING_PROGRAM_SUMMARY_CLASS,
    PLANNING_SHELL_SECTION_CLASS,
} from "./planningShellPresentation";

interface Props {
    blocks: PlanPeriodBlock[];
    catalog: PhysicalQuality[];
    selectedBlockId: number | null;
    sessionsByBlock: Map<number, TrainingSession[]>;
    activePlan?: ActivePlanByClientOut;
    planStartDate?: string | null;
    planEndDate?: string | null;
    trainingFrequencyLabel: string | null;
    calMonth: Date;
    onMonthChange: (date: Date) => void;
    sessionDates: Set<string>;
    exceptionDates: Set<string>;
    formState: PeriodBlockFormState;
    habitualTrainingDays?: readonly string[] | null;
    onDayClick: (dateStr: string) => void;
    onDayRightClick?: (dateStr: string) => void;
    onSelectBlock: (blockId: number) => void;
    onAddPhase: () => void;
    onEditBlock: (block: PlanPeriodBlock) => void;
    onViewWeeks: (block: PlanPeriodBlock) => void;
    onDeleteBlock: (id: number, label: string) => void;
    onCreateSessionForBlock: (block: PlanPeriodBlock) => void;
    onViewAnalytics: () => void;
    buildVolumeContext: (
        volumeLevel: number | null | undefined,
        intensityLevel: number | null | undefined,
    ) => VolumeIntensityContext | null;
    volumeIntensityPhase: PeriodizationVolumeNominalPhase;
}

export const PlanningExploreShell: React.FC<Props> = ({
    blocks,
    catalog,
    selectedBlockId,
    sessionsByBlock,
    activePlan,
    planStartDate,
    planEndDate,
    trainingFrequencyLabel,
    calMonth,
    onMonthChange,
    sessionDates,
    exceptionDates,
    formState,
    habitualTrainingDays,
    onDayClick,
    onDayRightClick,
    onSelectBlock,
    onAddPhase,
    onEditBlock,
    onViewWeeks,
    onDeleteBlock,
    onCreateSessionForBlock,
    onViewAnalytics,
    buildVolumeContext,
    volumeIntensityPhase,
}) => {
    const selectedBlock =
        selectedBlockId != null
            ? blocks.find((block) => block.id === selectedBlockId)
            : undefined;

    const programDuration =
        planStartDate && planEndDate
            ? formatProgramDurationLabel(planStartDate, planEndDate)
            : null;

    return (
        <section
            className={PLANNING_SHELL_SECTION_CLASS}
            data-testid="planning-explore-shell"
        >
            <div className="space-y-3">
                <PageTitle titleAs="h3" title="Planificación" />
                {(programDuration || blocks.length > 0 || trainingFrequencyLabel) && (
                    <p className={PLANNING_PROGRAM_SUMMARY_CLASS}>
                        Programa actual
                        {programDuration ? ` · ${programDuration}` : ""}
                        {blocks.length > 0
                            ? ` · ${blocks.length} fase${blocks.length === 1 ? "" : "s"}`
                            : ""}
                        {trainingFrequencyLabel
                            ? ` · ${trainingFrequencyLabel}`
                            : ""}
                    </p>
                )}
                {blocks.length > 0 ? (
                    <PlanningPhaseChipStrip
                        blocks={blocks}
                        selectedBlockId={selectedBlockId}
                        onSelectBlock={onSelectBlock}
                        onAddPhase={onAddPhase}
                    />
                ) : null}
            </div>

            <div className={PLANNING_EXPLORE_GRID_CLASS}>
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
                        onDayRightClick={onDayRightClick}
                        habitualTrainingDays={habitualTrainingDays}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                    {activePlan ? (
                        <PlanningActivePlanCard activePlan={activePlan} />
                    ) : null}

                    {selectedBlock ? (
                        <PeriodBlockCard
                            block={selectedBlock}
                            catalog={catalog}
                            sessions={sessionsByBlock.get(selectedBlock.id) ?? []}
                            onEdit={onEditBlock}
                            onViewWeeks={onViewWeeks}
                            onDelete={onDeleteBlock}
                            onCreateSessionForBlock={onCreateSessionForBlock}
                            volumeIntensityContext={buildVolumeContext(
                                selectedBlock.volume_level,
                                selectedBlock.intensity_level,
                            )}
                            volumeIntensityPhase={volumeIntensityPhase}
                        />
                    ) : blocks.length === 0 ? (
                        <PeriodBlockEmptyCallout
                            primaryText="No hay bloques de periodización configurados."
                            secondaryText="Añade una fase con el calendario para empezar a planificar."
                            action={
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    data-testid="planning-add-phase-empty"
                                    onClick={onAddPhase}
                                >
                                    Añadir fase
                                </Button>
                            }
                        />
                    ) : (
                        <PeriodBlockEmptyCallout
                            primaryText="Selecciona una fase"
                            secondaryText="Usa los chips o haz clic en un día del calendario para ver el detalle de la fase."
                        />
                    )}
                </div>
            </div>

            <div className={PLANNING_FOOTER_ACTIONS_CLASS}>
                {blocks.length > 0 ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-testid="planning-view-analytics"
                        onClick={onViewAnalytics}
                    >
                        Ver análisis
                        <ArrowRight className="ml-1 size-4" aria-hidden />
                    </Button>
                ) : null}
            </div>
        </section>
    );
};
