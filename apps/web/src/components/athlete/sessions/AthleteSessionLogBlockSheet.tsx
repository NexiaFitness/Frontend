/**
 * AthleteSessionLogBlockSheet.tsx — Sheet registro al final por bloque (FE-3).
 * @author Frontend Team
 * @since v8.3.0
 */

import React, { useMemo } from "react";
import { Button } from "@/components/ui/buttons";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import {
    AthleteAmrapResultLogger,
    AthleteDropsetBatchLogger,
    AthleteEmomCompletionReview,
    AthleteMultiSlotLogger,
    AthleteSetInputLogger,
    type SlotLogValues,
} from "@/components/athlete/logging";
import { AthleteForTimeCompletionReview } from "@/components/athlete/execution/AthleteForTimeCompletionReview";
import type {
    AthleteSessionLogBlockDraft,
    AthleteSessionLogBlockModel,
} from "@nexia/shared/utils/athlete/athleteSessionLogUtils";
import { runStepToFlatExercise } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    createSeriesWeightAutofillStore,
    rememberSeriesWeightAutofill,
    resolveInheritedLogSheetWeight,
} from "@nexia/shared/utils/athlete/athleteLoggingUtils";
import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AthleteRunExerciseNoteField } from "@/components/athlete/execution/AthleteRunExerciseNoteField";

export interface AthleteSessionLogBlockSheetProps {
    isOpen: boolean;
    block: AthleteSessionLogBlockModel | null;
    draft: AthleteSessionLogBlockDraft | null;
    onDraftChange: (draft: AthleteSessionLogBlockDraft) => void;
    onClose: () => void;
    onSave: () => void;
    onMarkNotPerformed: () => void;
    isSaving: boolean;
    errorMessage: string | null;
    isOnline: boolean;
}

export const AthleteSessionLogBlockSheet: React.FC<AthleteSessionLogBlockSheetProps> = ({
    isOpen,
    block,
    draft,
    onDraftChange,
    onClose,
    onSave,
    onMarkNotPerformed,
    isSaving,
    errorMessage,
    isOnline,
}) => {
    const autofillRef = useRef(createSeriesWeightAutofillStore());

    const title = block?.blockTypeName ?? "Registrar bloque";

    const timedStep = useMemo(
        () => block?.steps.find((s) => s.kind === "timed_block") ?? null,
        [block?.steps]
    );

    const noteSlotIds = useMemo(() => {
        if (!block) return [];
        const ids = new Set<number>();
        for (const step of block.steps) {
            if (step.groupKind === "emom") continue;
            if (step.blockExerciseId) ids.add(step.blockExerciseId);
            for (const slot of step.slots ?? []) {
                ids.add(slot.blockExerciseId);
            }
        }
        return [...ids];
    }, [block]);

    const handleWeightChange = useCallback(
        (stepKey: string, exerciseScope: ReturnType<typeof runStepToFlatExercise>, value: number) => {
            if (!draft) return;
            rememberSeriesWeightAutofill(autofillRef.current, exerciseScope, value);
            const nextSets = draft.singleSets.map((row) => {
                if (row.stepKey !== stepKey) return row;
                return { ...row, weight: value };
            });
            onDraftChange({ ...draft, singleSets: nextSets });
        },
        [draft, onDraftChange]
    );

    if (!block || !draft) {
        return (
            <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
                <p className="text-sm text-muted-foreground">Cargando bloque…</p>
            </BottomSheet>
        );
    }

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={
                !isOnline
                    ? "Sin conexión — se enviará al reconectar."
                    : "Guarda cuando termines este bloque."
            }
            footer={
                <div className="flex flex-col gap-2">
                    <Button
                        variant="primary"
                        className={ATHLETE_PRIMARY_CTA}
                        onClick={() => void onSave()}
                        isLoading={isSaving}
                        disabled={isSaving || !draft}
                    >
                        Guardar bloque
                    </Button>
                    {block.hasRegisterableSteps ? (
                        <Button
                            variant="secondary"
                            className="min-h-touch-athlete w-full"
                            onClick={() => void onMarkNotPerformed()}
                            disabled={isSaving}
                        >
                            No lo hice (bloque)
                        </Button>
                    ) : null}
                    {errorMessage ? (
                        <p className="text-center text-sm text-destructive" role="alert">
                            {errorMessage}
                        </p>
                    ) : null}
                </div>
            }
        >
            <div className="space-y-4 px-1 pb-2">
                {!block.hasRegisterableSteps ? (
                    <div className="flex gap-2">
                        <Button
                            variant={draft.mobilityDone === true ? "primary" : "secondary"}
                            className="min-h-touch-athlete flex-1"
                            onClick={() =>
                                onDraftChange({ ...draft, mobilityDone: true })
                            }
                        >
                            Hecho
                        </Button>
                        <Button
                            variant={draft.mobilityDone === false ? "primary" : "secondary"}
                            className="min-h-touch-athlete flex-1"
                            onClick={() =>
                                onDraftChange({ ...draft, mobilityDone: false })
                            }
                        >
                            No hecho
                        </Button>
                    </div>
                ) : null}

                {draft.singleSets.map((row) => {
                    const step = block.steps.find((s) => s.stepKey === row.stepKey);
                    if (!step) return null;
                    const flat = runStepToFlatExercise(step);
                    const weight = resolveInheritedLogSheetWeight({
                        store: autofillRef.current,
                        scope: flat,
                        setIndex: flat.setIndex,
                        skipped: row.skipped,
                        draftWeight: row.weight,
                    });

                    return (
                        <div
                            key={row.stepKey}
                            className={cn(
                                "space-y-2 rounded-xl border border-border/60 p-3",
                                row.skipped && "opacity-70 bg-muted/30"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">
                                    {step.exerciseName} · {step.setLabel}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto min-h-0 shrink-0 px-2 py-1 text-xs text-muted-foreground"
                                    onClick={() =>
                                        onDraftChange({
                                            ...draft,
                                            singleSets: draft.singleSets.map((s) =>
                                                s.stepKey === row.stepKey
                                                    ? { ...s, skipped: !s.skipped }
                                                    : s
                                            ),
                                        })
                                    }
                                >
                                    {row.skipped ? "Deshacer" : "No lo hice"}
                                </Button>
                            </div>
                            {!row.skipped ? (
                                <AthleteSetInputLogger
                                    inputMode={step.inputMode}
                                    weight={weight}
                                    plannedWeight={step.plannedWeight}
                                    reps={row.reps}
                                    onWeightChange={(v) => handleWeightChange(row.stepKey, flat, v)}
                                    onRepsChange={(reps) =>
                                        onDraftChange({
                                            ...draft,
                                            singleSets: draft.singleSets.map((s) =>
                                                s.stepKey === row.stepKey ? { ...s, reps } : s
                                            ),
                                        })
                                    }
                                    showRpe={false}
                                />
                            ) : (
                                <p className="text-xs text-muted-foreground">Marcado como no realizado.</p>
                            )}
                        </div>
                    );
                })}

                {draft.groupRounds.map((round) => {
                    const step = block.steps.find((s) => s.stepKey === round.stepKey);
                    if (!step?.slots?.length) return null;
                    const slotLogs = round.slotLogs as Record<string, SlotLogValues>;
                    return (
                        <div
                            key={round.stepKey}
                            className={cn(
                                "space-y-2 rounded-xl border border-border/60 p-3",
                                round.skipped && "opacity-70 bg-muted/30"
                            )}
                        >
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto min-h-0 px-2 py-1 text-xs text-muted-foreground"
                                    onClick={() =>
                                        onDraftChange({
                                            ...draft,
                                            groupRounds: draft.groupRounds.map((r) =>
                                                r.stepKey === round.stepKey
                                                    ? { ...r, skipped: !r.skipped }
                                                    : r
                                            ),
                                        })
                                    }
                                >
                                    {round.skipped ? "Deshacer" : "No lo hice (ronda)"}
                                </Button>
                            </div>
                            {!round.skipped ? (
                                <AthleteMultiSlotLogger
                                    slots={step.slots}
                                    slotLogs={slotLogs}
                                    onSlotChange={(slotKey, patch) =>
                                        onDraftChange({
                                            ...draft,
                                            groupRounds: draft.groupRounds.map((r) =>
                                                r.stepKey === round.stepKey
                                                    ? {
                                                          ...r,
                                                          slotLogs: {
                                                              ...r.slotLogs,
                                                              [slotKey]: {
                                                                  ...r.slotLogs[slotKey],
                                                                  ...patch,
                                                              },
                                                          },
                                                      }
                                                    : r
                                            ),
                                        })
                                    }
                                    roundRpe={null}
                                    onRoundRpeChange={() => undefined}
                                />
                            ) : (
                                <p className="text-xs text-muted-foreground">Ronda no realizada.</p>
                            )}
                        </div>
                    );
                })}

                {draft.dropsetRounds.map((round) => {
                    const step = block.steps.find((s) => s.stepKey === round.stepKey);
                    if (!step?.slots?.length) return null;
                    return (
                        <div
                            key={round.stepKey}
                            className={cn(
                                "space-y-2 rounded-xl border border-border/60 p-3",
                                round.skipped && "opacity-70 bg-muted/30"
                            )}
                        >
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto min-h-0 px-2 py-1 text-xs text-muted-foreground"
                                    onClick={() =>
                                        onDraftChange({
                                            ...draft,
                                            dropsetRounds: draft.dropsetRounds.map((r) =>
                                                r.stepKey === round.stepKey
                                                    ? { ...r, skipped: !r.skipped }
                                                    : r
                                            ),
                                        })
                                    }
                                >
                                    {round.skipped ? "Deshacer" : "No lo hice (ronda)"}
                                </Button>
                            </div>
                            {!round.skipped ? (
                                <AthleteDropsetBatchLogger
                                    slots={step.slots}
                                    slotLogs={round.slotLogs as Record<string, SlotLogValues>}
                                    onSlotChange={(slotKey, patch) =>
                                        onDraftChange({
                                            ...draft,
                                            dropsetRounds: draft.dropsetRounds.map((r) =>
                                                r.stepKey === round.stepKey
                                                    ? {
                                                          ...r,
                                                          slotLogs: {
                                                              ...r.slotLogs,
                                                              [slotKey]: {
                                                                  ...r.slotLogs[slotKey],
                                                                  ...patch,
                                                              },
                                                          },
                                                      }
                                                    : r
                                            ),
                                        })
                                    }
                                    roundRpe={null}
                                    onRoundRpeChange={() => undefined}
                                />
                            ) : (
                                <p className="text-xs text-muted-foreground">Ronda no realizada.</p>
                            )}
                        </div>
                    );
                })}

                {draft.timed && timedStep ? (
                    <>
                        {draft.timed.groupKind === "amrap" && timedStep.slots ? (
                            <AthleteAmrapResultLogger
                                slots={timedStep.slots}
                                targetRounds={null}
                                fullRounds={draft.timed.amrapRounds}
                                onFullRoundsChange={(fullRounds) =>
                                    onDraftChange({
                                        ...draft,
                                        timed: { ...draft.timed!, amrapRounds: fullRounds },
                                    })
                                }
                                partialReps={draft.timed.amrapPartialReps}
                                onPartialRepsChange={(stepKey, value) =>
                                    onDraftChange({
                                        ...draft,
                                        timed: {
                                            ...draft.timed!,
                                            amrapPartialReps: {
                                                ...draft.timed!.amrapPartialReps,
                                                [stepKey]: value,
                                            },
                                        },
                                    })
                                }
                            />
                        ) : null}
                        {draft.timed.groupKind === "emom" ? (
                            <AthleteEmomCompletionReview
                                intervals={timedStep.emomIntervals ?? []}
                                intervalSeconds={timedStep.intervalSeconds ?? null}
                                asPlanned={draft.timed.emomAsPlanned}
                                onAsPlannedChange={(value) =>
                                    onDraftChange({
                                        ...draft,
                                        timed: {
                                            ...draft.timed!,
                                            emomAsPlanned: value,
                                            emomAthleteNote: value
                                                ? ""
                                                : draft.timed!.emomAthleteNote,
                                        },
                                    })
                                }
                                athleteNote={draft.timed.emomAthleteNote}
                                onAthleteNoteChange={(note) =>
                                    onDraftChange({
                                        ...draft,
                                        timed: { ...draft.timed!, emomAthleteNote: note },
                                    })
                                }
                                roundRpe={null}
                                onRoundRpeChange={() => undefined}
                            />
                        ) : null}
                        {draft.timed.groupKind === "for_time" ? (
                            <AthleteForTimeCompletionReview
                                totalSeconds={draft.timed.forTimeTotalSeconds}
                                onTotalSecondsChange={(totalSeconds) =>
                                    onDraftChange({
                                        ...draft,
                                        timed: { ...draft.timed!, forTimeTotalSeconds: totalSeconds },
                                    })
                                }
                                roundRpe={null}
                                onRoundRpeChange={() => undefined}
                            />
                        ) : null}
                    </>
                ) : null}

                {draft && noteSlotIds.length > 0 ? (
                    <div className="space-y-3 border-t border-border/60 pt-4">
                        {noteSlotIds.map((slotId) => (
                            <AthleteRunExerciseNoteField
                                key={slotId}
                                value={draft.exerciseNotes?.[slotId] ?? ""}
                                onChange={(value) =>
                                    onDraftChange({
                                        ...draft,
                                        exerciseNotes: {
                                            ...(draft.exerciseNotes ?? {}),
                                            [slotId]: value,
                                        },
                                    })
                                }
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </BottomSheet>
    );
};
