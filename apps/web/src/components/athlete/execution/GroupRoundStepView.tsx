/**
 * GroupRoundStepView.tsx — Shell superset/giant/dropset por ronda (V05 B.2).
 */

import React, { useMemo } from "react";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { AthleteRunGroupContextView } from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import type { InjuryAlert } from "@nexia/shared/types/injuryAlert";
import type { AthleteRunRestPhase } from "@/hooks/athlete/useAthleteRunRestFlow";
import { AthleteExerciseInjuryAlert } from "@/components/athlete/AthleteExerciseInjuryAlert";
import { AthleteRunGroupHero } from "./AthleteRunGroupHero";
import {
    AthleteRunGroupContextCard,
    type GroupContextSlotMeta,
} from "./AthleteRunGroupContextCard";
import {
    AthleteMultiSlotLogger,
    type SlotLogValues,
} from "./AthleteMultiSlotLogger";
import { AthleteDropsetFunnelCard } from "./AthleteDropsetFunnelCard";
import { AthleteDropsetBatchLogger } from "./AthleteDropsetBatchLogger";
import { AthleteRunSessionReadyCard } from "./AthleteRunSessionReadyCard";
import { AthleteRunProgressHeader } from "./AthleteRunProgressHeader";
import { AthleteRunLoggingSummary } from "./AthleteRunLoggingSummary";
import type { AthleteExerciseTechniqueTarget } from "./athleteExerciseTechniqueUtils";
import { ATHLETE_RUN_LOGGER_REVEAL, ATHLETE_RUN_LOGGER_SECTION_LABEL } from "./athleteRunPresentation";

export interface GroupRoundStepViewProps {
    runStep: AthleteRunStep;
    step: number;
    totalSteps: number;
    groupContext: AthleteRunGroupContextView;
    slotLogs: Record<string, SlotLogValues>;
    onSlotChange: (slotKey: string, patch: Partial<SlotLogValues>) => void;
    restPhase: AthleteRunRestPhase;
    showLogger?: boolean;
    onViewTechnique?: (target: AthleteExerciseTechniqueTarget) => void;
    injuryConflicts?: Map<
        number,
        { alert: InjuryAlert; onConsultTrainer: () => void }
    >;
    sessionReadyToFinish?: boolean;
}

export const GroupRoundStepView: React.FC<GroupRoundStepViewProps> = ({
    runStep,
    step,
    totalSteps,
    groupContext,
    slotLogs,
    onSlotChange,
    restPhase,
    showLogger = true,
    onViewTechnique,
    injuryConflicts,
    sessionReadyToFinish = false,
}) => {
    const isDoingPhase = restPhase === "doing";
    const isLoggingRest = restPhase === "logging_rest";
    const isDropset = groupContext.groupKind === "dropset";
    const badgeLabel = groupContext.groupBadgeLabel ?? groupContext.sectionLabel;
    const roundLabel =
        groupContext.roundLabel ??
        (runStep.roundIndex != null && runStep.roundTotal != null
            ? `Ronda ${runStep.roundIndex} de ${runStep.roundTotal}`
            : "Ronda");

    const loggingSummaryLabel = `${badgeLabel} · ${roundLabel}`;

    const dropsetTechniqueTarget = useMemo((): AthleteExerciseTechniqueTarget | null => {
        const first = runStep.slots?.[0];
        if (!first) return null;
        return {
            exerciseId: first.exerciseId,
            exerciseName: first.exerciseName,
            videoUrl: null,
            instruction: runStep.instruction || null,
        };
    }, [runStep.instruction, runStep.slots]);

    const slotMeta = useMemo<GroupContextSlotMeta[]>(
        () =>
            runStep.slots?.map((slot) => ({
                exerciseId: slot.exerciseId,
                videoUrl: null,
                instruction: runStep.instruction || null,
            })) ?? [],
        [runStep.instruction, runStep.slots]
    );

    if (sessionReadyToFinish && isDoingPhase) {
        return <AthleteRunSessionReadyCard />;
    }

    return (
        <div className="space-y-4">
            <AthleteRunProgressHeader
                step={step}
                totalSteps={totalSteps}
                blockName={runStep.blockName}
            />

            {isDoingPhase ? (
                    <div className="space-y-4">
                        <AthleteRunGroupHero badgeLabel={badgeLabel} roundLabel={roundLabel} />

                        {isDropset && runStep.slots?.length ? (
                            <AthleteDropsetFunnelCard
                                slots={runStep.slots}
                                techniqueTarget={dropsetTechniqueTarget}
                                onViewTechnique={onViewTechnique}
                            />
                        ) : (
                            <AthleteRunGroupContextCard
                                context={groupContext}
                                slotMeta={slotMeta}
                                onViewTechnique={onViewTechnique}
                            />
                        )}

                        {runStep.slots?.map((slot) => {
                            const conflict = injuryConflicts?.get(slot.exerciseId);
                            if (!conflict) return null;
                            return (
                                <AthleteExerciseInjuryAlert
                                    key={`injury-${slot.exerciseId}`}
                                    exerciseName={slot.exerciseName}
                                    alert={conflict.alert}
                                    onConsultTrainer={conflict.onConsultTrainer}
                                    compact
                                />
                            );
                        })}
                </div>
            ) : null}

            {isLoggingRest ? (
                <AthleteRunLoggingSummary label={loggingSummaryLabel} />
            ) : null}

            {showLogger && runStep.slots?.length ? (
                <div className={`space-y-2 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
                    {isLoggingRest ? (
                        <p className={ATHLETE_RUN_LOGGER_SECTION_LABEL}>
                            {isDropset ? "Registro de dropset" : "Registro de ronda"}
                        </p>
                    ) : null}
                    {isDropset ? (
                        <AthleteDropsetBatchLogger
                            slots={runStep.slots}
                            slotLogs={slotLogs}
                            onSlotChange={onSlotChange}
                        />
                    ) : (
                        <AthleteMultiSlotLogger
                            slots={runStep.slots}
                            slotLogs={slotLogs}
                            onSlotChange={onSlotChange}
                        />
                    )}
                </div>
            ) : null}
        </div>
    );
};
