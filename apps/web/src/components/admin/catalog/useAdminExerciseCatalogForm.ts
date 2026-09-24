/**
 * useAdminExerciseCatalogForm.ts — Orquestación create/edit/review/cola Admin ficha.
 *
 * Pages delgadas; lógica fuera de JSX (agent.md + 13 §7).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useCreateExerciseCatalogMutation,
    useDeactivateCatalogExerciseMutation,
    useGetExerciseCatalogQuery,
    useMarkCatalogExerciseReviewedMutation,
    useReactivateCatalogExerciseMutation,
    useUpdateExerciseCatalogMutation,
} from "@nexia/shared/api/adminCatalogApi";
import {
    getNextCatalogQueuePk,
    orderMusclesForCommit,
    parseCatalogConcurrencyError,
    parseCatalogValidationErrors,
    validateCatalogBundleDraft,
    type AdminCatalogSectionId,
} from "@nexia/shared";
import type {
    CatalogConcurrencyErrorOut,
    CatalogMuscleIn,
    CatalogPatternIn,
    CatalogJointActionIn,
    ExerciseCatalogBundleCreateIn,
} from "@nexia/shared/types/adminCatalog";
import { useToast } from "@/components/ui/feedback";
import {
    draftFromCatalog,
    emptyDraft,
    type AdminCatalogFormDraft,
    type JointRowDraft,
    type MuscleRowDraft,
    type PatternRowDraft,
} from "./adminCatalogFormTypes";
import { ADMIN_CATALOG_COPY } from "./adminCatalogPresentation";

export interface UseAdminExerciseCatalogFormArgs {
    mode: "create" | "edit";
    exercisePk: number | null;
}

function toBundle(draft: AdminCatalogFormDraft): ExerciseCatalogBundleCreateIn {
    const muscles: CatalogMuscleIn[] = orderMusclesForCommit(
        draft.muscles
            .filter((m): m is MuscleRowDraft & { muscle_id: number } => m.muscle_id != null)
            .map((m) => ({ muscle_id: m.muscle_id, role: m.role }))
    );
    const movement_patterns: CatalogPatternIn[] = draft.patterns
        .filter(
            (p): p is PatternRowDraft & { movement_pattern_id: number } =>
                p.movement_pattern_id != null
        )
        .map((p) => ({ movement_pattern_id: p.movement_pattern_id, role: p.role }));
    const joint_actions: CatalogJointActionIn[] = draft.joints
        .filter(
            (j): j is JointRowDraft & { joint_id: number; action_id: number } =>
                j.joint_id != null && j.action_id != null
        )
        .map((j) => ({
            joint_id: j.joint_id,
            action_id: j.action_id,
            role: j.role || "primary",
        }));

    return {
        core: {
            ...draft.core,
            nombre: draft.core.nombre.trim(),
            nombre_ingles: draft.core.nombre_ingles?.trim() || null,
            tipo: draft.core.tipo.trim().toLowerCase(),
            nivel: draft.core.nivel.trim(),
            laterality: draft.core.laterality?.trim() || null,
            axial_load: draft.core.axial_load?.trim() || "none",
        },
        muscles,
        movement_patterns,
        joint_actions,
        equipment_ids: draft.equipment_ids,
        tag_ids: draft.tag_ids,
    };
}

export function useAdminExerciseCatalogForm({
    mode,
    exercisePk,
}: UseAdminExerciseCatalogFormArgs) {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [draft, setDraft] = useState<AdminCatalogFormDraft>(emptyDraft);
    const [baselineJson, setBaselineJson] = useState<string>("");
    const [clientErrors, setClientErrors] = useState<
        Partial<Record<AdminCatalogSectionId, string[]>>
    >({});
    const [serverErrors, setServerErrors] = useState<string[]>([]);
    const [conflict, setConflict] = useState<CatalogConcurrencyErrorOut | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [mobileSection, setMobileSection] = useState<AdminCatalogSectionId>("datos");
    const [hydratedPk, setHydratedPk] = useState<number | null>(null);
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [reactivateOpen, setReactivateOpen] = useState(false);

    const {
        data: catalog,
        isLoading: isLoadingCatalog,
        isError: isCatalogError,
        refetch,
    } = useGetExerciseCatalogQuery(exercisePk ?? 0, {
        skip: mode !== "edit" || exercisePk == null,
    });

    const [createCatalog, { isLoading: isCreating }] = useCreateExerciseCatalogMutation();
    const [updateCatalog, { isLoading: isUpdating }] = useUpdateExerciseCatalogMutation();
    const [markReviewed, { isLoading: isMarking }] = useMarkCatalogExerciseReviewedMutation();
    const [deactivateCatalog, { isLoading: isDeactivating }] =
        useDeactivateCatalogExerciseMutation();
    const [reactivateCatalog, { isLoading: isReactivating }] =
        useReactivateCatalogExerciseMutation();

    const isTogglingActive = isDeactivating || isReactivating;
    const isSaving = isCreating || isUpdating || isMarking || isTogglingActive;

    useEffect(() => {
        if (mode === "create") {
            const empty = emptyDraft();
            setDraft(empty);
            setBaselineJson(JSON.stringify(empty));
            setHydratedPk(null);
            return;
        }
        if (catalog && catalog.id !== hydratedPk) {
            const next = draftFromCatalog(catalog);
            setDraft(next);
            setBaselineJson(JSON.stringify(next));
            setHydratedPk(catalog.id);
            setClientErrors({});
            setServerErrors([]);
            setConflict(null);
        }
    }, [mode, catalog, hydratedPk]);

    const isDirty = useMemo(() => {
        if (!baselineJson) return false;
        return JSON.stringify(draft) !== baselineJson;
    }, [draft, baselineJson]);

    const errorCountBySection = useMemo(() => {
        const counts: Partial<Record<AdminCatalogSectionId, number>> = {};
        for (const [section, messages] of Object.entries(clientErrors)) {
            counts[section as AdminCatalogSectionId] = messages?.length ?? 0;
        }
        return counts;
    }, [clientErrors]);

    const runClientValidation = useCallback(() => {
        const bundle = toBundle(draft);
        const result = validateCatalogBundleDraft({
            core: bundle.core,
            muscles: bundle.muscles,
            movement_patterns: bundle.movement_patterns,
            joint_actions: bundle.joint_actions,
            equipment_ids: bundle.equipment_ids,
            tag_ids: bundle.tag_ids ?? [],
        });
        const next: Partial<Record<AdminCatalogSectionId, string[]>> = {};
        for (const item of result.bySection) {
            next[item.section] = item.messages;
        }
        setClientErrors(next);
        return result;
    }, [draft]);

    const persist = useCallback(async (): Promise<number | null> => {
        const result = runClientValidation();
        if (!result.ok) {
            if (result.firstSectionWithError) {
                setMobileSection(result.firstSectionWithError);
                const el = document.getElementById(result.firstSectionWithError);
                if (el && typeof el.scrollIntoView === "function") {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
            showError(ADMIN_CATALOG_COPY.validationAlert);
            return null;
        }

        const bundle = toBundle(draft);
        setServerErrors([]);

        try {
            if (mode === "create") {
                const created = await createCatalog(bundle).unwrap();
                const next = draftFromCatalog(created);
                setDraft(next);
                setBaselineJson(JSON.stringify(next));
                setHydratedPk(created.id);
                showSuccess(ADMIN_CATALOG_COPY.createdToast);
                return created.id;
            }

            if (exercisePk == null || !draft.expected_updated_at) {
                showError("Falta token de concurrencia (updated_at)");
                return null;
            }

            const updated = await updateCatalog({
                exercisePk,
                body: {
                    ...bundle,
                    expected_updated_at: draft.expected_updated_at,
                },
            }).unwrap();
            const next = draftFromCatalog(updated);
            setDraft(next);
            setBaselineJson(JSON.stringify(next));
            setHydratedPk(updated.id);
            showSuccess(ADMIN_CATALOG_COPY.savedToast);
            return updated.id;
        } catch (err) {
            const concurrency = parseCatalogConcurrencyError(err);
            if (concurrency) {
                setConflict(concurrency);
                return null;
            }
            const validation = parseCatalogValidationErrors(err);
            if (validation.length > 0) {
                setServerErrors(validation);
                showError(validation[0] ?? ADMIN_CATALOG_COPY.validationAlert);
                return null;
            }
            showError("No se pudo guardar el ejercicio");
            return null;
        }
    }, [
        createCatalog,
        draft,
        exercisePk,
        mode,
        runClientValidation,
        showError,
        showSuccess,
        updateCatalog,
    ]);

    const handleSave = useCallback(async () => {
        const pk = await persist();
        if (pk != null && mode === "create") {
            navigate(`/dashboard/admin/catalog/${pk}`, { replace: true });
        }
    }, [mode, navigate, persist]);

    const handleMarkReviewed = useCallback(async () => {
        const pk = mode === "edit" ? exercisePk : hydratedPk;
        if (pk == null) {
            showError("Guarda el ejercicio antes de marcar revisado");
            return;
        }
        if (isDirty) {
            showError("Guarda los cambios antes de marcar como revisado");
            return;
        }
        try {
            await markReviewed(pk).unwrap();
            setDraft((prev) => ({ ...prev, review_status: "reviewed" }));
            showSuccess(ADMIN_CATALOG_COPY.reviewedToast);
        } catch {
            showError("No se pudo marcar como revisado");
        }
    }, [exercisePk, hydratedPk, isDirty, markReviewed, mode, showError, showSuccess]);

    const handleReviewedAndNext = useCallback(async () => {
        let pk = mode === "edit" ? exercisePk : hydratedPk;

        if (isDirty || mode === "create") {
            pk = await persist();
            if (pk == null) return;
            if (mode === "create") {
                navigate(`/dashboard/admin/catalog/${pk}`, { replace: true });
            }
        }

        if (pk == null) return;

        try {
            await markReviewed(pk).unwrap();
            showSuccess(ADMIN_CATALOG_COPY.reviewedToast);
        } catch {
            showError("No se pudo marcar como revisado");
            return;
        }

        const nextPk = getNextCatalogQueuePk(pk);
        if (nextPk == null) {
            showSuccess(ADMIN_CATALOG_COPY.queueDone);
            navigate("/dashboard/admin/catalog");
            return;
        }
        navigate(`/dashboard/admin/catalog/${nextPk}`);
    }, [
        exercisePk,
        hydratedPk,
        isDirty,
        markReviewed,
        mode,
        navigate,
        persist,
        showError,
        showSuccess,
    ]);

    const handleCancel = useCallback(() => {
        if (isDirty && !window.confirm(ADMIN_CATALOG_COPY.discardConfirm)) {
            return;
        }
        navigate("/dashboard/admin/catalog");
    }, [isDirty, navigate]);

    /** Rehidrata draft + token de concurrencia tras una acción que toca updated_at. */
    const hydrateFromServer = useCallback(async () => {
        if (mode !== "edit" || exercisePk == null) return;
        const result = await refetch();
        if (result.data) {
            const next = draftFromCatalog(result.data);
            setDraft(next);
            setBaselineJson(JSON.stringify(next));
            setHydratedPk(result.data.id);
        }
    }, [exercisePk, mode, refetch]);

    const handleDeactivate = useCallback(async () => {
        if (exercisePk == null) return;
        if (isDirty) {
            showError(ADMIN_CATALOG_COPY.saveBeforeToggleActive);
            setDeactivateOpen(false);
            return;
        }
        try {
            // DELETE /exercises/{pk} devuelve la ficha completa ya inactiva
            // (incluye updated_at): hidratar desde ahí mantiene el lock óptimista.
            const deactivated = await deactivateCatalog(exercisePk).unwrap();
            const next = draftFromCatalog(deactivated);
            setDraft(next);
            setBaselineJson(JSON.stringify(next));
            setHydratedPk(deactivated.id);
            setDeactivateOpen(false);
            showSuccess(ADMIN_CATALOG_COPY.deactivatedToast);
        } catch {
            setDeactivateOpen(false);
            showError(ADMIN_CATALOG_COPY.deactivateError);
        }
    }, [deactivateCatalog, exercisePk, isDirty, showError, showSuccess]);

    const handleReactivate = useCallback(async () => {
        if (exercisePk == null) return;
        if (isDirty) {
            showError(ADMIN_CATALOG_COPY.saveBeforeToggleActive);
            setReactivateOpen(false);
            return;
        }
        try {
            await reactivateCatalog(exercisePk).unwrap();
            setReactivateOpen(false);
            await hydrateFromServer();
            showSuccess(ADMIN_CATALOG_COPY.reactivatedToast);
        } catch {
            setReactivateOpen(false);
            showError(ADMIN_CATALOG_COPY.reactivateError);
        }
    }, [exercisePk, hydrateFromServer, isDirty, reactivateCatalog, showError, showSuccess]);

    const handleReloadConflict = useCallback(async () => {
        setConflict(null);
        if (mode === "edit" && exercisePk != null) {
            const result = await refetch();
            if (result.data) {
                const next = draftFromCatalog(result.data);
                setDraft(next);
                setBaselineJson(JSON.stringify(next));
                setHydratedPk(result.data.id);
            }
        }
    }, [exercisePk, mode, refetch]);

    return {
        draft,
        setDraft,
        isDirty,
        isLoadingCatalog: mode === "edit" && isLoadingCatalog,
        isCatalogError: mode === "edit" && isCatalogError,
        isSaving,
        clientErrors,
        errorCountBySection,
        serverErrors,
        conflict,
        setConflict,
        historyOpen,
        setHistoryOpen,
        mobileSection,
        setMobileSection,
        catalog,
        refetch,
        isInactive: draft.core.is_active === false,
        isTogglingActive,
        deactivateOpen,
        setDeactivateOpen,
        reactivateOpen,
        setReactivateOpen,
        handleDeactivate,
        handleReactivate,
        handleSave,
        handleMarkReviewed,
        handleReviewedAndNext,
        handleCancel,
        handleReloadConflict,
        currentPk: mode === "edit" ? exercisePk : hydratedPk,
    };
}
