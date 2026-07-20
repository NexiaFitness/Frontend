/**
 * WeeklyStructureEditor.tsx — Editor de estructura semanal para bloques de periodización
 *
 * Contexto:
 * - Fase 5 de SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 * - Permite al entrenador definir qué patrones de movimiento corresponden a cada día
 *   de cada semana dentro de un bloque de periodización.
 *
 * Responsabilidades:
 * - Cargar estructura semanal vía RTK Query.
 * - Cargar catálogo de movement patterns vía RTK Query.
 * - Crear, editar y eliminar semanas con días y patrones.
 * - Sin lógica de negocio en JSX más allá de formateo y validación de UI.
 *
 * Arquitectura:
 * - Estado local gestiona el formulario de edición de una semana (draft).
 * - Mutaciones disparan invalidación de cache RTK (`WeeklyStructure`).
 * - TabsBar para navegar semanas; cada semana renderiza 7 días.
 *
 * @author Frontend Team
 * @since v6.3.0 — Fase 5 SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 */

import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { Plus, Trash2, Save, Layers, CalendarRange, Copy } from "lucide-react";

import {
    useGetWeeklyStructureQuery,
    useCreateWeeklyStructureWeekMutation,
    useUpdateWeeklyStructureWeekMutation,
    useDeleteWeeklyStructureWeekMutation,
    useRepeatWeeklyStructureWeekMutation,
} from "@nexia/shared/api/weeklyStructureApi";
import { useGetMovementPatternsQuery } from "@nexia/shared/api/exercisesApi";
import type {
    WeeklyStructureWeek,
    WeeklyStructureWeekCreate,
    WeeklyStructureDayInput,
    WeeklyStructureDayPatternInput,
} from "@nexia/shared/types/weeklyStructure";
import type { MovementPattern } from "@nexia/shared/types/exercise";
import {
    formatCalendarWeekRange,
    getMutationErrorMessage,
    UI_BUCKET_LABELS,
    UI_BUCKET_ORDER,
    generateSyntheticWeeks,
    mergeWeeklyStructureWeeks,
} from "@nexia/shared";
import { PatternBadge } from "./PatternBadge";

import { Button } from "@/components/ui/buttons";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_LABELS: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
};

const DEFAULT_DAYS: WeeklyStructureDayInput[] = Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i + 1,
    patterns: [],
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEmptyWeek(ordinal: number): WeeklyStructureWeekCreate {
    return {
        week_ordinal: ordinal,
        label: null,
        days: DEFAULT_DAYS.map((d) => ({ ...d })),
    };
}

function cloneWeekCreate(week: WeeklyStructureWeek): WeeklyStructureWeekCreate {
    return {
        week_ordinal: week.week_ordinal,
        label: week.label,
        days: week.days.map((d) => ({
            day_of_week: d.day_of_week,
            patterns: d.patterns.map((p) => ({
                movement_pattern_id: p.movement_pattern_id,
                sub_pattern: p.sub_pattern ?? null,
            })),
        })),
    };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeeklyStructureEditorProps {
    planId: number;
    blockId: number;
    block?: {
        start_date: string;
        end_date: string;
    } | null;
    /** Semana calendario del bloque a abrir (query ?week=). */
    initialWeekOrdinal?: number | null;
    /** true cuando create/edit o un modal local está abierto */
    onBusyChange?: (busy: boolean) => void;
}

export interface WeeklyStructureEditorHandle {
    /** true si se canceló edición o se cerró un overlay (quedarse en la página) */
    stepBack: () => boolean;
}

type EditorMode = "view" | "create" | "edit";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DayEditorProps {
    day: WeeklyStructureDayInput;
    patternsCatalog: MovementPattern[];
    patternsLoading?: boolean;
    patternsError?: boolean;
    readOnly?: boolean;
    onChange: (updated: WeeklyStructureDayInput) => void;
}

const DayEditor: React.FC<DayEditorProps> = ({
    day,
    patternsCatalog,
    patternsLoading,
    patternsError,
    readOnly = false,
    onChange,
}) => {
    const togglePattern = useCallback(
        (patternId: number) => {
            if (readOnly) return;
            const exists = day.patterns.some((p) => p.movement_pattern_id === patternId);
            let nextPatterns: WeeklyStructureDayPatternInput[];
            if (exists) {
                nextPatterns = day.patterns.filter((p) => p.movement_pattern_id !== patternId);
            } else {
                nextPatterns = [...day.patterns, { movement_pattern_id: patternId, sub_pattern: null }];
            }
            onChange({ ...day, patterns: nextPatterns });
        },
        [day, onChange, readOnly]
    );

    const isSelected = (id: number) => day.patterns.some((p) => p.movement_pattern_id === id);

    const groupedPatterns = useMemo(() => {
        const map = new Map<string, MovementPattern[]>();
        for (const p of patternsCatalog) {
            const bucket = (p.ui_bucket || "ACCESSORY").toString().toUpperCase();
            if (!map.has(bucket)) map.set(bucket, []);
            map.get(bucket)!.push(p);
        }
        // Ordenar grupos según UI_BUCKET_ORDER y patrones dentro de cada grupo por id
        const ordered: { bucket: string; label: string; patterns: MovementPattern[] }[] = [];
        for (const bucket of UI_BUCKET_ORDER) {
            const list = map.get(bucket);
            if (list && list.length > 0) {
                ordered.push({ bucket, label: UI_BUCKET_LABELS[bucket], patterns: list.sort((a, b) => a.id - b.id) });
            }
        }
        // Añadir cualquier bucket no conocido al final (defensivo)
        for (const [bucket, list] of map) {
            if (!UI_BUCKET_ORDER.includes(bucket as typeof UI_BUCKET_ORDER[number])) {
                ordered.push({ bucket, label: bucket, patterns: list.sort((a, b) => a.id - b.id) });
            }
        }
        return ordered;
    }, [patternsCatalog]);

    const hasPatterns = day.patterns.length > 0;

    return (
        <div
            className={cn(
                "w-full min-w-0 flex flex-col rounded-lg border overflow-hidden",
                hasPatterns
                    ? "border-primary/30 border-l-[3px] border-l-primary bg-card shadow-[0_0_0_1px_hsl(var(--primary)/0.08),inset_3px_0_12px_-8px_hsl(var(--primary)/0.3)]"
                    : "border-border/60 bg-surface-2/30",
            )}
        >
            <div
                className={cn(
                    "flex items-center gap-2 border-b border-border/50 px-4 py-2.5",
                    hasPatterns ? "bg-primary/[0.06]" : "bg-surface/40",
                )}
            >
                <span
                    className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        hasPatterns
                            ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.55)]"
                            : "bg-muted-foreground/40",
                    )}
                    aria-hidden
                />
                <span className="text-sm font-semibold text-foreground">
                    {DAY_LABELS[day.day_of_week]}
                </span>
                {hasPatterns && (
                    <span className="ml-auto inline-flex items-center rounded-md border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-primary">
                        {day.patterns.length}{" "}
                        {day.patterns.length === 1 ? "patrón" : "patrones"}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-0 p-4 w-full min-w-0">
                {patternsLoading && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                        Cargando patrones...
                    </span>
                )}
                {!patternsLoading && patternsError && (
                    <span className="text-xs text-muted-foreground">
                        Patrones no disponibles
                    </span>
                )}
                {!patternsLoading && !patternsError && patternsCatalog.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                        No hay patrones en el catálogo
                    </span>
                )}
                {!patternsLoading &&
                    groupedPatterns.map((group) => (
                        <div
                            key={group.bucket}
                            className="flex flex-col gap-2 py-2.5 border-b border-border/40 last:border-0 sm:flex-row sm:items-start sm:gap-4 w-full min-w-0"
                        >
                            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:w-36 sm:pt-1">
                                {group.label}
                            </span>
                            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                                {group.patterns.map((pattern) => (
                                    <PatternBadge
                                        key={pattern.id}
                                        name={pattern.name_es || pattern.name_en}
                                        uiBucket={pattern.ui_bucket}
                                        active={isSelected(pattern.id)}
                                        as={readOnly ? "span" : "button"}
                                        onClick={
                                            readOnly
                                                ? undefined
                                                : () => togglePattern(pattern.id)
                                        }
                                        className="!py-0.5 !text-[10px]"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const WeeklyStructureEditor = forwardRef<
    WeeklyStructureEditorHandle,
    WeeklyStructureEditorProps
>(function WeeklyStructureEditor({ planId, blockId, block, initialWeekOrdinal, onBusyChange }, ref) {
    const { showSuccess, showError } = useToast();

    const {
        data: structure,
        isLoading: isLoadingStructure,
        isError: isErrorStructure,
        error: errorStructure,
    } = useGetWeeklyStructureQuery({ planId, blockId });

    const {
        data: patternsCatalog,
        isLoading: isLoadingPatterns,
        isError: isErrorPatterns,
        refetch: refetchPatterns,
    } = useGetMovementPatternsQuery({ limit: 100, is_active: true });

    const [createWeek, { isLoading: isCreating }] = useCreateWeeklyStructureWeekMutation();
    const [updateWeek, { isLoading: isUpdating }] = useUpdateWeeklyStructureWeekMutation();
    const [deleteWeek, { isLoading: isDeleting }] = useDeleteWeeklyStructureWeekMutation();
    const [repeatWeek, { isLoading: isRepeating }] = useRepeatWeeklyStructureWeekMutation();

    const [mode, setMode] = useState<EditorMode>("view");
    const [editingWeekId, setEditingWeekId] = useState<number | null>(null);
    const [draft, setDraft] = useState<WeeklyStructureWeekCreate | null>(null);
    const [activeWeekOrdinal, setActiveWeekOrdinal] = useState<string>("");
    const [deleteTarget, setDeleteTarget] = useState<WeeklyStructureWeek | null>(null);

    // Repeat week modal state
    const [repeatModalOpen, setRepeatModalOpen] = useState(false);
    const [repeatTargetWeek, setRepeatTargetWeek] = useState<WeeklyStructureWeek | null>(null);
    const [selectedTargetOrdinals, setSelectedTargetOrdinals] = useState<number[]>([]);
    const [forceRepeat, setForceRepeat] = useState(false);
    const [repeatConflictMessage, setRepeatConflictMessage] = useState<string | null>(null);

    const realWeeks = useMemo(() => structure?.weeks ?? [], [structure]);
    const syntheticWeeks = useMemo(() => {
        if (!block?.start_date || !block?.end_date) return [];
        return generateSyntheticWeeks(block.start_date, block.end_date);
    }, [block?.start_date, block?.end_date]);

    const weeks = useMemo(
        () => mergeWeeklyStructureWeeks(realWeeks, syntheticWeeks),
        [realWeeks, syntheticWeeks]
    );

    const activeWeek = useMemo(() => {
        if (!activeWeekOrdinal) return weeks[0] ?? null;
        return weeks.find((w) => String(w.week_ordinal) === activeWeekOrdinal) ?? weeks[0] ?? null;
    }, [weeks, activeWeekOrdinal]);

    React.useEffect(() => {
        if (weeks.length === 0) return;

        if (initialWeekOrdinal != null && initialWeekOrdinal > 0) {
            const target = String(initialWeekOrdinal);
            if (weeks.some((w) => String(w.week_ordinal) === target)) {
                setActiveWeekOrdinal(target);
                return;
            }
        }

        const current = activeWeekOrdinal || String(weeks[0].week_ordinal);
        const exists = weeks.some((w) => String(w.week_ordinal) === current);
        if (!exists) {
            setActiveWeekOrdinal(String(weeks[0].week_ordinal));
        } else if (!activeWeekOrdinal) {
            setActiveWeekOrdinal(current);
        }
    }, [weeks, initialWeekOrdinal, activeWeekOrdinal]);

    const handleStartCreate = useCallback(() => {
        const nextOrdinal = weeks.length > 0 ? Math.max(...weeks.map((w) => w.week_ordinal)) + 1 : 1;
        setDraft(createEmptyWeek(nextOrdinal));
        setMode("create");
        setEditingWeekId(null);
    }, [weeks]);

    const handleStartEdit = useCallback((week: WeeklyStructureWeek) => {
        setDraft(cloneWeekCreate(week));
        // Si la semana no tiene id persistido, tratamos como creación
        if (week.id == null) {
            setMode("create");
            setEditingWeekId(null);
        } else {
            setMode("edit");
            setEditingWeekId(week.id);
        }
    }, []);

    const handleCancel = useCallback(() => {
        setMode("view");
        setDraft(null);
        setEditingWeekId(null);
    }, []);

    const isEditing = mode === "create" || mode === "edit";
    const hasLocalOverlay = repeatModalOpen || !!deleteTarget;

    React.useEffect(() => {
        onBusyChange?.(isEditing || hasLocalOverlay);
    }, [isEditing, hasLocalOverlay, onBusyChange]);

    useImperativeHandle(
        ref,
        () => ({
            stepBack: () => {
                if (repeatModalOpen) {
                    setRepeatModalOpen(false);
                    setRepeatTargetWeek(null);
                    setSelectedTargetOrdinals([]);
                    setForceRepeat(false);
                    setRepeatConflictMessage(null);
                    return true;
                }
                if (deleteTarget) {
                    setDeleteTarget(null);
                    return true;
                }
                if (isEditing) {
                    handleCancel();
                    return true;
                }
                return false;
            },
        }),
        [
            repeatModalOpen,
            deleteTarget,
            isEditing,
            handleCancel,
        ],
    );

    const handleSave = useCallback(async () => {
        if (!draft) return;
        try {
            if (mode === "create") {
                await createWeek({ planId, blockId, body: draft }).unwrap();
                showSuccess("Semana creada correctamente.");
            } else if (mode === "edit" && editingWeekId != null) {
                await updateWeek({ planId, blockId, weekId: editingWeekId, body: draft }).unwrap();
                showSuccess("Semana actualizada correctamente.");
            }
            setMode("view");
            setDraft(null);
            setEditingWeekId(null);
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    }, [draft, mode, editingWeekId, planId, blockId, createWeek, updateWeek, showSuccess, showError]);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget?.id) return;
        try {
            await deleteWeek({ planId, blockId, weekId: deleteTarget.id }).unwrap();
            showSuccess("Semana eliminada correctamente.");
            setDeleteTarget(null);
            setMode("view");
            setDraft(null);
            setEditingWeekId(null);
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    }, [deleteTarget, planId, blockId, deleteWeek, showSuccess, showError]);

    const handleOpenRepeatModal = useCallback((week: WeeklyStructureWeek) => {
        setRepeatTargetWeek(week);
        setSelectedTargetOrdinals([]);
        setForceRepeat(false);
        setRepeatConflictMessage(null);
        setRepeatModalOpen(true);
    }, []);

    const handleConfirmRepeat = useCallback(async () => {
        if (!repeatTargetWeek) return;
        if (selectedTargetOrdinals.length === 0) {
            showError("Selecciona al menos una semana destino.");
            return;
        }
        try {
            const result = await repeatWeek({
                planId,
                blockId,
                weekOrdinal: repeatTargetWeek.week_ordinal,
                body: {
                    target_week_ordinals: selectedTargetOrdinals,
                    force: forceRepeat,
                },
            }).unwrap();
            showSuccess(
                `Semana repetida en ${result.copied_week_ordinals.length} semana(s). ${result.sessions_copied} sesión(es) copiadas.`
            );
            setRepeatModalOpen(false);
            setRepeatTargetWeek(null);
            setSelectedTargetOrdinals([]);
            setForceRepeat(false);
            setRepeatConflictMessage(null);
        } catch (err: unknown) {
            const errorObj = err as { status?: number; data?: { detail?: string } };
            if (errorObj.status === 409 && !forceRepeat) {
                setRepeatConflictMessage(
                    errorObj.data?.detail || "Ya existen sesiones en las semanas seleccionadas."
                );
                setForceRepeat(true);
                return;
            }
            showError(getMutationErrorMessage(err));
        }
    }, [repeatTargetWeek, selectedTargetOrdinals, forceRepeat, planId, blockId, repeatWeek, showSuccess, showError]);

    const toggleTargetOrdinal = useCallback((ordinal: number) => {
        setSelectedTargetOrdinals((prev) =>
            prev.includes(ordinal) ? prev.filter((o) => o !== ordinal) : [...prev, ordinal]
        );
    }, []);

    const updateDraftDay = useCallback((dayOfWeek: number, updated: WeeklyStructureDayInput) => {
        setDraft((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                days: prev.days.map((d) => (d.day_of_week === dayOfWeek ? updated : d)),
            };
        });
    }, []);

    const isMutating = isCreating || isUpdating || isDeleting || isRepeating;

    // -----------------------------------------------------------------------
    // Loading / Error states
    // -----------------------------------------------------------------------

    if (isLoadingStructure) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isErrorStructure) {
        return (
            <div className="py-6">
                <Alert variant="error">
                    <p className="font-medium">Error al cargar la estructura semanal</p>
                    <p className="text-sm opacity-90">
                        {getMutationErrorMessage(errorStructure) || "Intenta de nuevo más tarde."}
                    </p>
                </Alert>
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    const displayWeek = isEditing && draft ? draft : activeWeek;

    const activeOrdinal = displayWeek?.week_ordinal ?? 0;
    const weekRangeLabel =
        block?.start_date && activeOrdinal > 0
            ? formatCalendarWeekRange(activeOrdinal, block.start_date)
            : null;

    const daysSource =
        isEditing && draft
            ? draft.days
            : (displayWeek as WeeklyStructureWeek | null)?.days ?? [];

    const visibleDays = isEditing
        ? daysSource
        : daysSource.filter((d) => d.patterns.length > 0);

    const selectedTabId =
        activeWeekOrdinal || (weeks[0] ? String(weeks[0].week_ordinal) : "");

    const viewWeek =
        !isEditing && displayWeek ? (displayWeek as WeeklyStructureWeek) : null;

    return (
        <>
        <div className="w-full min-w-0 rounded-lg bg-surface p-5 flex flex-col gap-4">
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <Layers className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <p className="text-sm font-semibold text-foreground">Estructura semanal</p>
                </div>
                {!isEditing && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartCreate}
                        disabled={isMutating}
                        className="shrink-0"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Añadir semana
                    </Button>
                )}
            </div>

            {block?.start_date && block?.end_date && (
                <section
                    aria-label="Rango del bloque"
                    className="shrink-0 rounded-lg border border-primary/45 bg-primary/[0.08] px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2"
                >
                    <div className="flex items-center gap-1.5 min-w-0">
                        <CalendarRange
                            className="h-3.5 w-3.5 shrink-0 text-primary/70"
                            aria-hidden
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Bloque
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                        {block.start_date} — {block.end_date}
                    </p>
                    {weekRangeLabel && (
                        <span className="text-xs text-muted-foreground">
                            Semana activa:{" "}
                            <span className="text-primary font-medium">{weekRangeLabel}</span>
                        </span>
                    )}
                </section>
            )}

            {weeks.length > 0 && !isEditing && (
                <div
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 w-full min-w-0"
                    role="tablist"
                    aria-label="Semanas del bloque"
                >
                    {weeks.map((w) => {
                        const id = String(w.week_ordinal);
                        const isActive = selectedTabId === id;
                        const range =
                            block?.start_date != null
                                ? formatCalendarWeekRange(
                                      w.week_ordinal,
                                      block.start_date,
                                  )
                                : "";
                        return (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveWeekOrdinal(id)}
                                className={cn(
                                    "flex w-full min-w-0 flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-all",
                                    isActive
                                        ? "border-primary/45 bg-primary/[0.12] shadow-[0_0_14px_-6px_hsl(var(--primary)/0.45)]"
                                        : "border-border/60 bg-surface-2/30 hover:border-primary/30",
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                                            isActive
                                                ? "border-primary/50 bg-primary/[0.12] text-primary"
                                                : "border-primary/30 bg-primary/[0.06] text-primary/90",
                                        )}
                                    >
                                        S{w.week_ordinal}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-sm font-semibold truncate",
                                            isActive
                                                ? "text-foreground"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {w.label ?? `Semana ${w.week_ordinal}`}
                                    </span>
                                </div>
                                {range && (
                                    <p className="text-[10px] text-muted-foreground pl-9 truncate">
                                        {range}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {!isEditing && realWeeks.length === 0 && syntheticWeeks.length === 0 && (
                <div className="rounded-lg border border-dashed border-primary/25 bg-primary/[0.04] p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        No hay semanas definidas en este bloque.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Crea la primera semana para asignar patrones de movimiento a cada día.
                    </p>
                </div>
            )}

            {displayWeek && (
                <div className="w-full min-w-0 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                        {isEditing ? (
                            <>
                                <span className="inline-flex items-center rounded-md border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                    S{draft?.week_ordinal}
                                </span>
                                {weekRangeLabel && (
                                    <span className="text-xs text-muted-foreground">
                                        {weekRangeLabel}
                                    </span>
                                )}
                            </>
                        ) : (
                            displayWeek.label ? (
                                <span className="text-sm font-medium text-foreground">
                                    {displayWeek.label}
                                </span>
                            ) : null
                        )}
                    </div>

                    {isErrorPatterns && (
                        <Alert variant="warning" className="text-sm">
                            <p className="font-medium">
                                No se pudieron cargar los patrones de movimiento
                            </p>
                            <p className="opacity-90">
                                El catálogo no está disponible.
                            </p>
                            <button
                                type="button"
                                onClick={() => refetchPatterns()}
                                className="mt-1 text-xs underline hover:no-underline"
                            >
                                Reintentar
                            </button>
                        </Alert>
                    )}

                    {visibleDays.length === 0 && !isEditing ? (
                        <p className="text-sm text-muted-foreground py-4 text-center rounded-lg border border-dashed border-border/60">
                            Esta semana no tiene días con patrones asignados. Pulsa Editar
                            para configurarla.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full min-w-0">
                            {visibleDays.map((day) => (
                                <DayEditor
                                    key={day.day_of_week}
                                    day={day}
                                    patternsCatalog={patternsCatalog ?? []}
                                    patternsLoading={isLoadingPatterns}
                                    patternsError={isErrorPatterns}
                                    readOnly={!isEditing}
                                    onChange={(updated) =>
                                        updateDraftDay(day.day_of_week, updated)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

            {isEditing && (
                <DashboardFixedFooter>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline-destructive"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isMutating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            isLoading={isMutating}
                            disabled={isMutating}
                        >
                            <Save className="mr-1 h-4 w-4" aria-hidden />
                            Guardar semana
                        </Button>
                    </div>
                </DashboardFixedFooter>
            )}

            {viewWeek && !isEditing && (
                <DashboardFixedFooter>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleOpenRepeatModal(viewWeek)}
                            disabled={isMutating || viewWeek.id == null}
                        >
                            <Copy className="mr-1 h-4 w-4" aria-hidden />
                            Repetir
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(viewWeek)}
                            disabled={isMutating}
                        >
                            Editar
                        </Button>
                        <Button
                            variant="outline-destructive"
                            size="sm"
                            onClick={() => setDeleteTarget(viewWeek)}
                            disabled={isMutating || viewWeek.id == null}
                        >
                            <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                            Eliminar
                        </Button>
                    </div>
                </DashboardFixedFooter>
            )}

            {/* Delete confirmation modal */}
            <BaseModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Eliminar semana"
                description={`¿Eliminar ${deleteTarget?.label || `Semana ${deleteTarget?.week_ordinal}`}? Esta acción no se puede deshacer.`}
                iconType="danger"
                maxWidth="sm"
            >
                <div className="flex items-center justify-end gap-2 pt-4">
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleConfirmDelete}
                        isLoading={isDeleting}
                    >
                        Eliminar
                    </Button>
                </div>
            </BaseModal>

            {/* Repeat week modal */}
            <BaseModal
                isOpen={repeatModalOpen}
                onClose={() => {
                    setRepeatModalOpen(false);
                    setRepeatTargetWeek(null);
                    setSelectedTargetOrdinals([]);
                    setForceRepeat(false);
                    setRepeatConflictMessage(null);
                }}
                title={`Repetir ${repeatTargetWeek?.label || `Semana ${repeatTargetWeek?.week_ordinal}`}`}
                description="Selecciona las semanas destino donde copiar la estructura y las sesiones."
                iconType="info"
                maxWidth="md"
            >
                <div className="space-y-4">
                    {/* Conflict warning */}
                    {repeatConflictMessage && (
                        <Alert variant="warning" className="text-sm">
                            <p className="font-medium">Conflicto detectado</p>
                            <p className="opacity-90">{repeatConflictMessage}</p>
                            <p className="opacity-90 mt-1">Activa &quot;Sobrescribir existentes&quot; para forzar la copia.</p>
                        </Alert>
                    )}

                    {/* Target week ordinals */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Semanas destino</p>
                        <div className="flex flex-wrap gap-2">
                            {(() => {
                                if (!repeatTargetWeek) return null;
                                const maxOrdinal = Math.max(
                                    ...weeks.map((w) => w.week_ordinal),
                                    repeatTargetWeek.week_ordinal
                                );
                                const allOrdinals = Array.from(
                                    { length: maxOrdinal + 4 },
                                    (_, i) => i + 1
                                ).filter((o) => o !== repeatTargetWeek.week_ordinal);
                                return allOrdinals.map((ordinal) => {
                                    const exists = weeks.some((w) => w.week_ordinal === ordinal);
                                    const selected = selectedTargetOrdinals.includes(ordinal);
                                    return (
                                        <label
                                            key={ordinal}
                                            className={`
                                                inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors
                                                ${selected
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border bg-surface text-muted-foreground hover:bg-accent"
                                                }
                                                ${exists && !selected ? "opacity-70" : ""}
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={selected}
                                                onChange={() => toggleTargetOrdinal(ordinal)}
                                            />
                                            Semana {ordinal}
                                            {exists && <span className="text-[10px] opacity-60">(existe)</span>}
                                        </label>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Force override */}
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                            type="checkbox"
                            checked={forceRepeat}
                            onChange={(e) => setForceRepeat(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        Sobrescribir semanas existentes
                    </label>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setRepeatModalOpen(false);
                                setRepeatTargetWeek(null);
                                setSelectedTargetOrdinals([]);
                                setForceRepeat(false);
                                setRepeatConflictMessage(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleConfirmRepeat}
                            isLoading={isRepeating}
                            disabled={isRepeating || selectedTargetOrdinals.length === 0}
                        >
                            Repetir semana
                        </Button>
                    </div>
                </div>
            </BaseModal>
        </>
    );
});
