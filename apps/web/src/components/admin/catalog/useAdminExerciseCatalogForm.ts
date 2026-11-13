/**
 * useAdminExerciseCatalogForm.ts — Carga, borrador y guardado de la ficha admin del ejercicio.
 *
 * Contexto: alta, edición y alta desde la Biblioteca RepDB (SPEC_H5 §2.3). H10: la técnica
 * y la marca «Revisado» viajan en el mismo bundle (SPEC_H10, D-H10-4); en la cola de
 * revisión el guardado avanza al siguiente. Activar/desactivar vive en
 * useAdminCatalogActiveToggle, la cola en useAdminCatalogQueuePosition y las operaciones
 * sobre el borrador en adminCatalogDraft.
 * Notas de mantenimiento:
 * - Salir con cambios abre DiscardUnsavedChangesModal (nada de window.confirm).
 * - Los errores de la técnica: los límites se ven siempre; lo obligatorio, tras intentar
 *   guardar (no se riñe a quien aún no ha escrito).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import {
    useCreateExerciseCatalogMutation,
    useGetExerciseCatalogQuery,
    useUpdateExerciseCatalogMutation,
} from "@nexia/shared/api/adminCatalogApi";
import {
    useAdoptLibraryCandidateMutation,
    useGetLibraryCandidateQuery,
} from "@nexia/shared/api/adminCatalogLibraryApi";
import {
    finalizeCatalogBundle,
    parseCatalogConcurrencyError,
    parseCatalogValidationErrors,
    resolveTechniqueSubmit,
    techniqueFieldErrors,
    techniqueFromDraft,
    validateCatalogBundleDraft,
    type AdminCatalogSectionId,
    type CatalogCoreFieldId,
} from "@nexia/shared";
import type {
    CatalogConcurrencyErrorOut,
    CatalogExerciseOut,
} from "@nexia/shared/types/adminCatalog";
import { useToast } from "@/components/ui/feedback";
import { draftFromCatalog, emptyDraft, type AdminCatalogFormDraft } from "./adminCatalogFormTypes";
import { toBundleDraft } from "./adminCatalogDraft";
import { ADMIN_CATALOG_COPY } from "./adminCatalogPresentation";
import { FICHA_COPY } from "./adminCatalogFichaPresentation";
import { LIBRARY_COPY, libraryRefusalMessage } from "./adminCatalogLibraryPresentation";
import { useAdminCatalogQueuePosition } from "./useAdminCatalogQueuePosition";

export interface UseAdminExerciseCatalogFormArgs {
    mode: "create" | "edit";
    exercisePk: number | null;
    libraryCandidateId?: number | null;
    /** Al guardar con errores: la ficha abre y enseña esas secciones. */
    onInvalid?: (sections: AdminCatalogSectionId[]) => void;
}

type SectionErrors = Partial<Record<AdminCatalogSectionId, string[]>>;

export function useAdminExerciseCatalogForm({
    mode,
    exercisePk,
    libraryCandidateId = null,
    onInvalid,
}: UseAdminExerciseCatalogFormArgs) {
    const navigate = useNavigate();
    const { goBack } = useReturnToOrigin({ fallbackPath: "/dashboard/admin/catalog" });
    const { showSuccess, showError } = useToast();
    const [draft, setDraft] = useState<AdminCatalogFormDraft>(emptyDraft);
    const [baselineJson, setBaselineJson] = useState("");
    const [clientErrors, setClientErrors] = useState<SectionErrors>({});
    const [coreFieldErrors, setCoreFieldErrors] = useState<Partial<Record<CatalogCoreFieldId, string>>>({});
    const [attempted, setAttempted] = useState(false);
    const [serverErrors, setServerErrors] = useState<string[]>([]);
    const [conflict, setConflict] = useState<CatalogConcurrencyErrorOut | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [discardOpen, setDiscardOpen] = useState(false);
    const [hydratedPk, setHydratedPk] = useState<number | null>(null);

    const isAdopting = mode === "create" && libraryCandidateId != null;
    const techniqueMode = isAdopting ? "adopt" : mode;
    const queue = useAdminCatalogQueuePosition(mode === "edit" ? exercisePk : null);

    const {
        data: catalog,
        isLoading: isLoadingCatalog,
        isError: isCatalogError,
        refetch,
    } = useGetExerciseCatalogQuery(exercisePk ?? 0, { skip: mode !== "edit" || exercisePk == null });
    const libraryPrefilled = useRef(false);
    const { data: libraryCandidate, isLoading: isLoadingLibrary } = useGetLibraryCandidateQuery(
        libraryCandidateId ?? 0,
        { skip: !isAdopting }
    );
    const [adoptLibraryCandidate, { isLoading: isAdoptingNow }] = useAdoptLibraryCandidateMutation();
    const [createCatalog, { isLoading: isCreating }] = useCreateExerciseCatalogMutation();
    const [updateCatalog, { isLoading: isUpdating }] = useUpdateExerciseCatalogMutation();
    const isSaving = isCreating || isUpdating || isAdoptingNow;
    const libraryNotice =
        libraryCandidate != null && !libraryCandidate.writable ? LIBRARY_COPY.readonlyAdopt : null;

    // Entre la llegada del catálogo y el efecto de hidratación el draft aún está vacío:
    // sin este gate la ficha pintaría un instante los campos en blanco.
    const awaitingHydration = mode === "edit" && catalog != null && catalog.id !== hydratedPk;

    /** Deja el borrador y la referencia de «sin cambios» igual que el servidor. */
    const applyCatalog = useCallback((next: CatalogExerciseOut) => {
        const nextDraft = draftFromCatalog(next);
        setDraft(nextDraft);
        setBaselineJson(JSON.stringify(nextDraft));
        setHydratedPk(next.id);
        setClientErrors({});
        setCoreFieldErrors({});
        setAttempted(false);
        setServerErrors([]);
    }, []);

    const reload = useCallback(async () => {
        if (mode !== "edit" || exercisePk == null) return;
        const result = await refetch();
        if (result.data) applyCatalog(result.data);
    }, [applyCatalog, exercisePk, mode, refetch]);

    useEffect(() => {
        if (mode === "create") {
            if (isAdopting) return;
            const empty = emptyDraft();
            setDraft(empty);
            setBaselineJson(JSON.stringify(empty));
            setHydratedPk(null);
            return;
        }
        if (catalog && catalog.id !== hydratedPk) {
            applyCatalog(catalog);
            setConflict(null);
        }
    }, [applyCatalog, catalog, hydratedPk, isAdopting, mode]);

    useEffect(() => {
        if (!isAdopting || libraryCandidate == null || !libraryCandidate.writable) return;
        if (libraryPrefilled.current) return;
        libraryPrefilled.current = true;
        const source = libraryCandidate.draft;
        const objective = source.objetivo_entrenamiento;
        const base = emptyDraft();
        const next: AdminCatalogFormDraft = {
            ...base,
            core: {
                ...base.core,
                nombre: source.nombre?.trim() || base.core.nombre,
                nombre_ingles: source.nombre_ingles,
                tipo: source.tipo || base.core.tipo,
                objetivo_entrenamiento:
                    objective === "strength" || objective === "cardiovascular" || objective === "mobility"
                        ? objective
                        : base.core.objetivo_entrenamiento,
                laterality: source.laterality || base.core.laterality,
                nivel: source.nivel ?? "",
            },
        };
        setDraft(next);
        setBaselineJson(JSON.stringify(next));
    }, [isAdopting, libraryCandidate]);

    const isDirty = useMemo(() => Boolean(baselineJson) && JSON.stringify(draft) !== baselineJson, [
        baselineJson,
        draft,
    ]);

    const techniqueSubmit = useMemo(
        () => resolveTechniqueSubmit(draft.technique, draft.saved_technique, techniqueMode),
        [draft.saved_technique, draft.technique, techniqueMode]
    );
    const techniqueErrors = useMemo(
        () =>
            attempted
                ? techniqueSubmit.fieldErrors
                : techniqueFieldErrors(techniqueFromDraft(draft.technique)),
        [attempted, draft.technique, techniqueSubmit.fieldErrors]
    );

    const persist = useCallback(async (): Promise<number | null> => {
        setAttempted(true);
        const result = validateCatalogBundleDraft(toBundleDraft(draft), techniqueSubmit.errors);
        setClientErrors(Object.fromEntries(result.bySection.map((s) => [s.section, s.messages])));
        setCoreFieldErrors(result.byField);
        const finalized = result.ok ? finalizeCatalogBundle(toBundleDraft(draft)) : null;
        if (!finalized) {
            onInvalid?.(result.bySection.map((s) => s.section));
            return null;
        }
        if (libraryNotice) {
            showError(libraryNotice);
            return null;
        }
        setServerErrors([]);
        const bundle = { ...finalized, technique: techniqueSubmit.payload };
        try {
            if (isAdopting && libraryCandidateId != null) {
                const adopted = await adoptLibraryCandidate({ candidateId: libraryCandidateId, body: bundle }).unwrap();
                showSuccess(LIBRARY_COPY.adoptedToast);
                return adopted.exercise_pk;
            }
            if (mode === "create") {
                const created = await createCatalog(bundle).unwrap();
                applyCatalog(created);
                showSuccess(ADMIN_CATALOG_COPY.createdToast);
                return created.id;
            }
            if (exercisePk == null || !draft.expected_updated_at) return null;
            const updated = await updateCatalog({
                exercisePk,
                body: { ...bundle, reviewed: draft.reviewed, expected_updated_at: draft.expected_updated_at },
            }).unwrap();
            applyCatalog(updated);
            showSuccess(ADMIN_CATALOG_COPY.savedToast);
            return updated.id;
        } catch (err) {
            const refused = libraryRefusalMessage(err);
            const concurrency = parseCatalogConcurrencyError(err);
            const validation = parseCatalogValidationErrors(err);
            if (refused) setServerErrors([refused]);
            else if (concurrency) setConflict(concurrency);
            else if (validation.length > 0) setServerErrors(validation);
            else showError("No se pudo guardar el ejercicio");
            return null;
        }
    }, [
        adoptLibraryCandidate,
        applyCatalog,
        createCatalog,
        draft,
        exercisePk,
        isAdopting,
        libraryCandidateId,
        libraryNotice,
        mode,
        onInvalid,
        showError,
        showSuccess,
        techniqueSubmit,
        updateCatalog,
    ]);

    /** Guarda; en la cola de revisión, `advance` pasa al siguiente ejercicio. */
    const handleSave = useCallback(
        async (advance: boolean) => {
            const pk = await persist();
            if (pk == null) return;
            if (mode === "create") {
                navigate(`/dashboard/admin/catalog/${pk}`, { replace: true });
                return;
            }
            if (!advance || !queue.inQueue) return;
            if (queue.nextPk == null) {
                showSuccess(FICHA_COPY.savedAndNextDone);
                navigate("/dashboard/admin/catalog");
                return;
            }
            navigate(`/dashboard/admin/catalog/${queue.nextPk}`);
        },
        [mode, navigate, persist, queue.inQueue, queue.nextPk, showSuccess]
    );

    const handleBack = useCallback(() => {
        if (isDirty) setDiscardOpen(true);
        else goBack();
    }, [goBack, isDirty]);

    const handleReloadConflict = useCallback(async () => {
        setConflict(null);
        await reload();
    }, [reload]);

    return {
        draft,
        setDraft,
        isDirty,
        isLoadingCatalog:
            (mode === "edit" && (isLoadingCatalog || awaitingHydration)) || (isAdopting && isLoadingLibrary),
        isCatalogError: mode === "edit" && isCatalogError,
        isAdopting,
        libraryNotice,
        isSaving,
        clientErrors,
        coreFieldErrors,
        techniqueErrors,
        serverErrors,
        conflict,
        setConflict,
        historyOpen,
        setHistoryOpen,
        discardOpen,
        setDiscardOpen,
        queue,
        applyCatalog,
        reload,
        refetch,
        handleSave,
        handleBack,
        goBack,
        handleReloadConflict,
        isInactive: draft.core.is_active === false,
        currentPk: mode === "edit" ? exercisePk : hydratedPk,
    };
}
