/**
 * useTrainingPlanEditor.ts — Orquestación del editor unificado de plan (crear / editar).
 *
 * Contexto: mutaciones `useCreateTrainingPlanMutation` y `useUpdateTrainingPlanMutation`
 * únicamente; solape sobre instancias excluyendo `source_plan_id === planId` en edit.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/feedback";
import {
    useCreateTrainingPlanMutation,
    useUpdateTrainingPlanMutation,
    useGetTrainingPlanQuery,
    useGetTrainingPlanInstancesQuery,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import type { TrainingPlanInstance } from "@nexia/shared/types/training";
import { getMutationErrorMessage } from "@nexia/shared";
import {
    createEmptyTrainingPlanEditorDraft,
    mapTrainingPlanToEditorDraft,
    validateTrainingPlanEditorDraft,
    findOverlappingTrainingPlanInstance,
    buildTrainingPlanCreatePayload,
    buildTrainingPlanUpdatePayload,
    mapClientProfileObjectiveToPlanGoal,
    type TrainingPlanEditorDraft,
    type TrainingPlanEditorValidationErrors,
    type TrainingPlanInstanceOverlapRow,
} from "@nexia/shared";

export type TrainingPlanEditorMode =
    | { kind: "create"; clientId: number | null; trainerId: number }
    | { kind: "edit"; planId: number; trainerId: number };

export interface UseTrainingPlanEditorResult {
    draft: TrainingPlanEditorDraft;
    setDraft: React.Dispatch<React.SetStateAction<TrainingPlanEditorDraft>>;
    formErrors: TrainingPlanEditorValidationErrors;
    existingInstances: TrainingPlanInstance[];
    isLoadingInstances: boolean;
    isPageLoading: boolean;
    clientForBlock: { id: number; nombre: string; apellidos: string } | null;
    showClientBlock: boolean;
    recommendationsClientId: number | null;
    handleSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    isSubmitDisabled: boolean;
    isOverlapModalOpen: boolean;
    overlappingPlan: { name: string; start_date: string; end_date: string } | null;
    handleConfirmOverlap: () => void;
    handleCancelOverlap: () => void;
    handleCancelNavigation: () => void;
    pendingPayload: ReturnType<typeof buildTrainingPlanCreatePayload> | null;
    /** Solo modo edición: fallo al cargar el plan (RTK `isError`). */
    isPlanLoadError: boolean;
}

function overlapModalShape(inst: TrainingPlanInstanceOverlapRow): {
    name: string;
    start_date: string;
    end_date: string;
} {
    const d = (s: string | null | undefined) =>
        s
            ? new Date(s).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
              })
            : "—";
    return {
        name: inst.name,
        start_date: d(inst.start_date),
        end_date: d(inst.end_date),
    };
}

export function useTrainingPlanEditor(
    mode: TrainingPlanEditorMode,
    options: { cancelPath: string; editSuccessPath?: string }
): UseTrainingPlanEditorResult {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [draft, setDraft] = useState<TrainingPlanEditorDraft>(() =>
        createEmptyTrainingPlanEditorDraft()
    );
    const [formErrors, setFormErrors] = useState<TrainingPlanEditorValidationErrors>({});
    const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false);
    const [overlappingPlan, setOverlappingPlan] = useState<{
        name: string;
        start_date: string;
        end_date: string;
    } | null>(null);
    const [pendingCreatePayload, setPendingCreatePayload] = useState<ReturnType<
        typeof buildTrainingPlanCreatePayload
    > | null>(null);

    const [createPlan, { isLoading: isCreating }] = useCreateTrainingPlanMutation();
    const [updatePlan, { isLoading: isUpdating }] = useUpdateTrainingPlanMutation();

    const planId = mode.kind === "edit" ? mode.planId : 0;
    const {
        data: plan,
        isLoading: isLoadingPlan,
        isError: isPlanError,
    } = useGetTrainingPlanQuery(planId, {
        skip: mode.kind !== "edit" || !planId,
    });

    const createClientId = mode.kind === "create" ? mode.clientId : null;
    const { data: clientCreate } = useGetClientQuery(createClientId ?? 0, {
        skip: mode.kind !== "create" || !createClientId,
    });

    const editClientId = mode.kind === "edit" ? (plan?.client_id ?? null) : null;
    const { data: clientEdit } = useGetClientQuery(editClientId ?? 0, {
        skip: mode.kind !== "edit" || !editClientId,
    });

    useEffect(() => {
        if (mode.kind !== "edit" || !plan) return;
        setDraft(mapTrainingPlanToEditorDraft(plan));
    }, [mode.kind, plan]);

    useEffect(() => {
        if (mode.kind !== "create" || !clientCreate?.objective || draft.goal) return;
        const mapped = mapClientProfileObjectiveToPlanGoal(
            clientCreate.objective ?? undefined
        );
        if (mapped) {
            setDraft((d) => ({ ...d, goal: mapped }));
        }
    }, [mode.kind, clientCreate, draft.goal]);

    const trainerId = mode.trainerId;
    const instancesClientId =
        mode.kind === "create" ? mode.clientId : (plan?.client_id ?? null);

    const { data: existingInstances = [], isLoading: isLoadingInstances } =
        useGetTrainingPlanInstancesQuery(
            { clientId: instancesClientId!, trainerId },
            { skip: !instancesClientId || !trainerId }
        );

    const excludeSourcePlanId = mode.kind === "edit" ? mode.planId : null;

    const runOverlapCheck = useCallback(
        (d: TrainingPlanEditorDraft): TrainingPlanInstanceOverlapRow | undefined => {
            if (!instancesClientId) return undefined;
            return findOverlappingTrainingPlanInstance(
                existingInstances,
                d.start_date,
                d.end_date,
                excludeSourcePlanId
            );
        },
        [existingInstances, instancesClientId, excludeSourcePlanId]
    );

    const performCreate = useCallback(
        async (payload: ReturnType<typeof buildTrainingPlanCreatePayload>) => {
            try {
                const result = await createPlan(payload).unwrap();
                showSuccess("Plan creado exitosamente", 2000);
                const cid = payload.client_id;
                setTimeout(() => {
                    if (cid) {
                        navigate(
                            `/dashboard/training-plans/${result.id}?returnToClient=${cid}&tab=planning`
                        );
                    } else {
                        navigate(`/dashboard/training-plans/${result.id}?tab=planning`);
                    }
                }, 800);
            } catch (err) {
                console.error("Error creando plan:", err);
                showError(getMutationErrorMessage(err));
            }
        },
        [createPlan, navigate, showError, showSuccess]
    );

    const performUpdate = useCallback(async () => {
        if (mode.kind !== "edit" || !planId) return;
        const payload = buildTrainingPlanUpdatePayload(draft);
        try {
            await updatePlan({ id: planId, data: payload }).unwrap();
            showSuccess("Plan actualizado correctamente", 2000);
            const target = options.editSuccessPath ?? `/dashboard/training-plans/${planId}`;
            navigate(target);
        } catch (err) {
            console.error("Error actualizando plan:", err);
            showError(getMutationErrorMessage(err));
        }
    }, [draft, mode.kind, navigate, options.editSuccessPath, planId, showError, showSuccess, updatePlan]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            setFormErrors({});
            const ve = validateTrainingPlanEditorDraft(draft);
            if (Object.keys(ve).length > 0) {
                setFormErrors(ve);
                return;
            }

            if (mode.kind === "create") {
                const payload = buildTrainingPlanCreatePayload(
                    trainerId,
                    mode.clientId,
                    draft
                );
                const overlapping = runOverlapCheck(draft);
                if (overlapping) {
                    setOverlappingPlan(overlapModalShape(overlapping));
                    setPendingCreatePayload(payload);
                    setIsOverlapModalOpen(true);
                    return;
                }
                void performCreate(payload);
                return;
            }

            const overlapping = runOverlapCheck(draft);
            if (overlapping) {
                setOverlappingPlan(overlapModalShape(overlapping));
                setIsOverlapModalOpen(true);
                return;
            }
            void performUpdate();
        },
        [
            draft,
            mode,
            performCreate,
            performUpdate,
            runOverlapCheck,
            trainerId,
        ]
    );

    const handleConfirmOverlap = useCallback(() => {
        setIsOverlapModalOpen(false);
        if (mode.kind === "create" && pendingCreatePayload) {
            void performCreate(pendingCreatePayload);
            setPendingCreatePayload(null);
        } else if (mode.kind === "edit") {
            void performUpdate();
        }
        setOverlappingPlan(null);
    }, [mode.kind, pendingCreatePayload, performCreate, performUpdate]);

    const handleCancelOverlap = useCallback(() => {
        setIsOverlapModalOpen(false);
        setPendingCreatePayload(null);
        setOverlappingPlan(null);
    }, []);

    const handleCancelNavigation = useCallback(() => {
        navigate(options.cancelPath);
    }, [navigate, options.cancelPath]);

    const clientForBlock = useMemo(() => {
        if (mode.kind === "create" && clientCreate && createClientId) {
            return {
                id: createClientId,
                nombre: clientCreate.nombre,
                apellidos: clientCreate.apellidos,
            };
        }
        if (mode.kind === "edit" && clientEdit && editClientId) {
            return {
                id: editClientId,
                nombre: clientEdit.nombre,
                apellidos: clientEdit.apellidos,
            };
        }
        return null;
    }, [mode.kind, clientCreate, createClientId, clientEdit, editClientId]);

    const showClientBlock = Boolean(instancesClientId);
    const recommendationsClientId = instancesClientId;

    const isPageLoading =
        !trainerId ||
        (mode.kind === "edit" && (isLoadingPlan || (!plan && !isPlanError))) ||
        (mode.kind === "create" && createClientId != null && !clientCreate);

    const isSubmitting = isCreating || isUpdating;
    const isSubmitDisabled = isSubmitting || isPageLoading;

    return {
        draft,
        setDraft,
        formErrors,
        existingInstances,
        isLoadingInstances,
        isPageLoading: Boolean(isPageLoading),
        clientForBlock,
        showClientBlock,
        recommendationsClientId,
        handleSubmit,
        isSubmitting,
        isSubmitDisabled,
        isOverlapModalOpen,
        overlappingPlan,
        handleConfirmOverlap,
        handleCancelOverlap,
        handleCancelNavigation,
        pendingPayload: pendingCreatePayload,
        isPlanLoadError: mode.kind === "edit" && isPlanError,
    };
}
