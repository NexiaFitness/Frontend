/**
 * useBlockAuthoringPersistence.ts — Persistencia create/edit del journey D-PAP (F2).
 *
 * Create: POST atómico with-recurring-structure (D-PAP §8.4.5).
 * Edit: PUT bloque + persistWeeklyStructureIncremental (D-PRES).
 */

import { useCallback, useState } from "react";

import { getMutationErrorMessage } from "@nexia/shared";
import {
    useCreatePeriodBlockWithStructureMutation,
    useUpdatePeriodBlockMutation,
} from "@nexia/shared/api/periodBlocksApi";
import {
    useCreateWeeklyStructureWeekMutation,
    useUpdateWeeklyStructureWeekMutation,
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
    persistWeeklyStructureIncremental,
    toBlockCreateWithStructurePayload,
    toBlockPersistPayload,
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
    /** Edit: true once weekly structure baseline is hydrated from API. */
    structureReady: boolean;
    canPersist: boolean;
    activeDayCount: number;
    markPersisted: (
        block: PlanPeriodBlock,
        structure: WeeklyStructureWeekCreate[],
    ) => void;
    onCreateSuccess: () => void;
}

export function useBlockAuthoringPersistence({
    planId,
    mode,
    blockId,
    form,
    blocks,
    existingStructure,
    structureReady,
    canPersist,
    activeDayCount,
    markPersisted,
    onCreateSuccess,
}: UseBlockAuthoringPersistenceArgs) {
    const { showSuccess, showWarning, showError } = useToast();
    const [createWithStructure, { isLoading: isCreating }] =
        useCreatePeriodBlockWithStructureMutation();
    const [updateBlock, { isLoading: isUpdating }] =
        useUpdatePeriodBlockMutation();
    const [createWeek] = useCreateWeeklyStructureWeekMutation();
    const [updateWeek] = useUpdateWeeklyStructureWeekMutation();
    const [isSavingStructure, setIsSavingStructure] = useState(false);

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
        let updatedBlock = persistedBlock;
        let didPersist = false;

        try {
            if (persistedBlock && blockFieldsChanged(payload, persistedBlock)) {
                updatedBlock = await updateBlock({
                    planId,
                    blockId,
                    data: payload,
                }).unwrap();
                didPersist = true;
            }

            if (form.weeklyStructure.length > 0 && structureReady) {
                setIsSavingStructure(true);
                try {
                    const structureSaved =
                        await persistWeeklyStructureIncremental(
                            planId,
                            blockId,
                            form.weeklyStructure,
                            existingStructure,
                            updateWeek,
                            createWeek,
                        );
                    if (structureSaved) didPersist = true;
                } finally {
                    setIsSavingStructure(false);
                }
            }

            if (didPersist && updatedBlock) {
                markPersisted(updatedBlock, form.weeklyStructure);
                showSuccess("Fase guardada correctamente.");
            } else if (!didPersist) {
                showWarning("No hay cambios que guardar.");
            }
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
        blocks,
        structureReady,
        existingStructure,
        updateBlock,
        createWeek,
        updateWeek,
        planId,
        markPersisted,
        showSuccess,
        showWarning,
        showError,
    ]);

    const save = useCallback(async () => {
        if (mode === "create") {
            await saveCreate();
        } else {
            await saveEdit();
        }
    }, [mode, saveCreate, saveEdit]);

    return { save, isSaving };
}
