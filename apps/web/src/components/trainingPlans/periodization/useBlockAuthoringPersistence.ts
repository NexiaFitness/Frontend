/**
 * useBlockAuthoringPersistence.ts — Persistencia create/edit del journey D-PAP (F2).
 *
 * Create: POST atómico with-recurring-structure (D-PAP §8.4.5).
 * Edit: PUT bloque + persistBlockStructureEdit (sync-recurring atómico + D-PRES).
 */

import { useCallback, useRef, useState } from "react";

import {
    getMutationErrorMessage,
    weeklyStructureDraftsEqual,
} from "@nexia/shared";
import {
    useCreatePeriodBlockWithStructureMutation,
    useUpdatePeriodBlockMutation,
} from "@nexia/shared/api/periodBlocksApi";
import {
    useCreateWeeklyStructureWeekMutation,
    useUpdateWeeklyStructureWeekMutation,
    useSyncRecurringWeeklyStructureMutation,
} from "@nexia/shared/api/weeklyStructureApi";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type {
    WeeklyStructureOut,
    WeeklyStructureWeekCreate,
} from "@nexia/shared/types/weeklyStructure";

import { useToast } from "@/components/ui/feedback";

import type { BlockAuthorMode } from "./blockAuthoringModel";
import {
    blockFieldsChanged,
    cloneWeeklyStructureDraft,
    persistBlockStructureEdit,
    toBlockCreateWithStructurePayload,
    toBlockPersistPayload,
    weeklyStructureToDraft,
} from "./periodBlockPersistence";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";

export interface UseBlockAuthoringPersistenceArgs {
    planId: number;
    mode: BlockAuthorMode;
    blockId: number | null;
    form: Pick<
        PeriodBlockFormState,
        | "startDate"
        | "endDate"
        | "qualities"
        | "volumeLevel"
        | "intensityLevel"
        | "weeklyStructure"
    >;
    blocks: PlanPeriodBlock[];
    existingStructure: WeeklyStructureOut | undefined;
    structureBaseline: WeeklyStructureWeekCreate[];
    /** Edit: true once weekly structure baseline is hydrated from API. */
    structureReady: boolean;
    /** Misma señal dirty que el botón Guardar (usePeriodBlockForm.isStructureDirty). */
    isStructureDirty: boolean;
    canPersist: boolean;
    activeDayCount: number;
    patternsComplete: boolean;
    markPersisted: (
        block: PlanPeriodBlock,
        structure: WeeklyStructureWeekCreate[],
    ) => void;
    onCreateSuccess: () => void;
    refetchWeeklyStructure?: () => Promise<{ data?: WeeklyStructureOut }>;
    /** false = Quick Program local draft (sin mutations). */
    enabled?: boolean;
}

export function useBlockAuthoringPersistence({
    planId,
    mode,
    blockId,
    form,
    blocks,
    existingStructure,
    structureBaseline,
    structureReady,
    isStructureDirty: _isStructureDirty,
    canPersist,
    activeDayCount,
    patternsComplete,
    markPersisted,
    onCreateSuccess,
    refetchWeeklyStructure,
    enabled = true,
}: UseBlockAuthoringPersistenceArgs) {
    const { showSuccess, showWarning, showError } = useToast();
    const [createWithStructure, { isLoading: isCreating }] =
        useCreatePeriodBlockWithStructureMutation();
    const [updateBlock, { isLoading: isUpdating }] =
        useUpdatePeriodBlockMutation();
    const [createWeek] = useCreateWeeklyStructureWeekMutation();
    const [updateWeek] = useUpdateWeeklyStructureWeekMutation();
    const [syncRecurring] = useSyncRecurringWeeklyStructureMutation();
    const [isSavingStructure, setIsSavingStructure] = useState(false);

    const existingStructureRef = useRef(existingStructure);
    existingStructureRef.current = existingStructure;

    const isSaving = isCreating || isUpdating || isSavingStructure;

    const saveCreate = useCallback(async () => {
        if (!form.startDate || !form.endDate) {
            showWarning("Faltan fechas del bloque.");
            return;
        }
        if (!canPersist) {
            showWarning(
                "Completa cualidades, volumen e intensidad antes de crear el bloque.",
            );
            return;
        }
        if (activeDayCount === 0) {
            showWarning("Selecciona al menos un día de entrenamiento.");
            return;
        }
        if (!patternsComplete) {
            showWarning(
                "Asigna al menos un patrón a cada día de entrenamiento.",
            );
            return;
        }

        const payload = toBlockCreateWithStructurePayload(
            {
                startDate: form.startDate,
                endDate: form.endDate,
                volumeLevel: form.volumeLevel,
                intensityLevel: form.intensityLevel,
                qualities: form.qualities,
            },
            form.weeklyStructure,
        );

        try {
            const result = await createWithStructure({
                planId,
                data: payload,
            }).unwrap();
            markPersisted(result.block, form.weeklyStructure);
            showSuccess("Bloque de periodización creado correctamente.");
            onCreateSuccess();
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    }, [
        form.startDate,
        form.endDate,
        form.volumeLevel,
        form.intensityLevel,
        form.qualities,
        form.weeklyStructure,
        canPersist,
        activeDayCount,
        patternsComplete,
        createWithStructure,
        planId,
        markPersisted,
        onCreateSuccess,
        showSuccess,
        showWarning,
        showError,
    ]);

    const saveEdit = useCallback(async () => {
        if (blockId == null || !form.startDate || !form.endDate) {
            showWarning("No se puede guardar: falta el bloque o las fechas.");
            return;
        }

        const payload = toBlockPersistPayload({
            startDate: form.startDate,
            endDate: form.endDate,
            volumeLevel: form.volumeLevel,
            intensityLevel: form.intensityLevel,
            qualities: form.qualities,
        });

        const persistedBlock = blocks.find((b) => b.id === blockId);
        if (!persistedBlock) {
            showError("No se puede guardar: bloque no encontrado.");
            return;
        }

        const draftSnapshot = cloneWeeklyStructureDraft(form.weeklyStructure);
        const baselineSnapshot = cloneWeeklyStructureDraft(structureBaseline);
        const structureDiffersFromBaseline =
            draftSnapshot.length > 0 &&
            baselineSnapshot.length > 0 &&
            !weeklyStructureDraftsEqual(draftSnapshot, baselineSnapshot);
        const structureIsDirty = structureReady && structureDiffersFromBaseline;

        if (
            structureReady &&
            draftSnapshot.length > 0 &&
            baselineSnapshot.length === 0
        ) {
            showError(
                "No se pudo determinar el estado persistido de la estructura semanal. Recarga la página e inténtalo de nuevo.",
            );
            return;
        }

        let updatedBlock: PlanPeriodBlock = persistedBlock;
        let blockFieldsPersisted = false;
        let structureFieldsPersisted = false;

        try {
            if (blockFieldsChanged(payload, persistedBlock)) {
                updatedBlock = await updateBlock({
                    planId,
                    blockId,
                    data: payload,
                }).unwrap();
                blockFieldsPersisted = true;
            }

            if (structureIsDirty) {
                setIsSavingStructure(true);
                try {
                    structureFieldsPersisted =
                        await persistBlockStructureEdit(
                            planId,
                            blockId,
                            form.startDate,
                            form.endDate,
                            draftSnapshot,
                            baselineSnapshot,
                            existingStructureRef.current,
                            updateWeek,
                            createWeek,
                            syncRecurring,
                        );
                } finally {
                    setIsSavingStructure(false);
                }

                if (!structureFieldsPersisted) {
                    if (blockFieldsPersisted) {
                        showWarning(
                            "Los datos del bloque se guardaron, pero la estructura semanal no cambió.",
                        );
                    } else {
                        showWarning("No hay cambios que guardar.");
                    }
                    return;
                }

                if (!refetchWeeklyStructure) {
                    showError(
                        "No se pudo confirmar el guardado con el servidor. Revisa la conexión e inténtalo de nuevo.",
                    );
                    return;
                }

                const refetchResult = await refetchWeeklyStructure();
                if (!refetchResult.data?.weeks) {
                    showError(
                        "No se pudo confirmar el guardado con el servidor. Revisa la conexión e inténtalo de nuevo.",
                    );
                    return;
                }

                const synced = weeklyStructureToDraft(refetchResult.data.weeks);
                if (!weeklyStructureDraftsEqual(synced, draftSnapshot)) {
                    showError(
                        "El servidor no reflejó los cambios. Revisa la conexión e inténtalo de nuevo.",
                    );
                    return;
                }

                markPersisted(
                    updatedBlock,
                    cloneWeeklyStructureDraft(synced),
                );
                showSuccess("Fase guardada correctamente.");
                return;
            }

            if (!blockFieldsPersisted) {
                showWarning("No hay cambios que guardar.");
                return;
            }

            if (structureDiffersFromBaseline) {
                showError(
                    "No se pudo guardar la estructura semanal. Revisa la conexión e inténtalo de nuevo.",
                );
                return;
            }

            markPersisted(
                updatedBlock,
                baselineSnapshot.length > 0 ? baselineSnapshot : draftSnapshot,
            );
            showSuccess("Fase guardada correctamente.");
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    }, [
        blockId,
        form.startDate,
        form.endDate,
        form.volumeLevel,
        form.intensityLevel,
        form.qualities,
        form.weeklyStructure,
        structureBaseline,
        blocks,
        structureReady,
        updateBlock,
        createWeek,
        updateWeek,
        syncRecurring,
        planId,
        markPersisted,
        refetchWeeklyStructure,
        showSuccess,
        showWarning,
        showError,
    ]);

    const save = useCallback(async () => {
        if (!enabled) return;
        if (mode === "create") {
            await saveCreate();
        } else {
            await saveEdit();
        }
    }, [enabled, mode, saveCreate, saveEdit]);

    return { save, isSaving: enabled ? isSaving : false };
}
