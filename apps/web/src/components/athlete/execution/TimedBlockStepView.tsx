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
import { AthleteAmrapRoundsLogger } from "./AthleteAmrapRoundsLogger";
import { AthleteRunBlockTimer } from "./AthleteRunBlockTimer";
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
    blockTimer: UseAthleteBlockTimerResult;
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
    blockTimer,
    restPhase,
    showLogger = true,
    onViewTechnique,
    injuryConflicts,
    sessionReadyToFinish = false,
}) => {
    const isDoingPhase = restPhase === "doing";
    const isLoggingRest = restPhase === "logging_rest";
    const isAmrap = groupContext.groupKind === "amrap";
    const badgeLabel = groupContext.groupBadgeLabel ?? groupContext.sectionLabel;
    const roundLabel =
        groupContext.roundLabel ??
        (runStep.roundIndex != null && runStep.roundTotal != null
            ? `Ronda ${runStep.roundIndex} de ${runStep.roundTotal}`
            : "Bloque");

    const loggingSummaryLabel = `${badgeLabel} · ${roundLabel}`;

    const slotMeta = useMemo<GroupContextSlotMeta[]>(
        () =>
            runStep.slots?.map((slot) => ({
                exerciseId: slot.exerciseId,
                videoUrl: null,
                instruction: null,
            })) ?? [],
        [runStep.slots]
    );

    const injuryAlerts = useMemo(() => {
        if (!runStep.slots?.length || !injuryConflicts?.size) return [];
        const seen = new Set<string>();
        const rows: Array<{
            key: string;
            exerciseName: string;
            alert: InjuryAlert;
            onConsultTrainer: () => void;
        }> = [];

        for (const slot of runStep.slots) {
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
    }, [injuryConflicts, runStep.slots]);

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

            {showLogger && runStep.slots?.length ? (
                <div className={`space-y-2 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
                    {isLoggingRest ? (
                        <p className={ATHLETE_RUN_LOGGER_SECTION_LABEL}>
                            {isAmrap ? "Registro AMRAP" : "Registro de ronda"}
                        </p>
                    ) : null}

                    {isAmrap ? (
                        <AthleteAmrapRoundsLogger
                            rounds={amrapRounds}
                            targetRounds={runStep.roundTotal}
                            onRoundsChange={onAmrapRoundsChange}
                        />
                    ) : null}

                    <AthleteMultiSlotLogger
                        slots={runStep.slots}
                        slotLogs={slotLogs}
                        onSlotChange={onSlotChange}
                        roundRpe={roundRpe}
                        onRoundRpeChange={onRoundRpeChange}
                    />
                </div>
            ) : null}
        </div>
    );
};
