/**
 * TimedBlockStepView.tsx — Shell AMRAP / EMOM / for_time (V05 Fase C).
 */

import React, { useMemo } from "react";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { AthleteRunGroupContextView } from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import type { InjuryAlert } from "@nexia/shared/types/injuryAlert";
import type { AthleteRunRestPhase } from "@/hooks/athlete/useAthleteRunRestFlow";
import type { UseAthleteBlockTimerResult } from "@/hooks/athlete/useAthleteBlockTimer";
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
import { AthleteAmrapResultLogger } from "./AthleteAmrapResultLogger";
import { AthleteEmomCompletionReview } from "./AthleteEmomCompletionReview";
import { AthleteRunBlockTimer } from "./AthleteRunBlockTimer";
import { AthleteRoundEffortSection } from "./AthleteRoundEffortSection";
import { AthleteRunSessionReadyCard } from "./AthleteRunSessionReadyCard";
import { AthleteRunProgressHeader } from "./AthleteRunProgressHeader";
import { AthleteRunLoggingSummary } from "./AthleteRunLoggingSummary";
import type { AthleteExerciseTechniqueTarget } from "./athleteExerciseTechniqueUtils";
import { ATHLETE_RUN_LOGGER_REVEAL, ATHLETE_RUN_LOGGER_SECTION_LABEL } from "./athleteRunPresentation";

export interface TimedBlockStepViewProps {
    runStep: AthleteRunStep;
    step: number;
    totalSteps: number;
    groupContext: AthleteRunGroupContextView;
    slotLogs: Record<string, SlotLogValues>;
    onSlotChange: (slotKey: string, patch: Partial<SlotLogValues>) => void;
    roundRpe: number | null;
    onRoundRpeChange: (value: number | null) => void;
    amrapRounds: number;
    onAmrapRoundsChange: (value: number) => void;
    amrapPartialReps: Record<string, number>;
    onAmrapPartialRepsChange: (stepKey: string, value: number) => void;
    amrapPartialOpen: boolean;
    onAmrapPartialOpenChange: (open: boolean) => void;
    emomAsPlanned: boolean | null;
    onEmomAsPlannedChange: (value: boolean) => void;
    emomOverrides: Record<string, Record<string, number>>;
    onEmomOverrideChange: (intervalKey: string, stepKey: string, value: number) => void;
    emomMinuteLabel: string | null;
    emomTechniqueSlots: import("@nexia/shared/utils/athlete/buildAthleteRunSteps").AthleteRunRoundSlot[];
    blockTimer: UseAthleteBlockTimerResult;
    blockWorkIsReady?: boolean;
    restPhase: AthleteRunRestPhase;
    showLogger?: boolean;
    onViewTechnique?: (target: AthleteExerciseTechniqueTarget) => void;
    injuryConflicts?: Map<
        number,
        { alert: InjuryAlert; onConsultTrainer: () => void }
    >;
    sessionReadyToFinish?: boolean;
}

export const TimedBlockStepView: React.FC<TimedBlockStepViewProps> = ({
    runStep,
    step,
    totalSteps,
    groupContext,
    slotLogs,
    onSlotChange,
    roundRpe,
    onRoundRpeChange,
    amrapRounds,
    onAmrapRoundsChange,
    amrapPartialReps,
    onAmrapPartialRepsChange,
    amrapPartialOpen,
    onAmrapPartialOpenChange,
    emomAsPlanned,
    onEmomAsPlannedChange,
    emomOverrides,
    onEmomOverrideChange,
    emomMinuteLabel,
    emomTechniqueSlots,
    blockTimer,
    blockWorkIsReady = false,
    restPhase,
    showLogger = true,
    onViewTechnique,
    injuryConflicts,
    sessionReadyToFinish = false,
}) => {
    const isDoingPhase = restPhase === "doing";
    const isLoggingRest = restPhase === "logging_rest";
    const isAmrap = groupContext.groupKind === "amrap";
    const isEmom = groupContext.groupKind === "emom";
    const badgeLabel = groupContext.groupBadgeLabel ?? groupContext.sectionLabel;
    const roundLabel =
        (isEmom && isDoingPhase && emomMinuteLabel) ||
        groupContext.roundLabel ||
        (runStep.roundIndex != null && runStep.roundTotal != null
            ? `Ronda ${runStep.roundIndex} de ${runStep.roundTotal}`
            : "Bloque");

    const loggingSummaryLabel = `${badgeLabel} · ${roundLabel}`;

    const slotMeta = useMemo<GroupContextSlotMeta[]>(
        () =>
            emomTechniqueSlots.map((slot) => ({
                exerciseId: slot.exerciseId,
                videoUrl: null,
                instruction: null,
            })),
        [emomTechniqueSlots]
    );

    const injuryAlerts = useMemo(() => {
        const emomSlots = runStep.emomIntervals?.flatMap((interval) => interval.slots) ?? runStep.slots ?? [];
        if (!emomSlots.length || !injuryConflicts?.size) return [];
        const seen = new Set<string>();
        const rows: Array<{
            key: string;
            exerciseName: string;
            alert: InjuryAlert;
            onConsultTrainer: () => void;
        }> = [];

        for (const slot of emomSlots) {
            const conflict = injuryConflicts.get(slot.exerciseId);
            if (!conflict) continue;
            const dedupeKey = `${conflict.alert.severity ?? ""}|${conflict.alert.message ?? ""}`;
            if (seen.has(dedupeKey)) continue;
            seen.add(dedupeKey);
            rows.push({
                key: `${dedupeKey}-${slot.exerciseId}`,
                exerciseName: slot.exerciseName,
                alert: conflict.alert,
                onConsultTrainer: conflict.onConsultTrainer,
            });
        }

        return rows;
    }, [injuryConflicts, runStep.emomIntervals, runStep.slots]);

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

                    <AthleteRunBlockTimer
                        groupKind={groupContext.groupKind}
                        displaySeconds={blockTimer.displaySeconds}
                        totalSeconds={blockTimer.totalSeconds}
                        isCountup={blockTimer.isCountup}
                        isExpired={blockTimer.isExpired}
                        isReady={blockWorkIsReady}
                    />

                    <AthleteRunGroupContextCard
                        context={groupContext}
                        slotMeta={slotMeta}
                        onViewTechnique={onViewTechnique}
                        suppressHeaderMeta
                    />

                    {injuryAlerts.map((row) => (
                        <AthleteExerciseInjuryAlert
                            key={row.key}
                            exerciseName={row.exerciseName}
                            alert={row.alert}
                            onConsultTrainer={row.onConsultTrainer}
                            compact
                        />
                    ))}
                </div>
            ) : null}

            {isLoggingRest ? (
                <AthleteRunLoggingSummary label={loggingSummaryLabel} />
            ) : null}

            {showLogger ? (
                <div className={`space-y-2 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
                    {isLoggingRest ? (
                        <p className={ATHLETE_RUN_LOGGER_SECTION_LABEL}>
                            {isAmrap ? "Registro AMRAP" : isEmom ? "Cierre EMOM" : "Registro de ronda"}
                        </p>
                    ) : null}

                    {isAmrap && runStep.slots?.length ? (
                        <>
                            <AthleteAmrapResultLogger
                                fullRounds={amrapRounds}
                                targetRounds={runStep.roundTotal}
                                onFullRoundsChange={onAmrapRoundsChange}
                                slots={runStep.slots}
                                partialReps={amrapPartialReps}
                                partialOpen={amrapPartialOpen}
                                onPartialOpenChange={onAmrapPartialOpenChange}
                                onPartialRepsChange={onAmrapPartialRepsChange}
                            />
                            <AthleteRoundEffortSection
                                variant="block"
                                value={roundRpe}
                                onChange={onRoundRpeChange}
                            />
                        </>
                    ) : null}

                    {isEmom && runStep.emomIntervals?.length ? (
                        <AthleteEmomCompletionReview
                            intervals={runStep.emomIntervals}
                            intervalSeconds={runStep.intervalSeconds}
                            asPlanned={emomAsPlanned}
                            onAsPlannedChange={onEmomAsPlannedChange}
                            overrides={emomOverrides}
                            onOverrideChange={onEmomOverrideChange}
                            roundRpe={roundRpe}
                            onRoundRpeChange={onRoundRpeChange}
                        />
                    ) : null}

                    {!isAmrap && !isEmom && runStep.slots?.length ? (
                        <AthleteMultiSlotLogger
                            slots={runStep.slots}
                            slotLogs={slotLogs}
                            onSlotChange={onSlotChange}
                            roundRpe={roundRpe}
                            onRoundRpeChange={onRoundRpeChange}
                        />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};
