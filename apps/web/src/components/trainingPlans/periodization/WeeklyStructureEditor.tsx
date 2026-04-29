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

import React, { useState, useCallback, useMemo } from "react";
import { Plus, Trash2, Save, X, Layers, CalendarDays, Copy } from "lucide-react";

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
import { getMutationErrorMessage, UI_BUCKET_LABELS, UI_BUCKET_ORDER, generateSyntheticWeeks, mergeWeeklyStructureWeeks } from "@nexia/shared";
import { PatternBadge } from "./PatternBadge";

import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { TabsBar } from "@/components/ui/tabs";
import { FormSelect } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { BaseModal } from "@/components/ui/modals/BaseModal";

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

const CORE_SUB_PATTERNS = [
    "anti-extensión",
    "anti-flexión",
    "anti-rotación",
    "anti-lateral-flexión",
    "rotación",
    "estabilidad",
];

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
    onChange: (updated: WeeklyStructureDayInput) => void;
}

const DayEditor: React.FC<DayEditorProps> = ({ day, patternsCatalog, patternsLoading, patternsError, onChange }) => {
    const togglePattern = useCallback(
        (patternId: number) => {
            const exists = day.patterns.some((p) => p.movement_pattern_id === patternId);
            let nextPatterns: WeeklyStructureDayPatternInput[];
            if (exists) {
                nextPatterns = day.patterns.filter((p) => p.movement_pattern_id !== patternId);
            } else {
                nextPatterns = [...day.patterns, { movement_pattern_id: patternId, sub_pattern: null }];
            }
            onChange({ ...day, patterns: nextPatterns });
        },
        [day, onChange]
    );

    const updateSubPattern = useCallback(
        (patternId: number, subPattern: string | null) => {
            const nextPatterns = day.patterns.map((p) =>
                p.movement_pattern_id === patternId ? { ...p, sub_pattern: subPattern } : p
            );
            onChange({ ...day, patterns: nextPatterns });
        },
        [day, onChange]
    );

    const isSelected = (id: number) => day.patterns.some((p) => p.movement_pattern_id === id);
    const selectedPattern = (id: number) => day.patterns.find((p) => p.movement_pattern_id === id);

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

    // Buscar patrón CORE por ui_bucket (no por nombre hardcodeado)
    const corePattern = useMemo(() => patternsCatalog.find((p) => p.ui_bucket === "CORE"), [patternsCatalog]);

    return (
        <div className="rounded-lg border border-border/60 bg-surface p-3 space-y-3">
            <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                    {DAY_LABELS[day.day_of_week]}
                </span>
                {day.patterns.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                        {day.patterns.length} patrón{day.patterns.length !== 1 ? "es" : ""}
                    </span>
                )}
            </div>

            <div className="space-y-2">
                {patternsLoading && (
                    <span className="text-xs text-muted-foreground animate-pulse">Cargando patrones...</span>
                )}
                {!patternsLoading && patternsError && (
                    <span className="text-xs text-muted-foreground">Patrones no disponibles</span>
                )}
                {!patternsLoading && !patternsError && patternsCatalog.length === 0 && (
                    <span className="text-xs text-muted-foreground">No hay patrones en el catálogo</span>
                )}
                {!patternsLoading && groupedPatterns.map((group) => (
                    <div key={group.bucket} className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {group.label}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {group.patterns.map((pattern) => (
                                <PatternBadge
                                    key={pattern.id}
                                    name={pattern.name_es || pattern.name_en}
                                    uiBucket={pattern.ui_bucket}
                                    active={isSelected(pattern.id)}
                                    onClick={() => togglePattern(pattern.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sub-pattern selector for CORE — show only if CORE pattern is selected */}
            {(() => {
                if (!corePattern) return null;
                const coreSelected = selectedPattern(corePattern.id);
                if (!coreSelected) return null;
                return (
                    <div className="pt-1 border-t border-border/40">
                        <FormSelect
                            size="sm"
                            label="Sub-patrón CORE"
                            placeholder="Selecciona sub-patrón..."
                            value={coreSelected.sub_pattern ?? ""}
                            options={[
                                { value: "", label: "— Ninguno —" },
                                ...CORE_SUB_PATTERNS.map((sp) => ({ value: sp, label: sp })),
                            ]}
                            onChange={(e) => updateSubPattern(corePattern.id, e.target.value || null)}
                        />
                    </div>
                );
            })()}
        </div>
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const WeeklyStructureEditor: React.FC<WeeklyStructureEditorProps> = ({ planId, blockId, block }) => {
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
        if (realWeeks.length > 0 || !block?.start_date || !block?.end_date) return [];
        return generateSyntheticWeeks(block.start_date, block.end_date);
    }, [realWeeks.length, block]);

    const weeks = useMemo(
        () => mergeWeeklyStructureWeeks(realWeeks, syntheticWeeks),
        [realWeeks, syntheticWeeks]
    );

    const tabItems = useMemo(() => {
        const items = weeks.map((w) => ({
            id: String(w.week_ordinal),
            label: w.label ? `${w.label} (S${w.week_ordinal})` : `Semana ${w.week_ordinal}`,
        }));
        return items;
    }, [weeks]);

    const activeWeek = useMemo(() => {
        if (!activeWeekOrdinal) return weeks[0] ?? null;
        return weeks.find((w) => String(w.week_ordinal) === activeWeekOrdinal) ?? weeks[0] ?? null;
    }, [weeks, activeWeekOrdinal]);

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

    const isEditing = mode === "create" || mode === "edit";
    const displayWeek = isEditing && draft ? draft : activeWeek;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">Estructura semanal</h3>
                </div>
                {!isEditing && (
                    <Button variant="outline" size="sm" onClick={handleStartCreate} disabled={isMutating}>
                        <Plus className="h-4 w-4 mr-1" />
                        Añadir semana
                    </Button>
                )}
            </div>

            {/* Tabs */}
            {weeks.length > 0 && !isEditing && (
                <TabsBar
                    items={tabItems}
                    value={activeWeekOrdinal || (weeks[0] ? String(weeks[0].week_ordinal) : "")}
                    onChange={setActiveWeekOrdinal}
                    ariaLabel="Semanas del bloque"
                />
            )}

            {/* Empty state */}
            {!isEditing && realWeeks.length === 0 && syntheticWeeks.length === 0 && (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        No hay semanas definidas en este bloque.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Crea la primera semana para asignar patrones de movimiento a cada día.
                    </p>
                </div>
            )}

            {/* Week editor / viewer */}
            {displayWeek && (
                <div className="space-y-4">
                    {/* Week header */}
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <Input
                                    size="sm"
                                    placeholder="Etiqueta de semana (opcional)"
                                    value={draft?.label ?? ""}
                                    onChange={(e) =>
                                        setDraft((prev) => (prev ? { ...prev, label: e.target.value || null } : prev))
                                    }
                                    className="max-w-xs"
                                />
                                <span className="text-xs text-muted-foreground">
                                    Ordinal: {draft?.week_ordinal}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-medium text-foreground">
                                    {displayWeek.label || `Semana ${displayWeek.week_ordinal}`}
                                </span>
                                <div className="ml-auto flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenRepeatModal(displayWeek as WeeklyStructureWeek)}
                                        disabled={isMutating}
                                    >
                                        <Copy className="h-3.5 w-3.5 mr-1" />
                                        Repetir
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleStartEdit(displayWeek as WeeklyStructureWeek)}
                                        disabled={isMutating}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline-destructive"
                                        size="sm"
                                        onClick={() => setDeleteTarget(displayWeek as WeeklyStructureWeek)}
                                        disabled={isMutating}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Catalog error banner */}
                    {isErrorPatterns && (
                        <Alert variant="warning" className="text-sm">
                            <p className="font-medium">No se pudieron cargar los patrones de movimiento</p>
                            <p className="opacity-90">El catálogo no está disponible. Los días se muestran sin selector de patrones.</p>
                            <button
                                type="button"
                                onClick={() => refetchPatterns()}
                                className="mt-1 text-xs underline hover:no-underline"
                            >
                                Reintentar
                            </button>
                        </Alert>
                    )}

                    {/* Days grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {(isEditing && draft ? draft.days : (displayWeek as WeeklyStructureWeek).days).map((day) => (
                            <DayEditor
                                key={day.day_of_week}
                                day={day}
                                patternsCatalog={patternsCatalog ?? []}
                                patternsLoading={isLoadingPatterns}
                                patternsError={isErrorPatterns}
                                onChange={(updated) => updateDraftDay(day.day_of_week, updated)}
                            />
                        ))}
                    </div>

                    {/* Edit actions */}
                    {isEditing && (
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isMutating}>
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSave}
                                isLoading={isMutating}
                                disabled={isMutating}
                            >
                                <Save className="h-4 w-4 mr-1" />
                                Guardar semana
                            </Button>
                        </div>
                    )}
                </div>
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
        </div>
    );
};
