/**
 * useAthleteSessionLog.ts — Registro al final FE-3 (sheet por bloque, BE-1/BE-2, offline).
 * @author Frontend Team
 * @since v8.3.0
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AthleteRunBlockStatus } from "@nexia/shared/types/athleteRunProgress";
import {
    useGetAthleteRunProgressQuery,
    usePostAthleteRunNotPerformedMutation,
    usePostAthleteRunExecutionMutation,
    usePostAthleteRunTimedResultMutation,
    usePutAthleteExerciseNoteMutation,
} from "@nexia/shared/api/athleteApi";
import { queueExerciseNoteLog } from "@nexia/shared/offline/athleteSessionSync";
import { useUpdateTrainingSessionMutation } from "@nexia/shared/api/trainingSessionsApi";
import type { AthleteRunExecutionCreate, AthleteRunTimedResultCreate } from "@nexia/shared/types/athleteRunReference";
import type { SessionBlockExerciseUpdate } from "@nexia/shared/types/sessionProgramming";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import {
    REGISTRATION_WINDOW_SYNC_MESSAGE,
    useOfflineSessionLog,
} from "@nexia/shared/hooks/offline";
import type { SessionStructureView } from "@nexia/shared/sessionProgramming/sessionBlockView";
import {
    buildBlockSavePayloads,
    buildInitialBlockDraft,
    buildSessionLogBlocks,
    countPendingLogBlocks,
    validateBlockDraft,
    type AthleteSessionLogBlockDraft,
    type AthleteSessionLogBlockModel,
} from "@nexia/shared/utils/athlete/athleteSessionLogUtils";
import { flattenRunStepsToFlatExercises, buildAthleteRunSteps } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { flattenAthleteExercises } from "@nexia/shared/utils/athlete/athleteSessionUtils";

export interface UseAthleteSessionLogOptions {
    sessionId: number;
    view: SessionStructureView;
    sessionName: string;
    enabled?: boolean;
}

export function useAthleteSessionLog({
    sessionId,
    view,
    sessionName,
    enabled = true,
}: UseAthleteSessionLogOptions) {
    const { clientId } = useAthleteContext();
    const [logMode, setLogMode] = useState(false);
    const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
    const [blockDraft, setBlockDraft] = useState<AthleteSessionLogBlockDraft | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isSavingBlock, setIsSavingBlock] = useState(false);
    const [optimisticBlockStatus, setOptimisticBlockStatus] = useState<
        Map<number, AthleteRunBlockStatus>
    >(() => new Map());

    const {
        data: progress,
        isLoading: isProgressLoading,
        isFetching: isProgressFetching,
        refetch: refetchProgress,
    } = useGetAthleteRunProgressQuery(sessionId, {
        skip: !sessionId || !enabled,
    });

    const [postExecution] = usePostAthleteRunExecutionMutation();
    const [postTimedResult] = usePostAthleteRunTimedResultMutation();
    const [postNotPerformed] = usePostAthleteRunNotPerformedMutation();
    const [putExerciseNote] = usePutAthleteExerciseNoteMutation();
    const [updateSession] = useUpdateTrainingSessionMutation();

    const runSteps = useMemo(() => buildAthleteRunSteps(view), [view]);
    const flatExercises = useMemo(
        () =>
            flattenAthleteExercises(view).length > 0
                ? flattenAthleteExercises(view)
                : flattenRunStepsToFlatExercises(runSteps),
        [view, runSteps]
    );

    const offlineAdapter = useMemo(
        () => ({
            updateExercise: async (
                _blockExerciseId: number,
                _data: SessionBlockExerciseUpdate
            ) => {
                /* registro al final no usa legacy agregado */
            },
            completeSession: async (sid: number) => {
                await updateSession({ id: sid, body: { status: "completed" } }).unwrap();
            },
            postExecution: async (payload: AthleteRunExecutionCreate) => {
                await postExecution(payload).unwrap();
            },
            postTimedResult: async (payload: AthleteRunTimedResultCreate) => {
                await postTimedResult(payload).unwrap();
            },
            putExerciseNote: async (payload) => {
                await putExerciseNote(payload).unwrap();
            },
        }),
        [postExecution, postTimedResult, putExerciseNote, updateSession]
    );

    const {
        isOnline,
        pendingCount: syncPendingCount,
        registrationSyncBlocked,
        logExecution,
        logTimedResult,
        finishSession,
        refreshPendingCount,
    } = useOfflineSessionLog({
        sessionId,
        clientId,
        sessionName,
        flatExercises,
        adapter: offlineAdapter,
        onSynced: () => {
            void refetchProgress();
            setOptimisticBlockStatus(new Map());
        },
    });

    useEffect(() => {
        if (registrationSyncBlocked) {
            setSaveError(REGISTRATION_WINDOW_SYNC_MESSAGE);
        }
    }, [registrationSyncBlocked]);

    const baseLogBlocks = useMemo(
        () => buildSessionLogBlocks(view, progress),
        [view, progress]
    );

    const logBlocks = useMemo(
        () =>
            baseLogBlocks.map((block) => {
                const override = optimisticBlockStatus.get(block.sessionBlockId);
                if (!override || override === block.status) return block;
                return {
                    ...block,
                    status: override,
                    isPendingHighlight:
                        override === "pending" && block.hasRegisterableSteps,
                    summaryLine:
                        override === "registered" && !block.summaryLine
                            ? "Guardado · pendiente de sincronizar"
                            : block.summaryLine,
                };
            }),
        [baseLogBlocks, optimisticBlockStatus]
    );

    const pendingBlockCount = useMemo(() => countPendingLogBlocks(logBlocks), [logBlocks]);

    useEffect(() => {
        if (!progress?.blocks.length) return;
        setOptimisticBlockStatus((prev) => {
            if (prev.size === 0) return prev;
            const next = new Map(prev);
            for (const [blockId, status] of prev) {
                const server = progress.blocks.find((b) => b.session_block_id === blockId);
                if (server && server.status === status) {
                    next.delete(blockId);
                }
            }
            return next.size === prev.size ? prev : next;
        });
    }, [progress]);

    const activeBlock = useMemo(
        () => logBlocks.find((b) => b.sessionBlockId === activeBlockId) ?? null,
        [activeBlockId, logBlocks]
    );

    const openBlock = useCallback(
        (block: AthleteSessionLogBlockModel) => {
            setSaveError(null);
            setActiveBlockId(block.sessionBlockId);
            setBlockDraft(buildInitialBlockDraft(block, progress));
        },
        [progress]
    );

    const closeBlock = useCallback(() => {
        setActiveBlockId(null);
        setBlockDraft(null);
        setSaveError(null);
    }, []);

    const registrationEditable = progress?.registration_editable !== false;

    const enterLogMode = useCallback(() => {
        if (!registrationEditable) {
            setSaveError(
                "El plazo para registrar o editar esta sesión ha cerrado (máximo 7 días después)."
            );
            return;
        }
        setLogMode(true);
    }, [registrationEditable]);
    const exitLogMode = useCallback(() => {
        setLogMode(false);
        closeBlock();
    }, [closeBlock]);

    const saveActiveBlock = useCallback(async () => {
        if (!activeBlock || !blockDraft) return;
        if (!registrationEditable) {
            setSaveError(
                "El plazo para registrar o editar esta sesión ha cerrado (máximo 7 días después)."
            );
            return;
        }
        const validation = validateBlockDraft(activeBlock, blockDraft);
        if (validation) {
            setSaveError(validation);
            return;
        }

        setIsSavingBlock(true);
        setSaveError(null);
        try {
            const { executions, timed, exerciseNotes, notPerformedStepKeys, notPerformedSteps } =
                buildBlockSavePayloads(sessionId, activeBlock, blockDraft);

            const needsNotPerformedOnline =
                notPerformedStepKeys.length > 0 ||
                (!activeBlock.hasRegisterableSteps && blockDraft.mobilityDone === false);

            if (!isOnline && needsNotPerformedOnline) {
                setSaveError(
                    "«No realizado» necesita conexión. Guarda cargas offline y márcalo al reconectar."
                );
                return;
            }

            for (const payload of executions) {
                if (isOnline) {
                    await postExecution(payload).unwrap();
                } else {
                    await logExecution(payload);
                }
            }

            for (const notePayload of exerciseNotes) {
                if (isOnline) {
                    await putExerciseNote(notePayload).unwrap();
                } else {
                    await queueExerciseNoteLog({
                        sessionId,
                        blockExerciseId: notePayload.block_exercise_id,
                        payload: notePayload,
                    });
                }
            }

            if (timed) {
                if (isOnline) {
                    await postTimedResult(timed).unwrap();
                } else {
                    await logTimedResult(timed);
                }
            }

            if (isOnline) {
                for (const payload of notPerformedSteps) {
                    await postNotPerformed(payload).unwrap();
                }

                if (
                    !activeBlock.hasRegisterableSteps &&
                    blockDraft.mobilityDone === false
                ) {
                    await postNotPerformed({
                        training_session_id: sessionId,
                        scope: "block",
                        session_block_id: activeBlock.sessionBlockId,
                    }).unwrap();
                }
            }

            const savedOffline =
                !isOnline &&
                (executions.length > 0 || timed != null || exerciseNotes.length > 0);
            if (savedOffline) {
                setOptimisticBlockStatus((prev) => {
                    const next = new Map(prev);
                    next.set(
                        activeBlock.sessionBlockId,
                        notPerformedStepKeys.length > 0 &&
                            executions.length === 0 &&
                            !timed
                            ? "not_performed"
                            : "registered"
                    );
                    return next;
                });
            }

            if (isOnline) {
                await refetchProgress();
            }
            await refreshPendingCount();
            closeBlock();
        } catch {
            setSaveError("No se pudo guardar el bloque. Revisa la conexión e inténtalo de nuevo.");
        } finally {
            setIsSavingBlock(false);
        }
    }, [
        activeBlock,
        blockDraft,
        closeBlock,
        isOnline,
        logExecution,
        logTimedResult,
        postExecution,
        postNotPerformed,
        postTimedResult,
        putExerciseNote,
        refreshPendingCount,
        refetchProgress,
        registrationEditable,
        sessionId,
    ]);

    const markBlockNotPerformed = useCallback(async () => {
        if (!activeBlock) return;
        if (!isOnline) {
            setSaveError(
                "Marcar el bloque como «No realizado» requiere conexión. Inténtalo al reconectar."
            );
            return;
        }
        setIsSavingBlock(true);
        setSaveError(null);
        try {
            await postNotPerformed({
                training_session_id: sessionId,
                scope: "block",
                session_block_id: activeBlock.sessionBlockId,
            }).unwrap();
            await refetchProgress();
            closeBlock();
        } catch {
            setSaveError("No se pudo marcar el bloque.");
        } finally {
            setIsSavingBlock(false);
        }
    }, [activeBlock, closeBlock, isOnline, postNotPerformed, refetchProgress, sessionId]);

    const forceCompleteSession = useCallback(async () => {
        if (syncPendingCount > 0) {
            setSaveError(
                "Hay datos guardados en el móvil sin enviar. Conéctate y espera la sincronización."
            );
            return false;
        }
        setSaveError(null);
        try {
            if (isOnline) {
                await updateSession({ id: sessionId, body: { status: "completed" } }).unwrap();
            } else {
                await finishSession();
            }
            return true;
        } catch {
            setSaveError("No se pudo cerrar la sesión. Revisa la conexión e inténtalo de nuevo.");
            return false;
        }
    }, [finishSession, isOnline, sessionId, syncPendingCount, updateSession]);

    const completeSessionIfReady = useCallback(async () => {
        if (pendingBlockCount > 0 || syncPendingCount > 0) return false;
        if (!registrationEditable) {
            setSaveError(
                "El plazo para registrar o editar esta sesión ha cerrado (máximo 7 días después)."
            );
            return false;
        }
        setSaveError(null);
        try {
            if (isOnline) {
                await updateSession({ id: sessionId, body: { status: "completed" } }).unwrap();
            } else {
                await finishSession();
            }
            return true;
        } catch {
            setSaveError("No se pudo cerrar la sesión. Revisa la conexión e inténtalo de nuevo.");
            return false;
        }
    }, [
        finishSession,
        isOnline,
        pendingBlockCount,
        registrationEditable,
        sessionId,
        syncPendingCount,
        updateSession,
    ]);

    return {
        logMode,
        enterLogMode,
        exitLogMode,
        logBlocks,
        pendingBlockCount,
        progressPendingStepCount: progress?.pending_count ?? 0,
        isProgressLoading: isProgressLoading || isProgressFetching,
        isOnline,
        syncPendingCount,
        activeBlock,
        blockDraft,
        setBlockDraft,
        openBlock,
        closeBlock,
        saveActiveBlock,
        markBlockNotPerformed,
        saveError,
        isSavingBlock,
        registrationEditable,
        completeSessionIfReady,
        forceCompleteSession,
        refetchProgress,
    };
}
