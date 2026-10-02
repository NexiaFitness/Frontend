/**
 * BlockWeeksManageSurface.tsx — Gestión post-creación de semanas (personalizar / restaurar).
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { X } from "lucide-react";

import {
    classifyWeeksByTemplate,
    getMutationErrorMessage,
    isWeeklyStructureDirty,
    weeklyStructureDraftsEqual,
} from "@nexia/shared";
import { useGetWeeklyStructureQuery } from "@nexia/shared/api/weeklyStructureApi";
import {
    useCreateWeeklyStructureWeekMutation,
    useUpdateWeeklyStructureWeekMutation,
    useSyncRecurringWeeklyStructureMutation,
} from "@nexia/shared/api/weeklyStructureApi";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";
import type { Client, TrainingDayValue } from "@nexia/shared/types/client";

import { Button } from "@/components/ui/buttons";
import { Alert, useToast } from "@/components/ui/feedback";
import { DiscardUnsavedChangesModal } from "@/components/ui/modals";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";

import { PeriodizationWeeklyStructureEditor } from "./PeriodizationWeeklyStructureEditor";
import {
    cloneWeeklyStructureDraft,
    persistBlockStructureEdit,
    serverReflectsWeeklyStructureSave,
    weeklyStructureToDraft,
} from "./periodBlockPersistence";
import {
    promoteWeekOrdinalToTemplate,
    restoreWeekFromTemplate,
} from "./periodizationWeeklyStructureUtils";
import {
    AUTHORING_FOOTER_INNER_CLASS,
    AUTHORING_HEADER_CLASS,
    AUTHORING_STEP_CARD_CLASS,
    AUTHORING_STEP_META_CLASS,
    AUTHORING_SUBTITLE_CLASS,
    AUTHORING_SURFACE_CLASS,
    AUTHORING_TITLE_CLASS,
} from "./phaseAuthoringPresentation";

interface Props {
    planId: number;
    block: PlanPeriodBlock;
    clientProfile?: Client | null;
    patternsCatalog: MovementPattern[];
    patternsLoading?: boolean;
    patternsError?: boolean;
    onExit: () => void;
}

const ISO_TO_TRAINING_DAY: Record<number, TrainingDayValue> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
};

function structureDaysToTrainingDays(
    structure: readonly WeeklyStructureWeekCreate[],
): TrainingDayValue[] {
    const week1 = structure.find((w) => w.week_ordinal === 1);
    if (!week1) return [];
    return week1.days
        .map((d) => ISO_TO_TRAINING_DAY[d.day_of_week])
        .filter((d): d is TrainingDayValue => d != null);
}

export const BlockWeeksManageSurface: React.FC<Props> = ({
    planId,
    block,
    clientProfile,
    patternsCatalog,
    patternsLoading,
    patternsError,
    onExit,
}) => {
    const { showSuccess, showWarning, showError } = useToast();
    const [draft, setDraft] = useState<WeeklyStructureWeekCreate[]>([]);
    const [baseline, setBaseline] = useState<WeeklyStructureWeekCreate[]>([]);
    const [loaded, setLoaded] = useState(false);
    /** Refs para hidratación: detectar dirty sin depender del cierre del efecto. */
    const draftRef = useRef(draft);
    const baselineRef = useRef(baseline);
    draftRef.current = draft;
    baselineRef.current = baseline;

    const { data: existingStructure, isLoading, refetch } = useGetWeeklyStructureQuery(
        { planId, blockId: block.id },
        { refetchOnMountOrArgChange: true },
    );

    const [createWeek] = useCreateWeeklyStructureWeekMutation();
    const [updateWeek] = useUpdateWeeklyStructureWeekMutation();
    const [syncRecurring] = useSyncRecurringWeeklyStructureMutation();
    const [isSaving, setIsSaving] = useState(false);
    const [discardModalOpen, setDiscardModalOpen] = useState(false);

    const setDraftSynced = useCallback(
        (
            value:
                | WeeklyStructureWeekCreate[]
                | ((
                      prev: WeeklyStructureWeekCreate[],
                  ) => WeeklyStructureWeekCreate[]),
        ) => {
            setDraft((prev) =>
                typeof value === "function" ? value(prev) : value,
            );
        },
        [],
    );

    const setBaselineSynced = useCallback(
        (value: WeeklyStructureWeekCreate[]) => {
            setBaseline(value);
        },
        [],
    );

    useEffect(() => {
        setLoaded(false);
        setDraft([]);
        setBaseline([]);
    }, [block.id]);

    /**
     * Hidratación desde servidor (cache inicial o respuesta fresca).
     * - Carga inicial: siembra draft + baseline.
     * - Respuesta fresca: sustituye seed cacheado solo si no hay cambios locales dirty.
     */
    useEffect(() => {
        if (!existingStructure) return;

        const next = weeklyStructureToDraft(existingStructure.weeks);
        const locallyDirty =
            loaded &&
            !weeklyStructureDraftsEqual(draftRef.current, baselineRef.current);

        if (locallyDirty) {
            return;
        }

        const draftSeed = cloneWeeklyStructureDraft(next);
        const baselineSeed = cloneWeeklyStructureDraft(next);
        setDraftSynced(draftSeed);
        setBaselineSynced(baselineSeed);
        setLoaded(true);
    }, [existingStructure, loaded, setDraftSynced, setBaselineSynced]);

    const isDirty = useMemo(
        () => loaded && isWeeklyStructureDirty(draft, baseline),
        [loaded, draft, baseline],
    );

    const weekKindByOrdinal = useMemo(
        () => classifyWeeksByTemplate(draft, 1),
        [draft],
    );

    const editorTrainingDays = useMemo(() => {
        const fromStructure = structureDaysToTrainingDays(draft);
        if (fromStructure.length > 0) return fromStructure;
        return clientProfile?.training_days ?? null;
    }, [draft, clientProfile?.training_days]);

    const handleRestoreWeek = useCallback(
        (weekOrdinal: number) => {
            setDraftSynced((prev) =>
                restoreWeekFromTemplate(prev, weekOrdinal),
            );
        },
        [setDraftSynced],
    );

    const handleExit = useCallback(() => {
        if (isDirty) {
            setDiscardModalOpen(true);
            return;
        }
        onExit();
    }, [isDirty, onExit]);

    const handleConfirmDiscard = useCallback(() => {
        setDiscardModalOpen(false);
        onExit();
    }, [onExit]);

    const handleSave = useCallback(async () => {
        if (!loaded || draft.length === 0) {
            showWarning("No hay estructura que guardar.");
            return;
        }
        if (weeklyStructureDraftsEqual(draft, baseline)) {
            showWarning("No hay cambios que guardar.");
            return;
        }
        setIsSaving(true);
        try {
            const baselineWasEmpty = baseline.length === 0;
            const saved = await persistBlockStructureEdit(
                planId,
                block.id,
                block.start_date,
                block.end_date,
                draft,
                baseline,
                existingStructure,
                updateWeek,
                createWeek,
                syncRecurring,
            );
            if (!saved) {
                showWarning("No hay cambios que guardar.");
                return;
            }

            const refetchResult = await refetch();
            if (!refetchResult.data?.weeks) {
                showError(
                    "No se pudo confirmar el guardado con el servidor. Revisa la conexión e inténtalo de nuevo.",
                );
                return;
            }

            const synced = weeklyStructureToDraft(refetchResult.data.weeks);
            if (
                !serverReflectsWeeklyStructureSave(
                    synced,
                    draft,
                    baselineWasEmpty,
                )
            ) {
                showError(
                    "El servidor no reflejó los cambios. Revisa la conexión e inténtalo de nuevo.",
                );
                return;
            }

            const persistedDraft = baselineWasEmpty ? synced : draft;
            const draftSynced = cloneWeeklyStructureDraft(persistedDraft);
            const baselineSynced = cloneWeeklyStructureDraft(synced);
            setDraftSynced(draftSynced);
            setBaselineSynced(baselineSynced);
            showSuccess("Semanas guardadas correctamente.");
        } catch (err) {
            showError(getMutationErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    }, [
        loaded,
        draft,
        baseline,
        planId,
        block.id,
        existingStructure,
        updateWeek,
        createWeek,
        syncRecurring,
        block.start_date,
        block.end_date,
        refetch,
        setDraftSynced,
        setBaselineSynced,
        showSuccess,
        showWarning,
        showError,
    ]);

    const label = `${block.start_date} — ${block.end_date}`;

    const orphanWeekOrdinals = useMemo(() => {
        if (!loaded || draft.length === 0) return [];
        if (draft.some((w) => w.week_ordinal === 1)) return [];
        return [...draft.map((w) => w.week_ordinal)].sort((a, b) => a - b);
    }, [loaded, draft]);

    const handlePromoteWeekToTemplate = useCallback(
        (sourceOrdinal: number) => {
            setDraftSynced((prev) =>
                promoteWeekOrdinalToTemplate(prev, sourceOrdinal),
            );
            showWarning(
                `Semana ${sourceOrdinal} copiada como semana tipo. Revisa el borrador y pulsa «Guardar semanas».`,
                8000,
            );
        },
        [setDraftSynced, showWarning],
    );

    return (
        <div
            className={AUTHORING_SURFACE_CLASS}
            data-testid="block-weeks-manage-surface"
        >
            <header className={AUTHORING_HEADER_CLASS}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className={AUTHORING_STEP_META_CLASS}>
                            Gestión de semanas
                        </p>
                        <h3 className={AUTHORING_TITLE_CLASS}>Ver semanas</h3>
                        <p className={AUTHORING_SUBTITLE_CLASS}>
                            Personaliza semanas concretas o restaura la semana
                            tipo. Bloque {label}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Cerrar gestión de semanas"
                        onClick={handleExit}
                        className="shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {orphanWeekOrdinals.length > 0 ? (
                <Alert variant="warning" className="mb-4">
                    <p className="text-sm leading-relaxed">
                        Falta la semana tipo (semana 1). El guardado desde el
                        asistente fallará hasta que exista. Elige una semana
                        existente para usarla como semana tipo:
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {orphanWeekOrdinals.map((ordinal) => (
                            <Button
                                key={ordinal}
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => handlePromoteWeekToTemplate(ordinal)}
                            >
                                Usar semana {ordinal} como semana tipo
                            </Button>
                        ))}
                    </div>
                </Alert>
            ) : null}

            <div className={AUTHORING_STEP_CARD_CLASS}>
                <NexiaGlassAccentRim />
                {isLoading && !loaded ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                        Cargando estructura semanal…
                    </p>
                ) : (
                    <PeriodizationWeeklyStructureEditor
                        startDate={block.start_date}
                        endDate={block.end_date}
                        trainingDays={editorTrainingDays}
                        patternsCatalog={patternsCatalog}
                        patternsLoading={patternsLoading}
                        patternsError={patternsError}
                        value={draft}
                        onChange={setDraftSynced}
                        showRangeHeader
                        mode="all"
                        weekKindByOrdinal={weekKindByOrdinal}
                        onRestoreWeek={handleRestoreWeek}
                        fillContainer={false}
                    />
                )}
            </div>

            <DashboardFixedFooter>
                <div className={AUTHORING_FOOTER_INNER_CLASS}>
                    <Button type="button" variant="outline" size="sm" onClick={handleExit}>
                        Volver
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        isLoading={isSaving}
                        disabled={isSaving || !isDirty}
                        onClick={() => void handleSave()}
                    >
                        Guardar semanas
                    </Button>
                </div>
            </DashboardFixedFooter>

            <DiscardUnsavedChangesModal
                isOpen={discardModalOpen}
                onConfirm={handleConfirmDiscard}
                onCancel={() => setDiscardModalOpen(false)}
            />
        </div>
    );
};
