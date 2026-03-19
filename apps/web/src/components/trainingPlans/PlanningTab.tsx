/**
 * PlanningTab.tsx — Baseline mensual + overrides + plan resuelto + calendario (Fase 1+2+3)
 *
 * UI: monthly baselines, overrides semanales/diarios, vista plan resuelto por día,
 * calendario del mes con origen M/S/D (Fase 3).
 * Lógica en shared (hooks); solo presentación aquí.
 * Opcionalmente controlado por padre (month/week + callbacks) para estado en URL.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 1
 * @updated Fase 2 - overrides y resolve_day_plan; Fase 3 - calendario period-based
 * @updated Fase 1 U3 - props opcionales month, week, onMonthChange, onWeekChange
 * @updated Fase 3 (plan UX) - mostrar weekly_average_warning bajo formularios override
 * @updated Fase 5b U11 - selector de cualidades desde catálogo (PhysicalQuality), parseQualities/qualitiesToDisplayString desde shared
 * @updated Fase 5 - Vista semana L-D (7 columnas) con planificado, programado y badge coherencia
 */

import React, { useState, useMemo, useCallback } from "react";
import { useMonthlyPlan } from "@nexia/shared/hooks/training/useMonthlyPlan";
import { useResolvedDay } from "@nexia/shared/hooks/training/useResolvedDay";
import { usePlanningCalendar } from "@nexia/shared/hooks/training/usePlanningCalendar";
import {
    useWeeklyOverrides,
    useDailyOverrides,
} from "@nexia/shared/hooks/training/usePlanningOverrides";
import { useTrainingPlanCoherence } from "@nexia/shared/hooks/training/useTrainingPlanCoherence";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import { qualitiesToDisplayString } from "@nexia/shared/utils/qualityUtils";
import type {
    PhysicalQuality,
    NestedQualitiesConfig,
    QualityValue,
    WeeklyOverride,
    DailyOverride,
} from "@nexia/shared/types/planningCargas";
import type {
    PlanCoherenceMonthItem,
    PlanCoherenceWeekItem,
    PlanCoherenceDayItem,
} from "@nexia/shared/types/trainingAnalytics";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { SessionCalendar } from "@/components/sessionProgramming";
import { WeekViewGrid } from "@/components/trainingPlans/WeekViewGrid";
import { useWeekPlanningData } from "@nexia/shared/hooks/training/useWeekPlanningData";
import { formatMonth, parseMonthToDate } from "@/utils/planningUrl";

interface PlanningTabProps {
    planId: number;
    clientId?: number | null;
    /** Cuando se proporciona, el mes del calendario es controlado (p. ej. desde URL). */
    month?: string;
    /** Semana dentro del mes (1–4). Controlada cuando se usa con onWeekChange. */
    week?: number;
    onMonthChange?: (month: string) => void;
    onWeekChange?: (week: number) => void;
}

/** Convierte qualities de API (flat o anidado) a NestedQualitiesConfig para el formulario. */
function toNormalizedNested(
    qualities: Record<string, number | QualityValue> | null | undefined
): NestedQualitiesConfig | null {
    if (!qualities || Object.keys(qualities).length === 0) return null;
    const out: NestedQualitiesConfig = {};
    for (const [k, v] of Object.entries(qualities)) {
        if (typeof v === "number") {
            out[k] = { pct: v };
        } else if (v && typeof v === "object" && "pct" in v) {
            out[k] = { pct: v.pct, volume_pct: v.volume_pct, intensity_pct: v.intensity_pct };
        }
    }
    return Object.keys(out).length ? out : null;
}

/** Verde ≥80%, amarillo ≥60%, rojo <60% (TICK-P02) */
function coherenceBadgeColor(percentage: number): "green" | "amber" | "red" {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "amber";
    return "red";
}

function CoherenceBadge({ percentage }: { percentage: number }) {
    const color = coherenceBadgeColor(percentage);
    const classes =
        color === "green"
            ? "bg-green-100 text-green-800 border-green-200"
            : color === "amber"
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-red-100 text-red-800 border-red-200";
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}
            title={`Coherencia: ${percentage}%`}
        >
            {percentage}%
        </span>
    );
}

interface QualitiesEditorProps {
    catalog: PhysicalQuality[];
    value: NestedQualitiesConfig | null;
    onChange: (v: NestedQualitiesConfig | null) => void;
    idPrefix?: string;
}

function QualitiesEditor({ catalog, value, onChange, idPrefix = "qualities" }: QualitiesEditorProps) {
    const config = value ?? {};
    const slugs = Object.keys(config);
    const addSlug = (slug: string) => {
        const item = catalog.find((c) => c.slug === slug);
        if (!item || config[slug]) return;
        const next: NestedQualitiesConfig = { ...config, [slug]: { pct: 0.5, intensity_pct: 0.5 } };
        if (item.has_volume) next[slug].volume_pct = 0.5;
        onChange(next);
    };
    const removeSlug = (slug: string) => {
        const next = { ...config };
        delete next[slug];
        onChange(Object.keys(next).length ? next : null);
    };
    const updateSlug = (slug: string, field: keyof QualityValue, num: number) => {
        const entry = config[slug] ?? { pct: 0.5, intensity_pct: 0.5 };
        const next = { ...config, [slug]: { ...entry, [field]: num } };
        onChange(next);
    };
    const availableToAdd = catalog.filter((c) => !config[c.slug]);

    return (
        <div className="space-y-2">
            {slugs.map((slug) => {
                const item = catalog.find((c) => c.slug === slug);
                const entry = config[slug] ?? { pct: 0.5, intensity_pct: 0.5 };
                const name = item?.name ?? slug;
                return (
                    <div
                        key={slug}
                        className="flex flex-wrap items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2 text-sm"
                    >
                        <span className="font-medium text-gray-800 min-w-[120px]">{name}</span>
                        <label className="sr-only">pct %</label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={Math.round(entry.pct * 100)}
                            onChange={(e) =>
                                updateSlug(slug, "pct", Math.min(100, Math.max(0, Number(e.target.value))) / 100)
                            }
                            className="w-14 rounded border border-gray-300 px-2 py-1 text-right"
                            aria-label={`${name} pct`}
                        />
                        <span className="text-gray-500">%</span>
                        <label className="sr-only">intensidad %</label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={Math.round((entry.intensity_pct ?? entry.pct) * 100)}
                            onChange={(e) =>
                                updateSlug(
                                    slug,
                                    "intensity_pct",
                                    Math.min(100, Math.max(0, Number(e.target.value))) / 100
                                )
                            }
                            className="w-14 rounded border border-gray-300 px-2 py-1 text-right"
                            aria-label={`${name} intensidad`}
                        />
                        <span className="text-gray-500">% int</span>
                        {item?.has_volume && (
                            <>
                                <label className="sr-only">volumen %</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={Math.round((entry.volume_pct ?? entry.pct) * 100)}
                                    onChange={(e) =>
                                        updateSlug(
                                            slug,
                                            "volume_pct",
                                            Math.min(100, Math.max(0, Number(e.target.value))) / 100
                                        )
                                    }
                                    className="w-14 rounded border border-gray-300 px-2 py-1 text-right"
                                    aria-label={`${name} volumen`}
                                />
                                <span className="text-gray-500">% vol</span>
                            </>
                        )}
                        <button
                            type="button"
                            onClick={() => removeSlug(slug)}
                            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                            aria-label={`Quitar ${name}`}
                        >
                            Quitar
                        </button>
                    </div>
                );
            })}
            {availableToAdd.length > 0 && (
                <div className="flex items-center gap-2">
                    <label htmlFor={`${idPrefix}-add`} className="text-sm text-gray-600">
                        Añadir cualidad
                    </label>
                    <select
                        id={`${idPrefix}-add`}
                        value=""
                        onChange={(e) => {
                            const slug = e.target.value;
                            if (slug) addSlug(slug);
                            e.target.value = "";
                        }}
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                        aria-label="Añadir cualidad del catálogo"
                    >
                        <option value="">— Elegir —</option>
                        {availableToAdd.map((c) => (
                            <option key={c.id} value={c.slug}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}

export const PlanningTab: React.FC<PlanningTabProps> = ({
    planId,
    clientId,
    month: controlledMonth,
    week: controlledWeek,
    onMonthChange,
    onWeekChange,
}) => {
    const [selectedMonth, setSelectedMonth] = useState("");
    const [monthlyQualities, setMonthlyQualities] = useState<NestedQualitiesConfig | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQualities, setEditQualities] = useState<NestedQualitiesConfig | null>(null);
    const [selectedMonthlyForWeekly, setSelectedMonthlyForWeekly] = useState<number | null>(null);
    const [weekIdText, setWeekIdText] = useState("");
    const [weeklyQualities, setWeeklyQualities] = useState<NestedQualitiesConfig | null>(null);
    const [dailyDateText, setDailyDateText] = useState("");
    const [dailyQualities, setDailyQualities] = useState<NestedQualitiesConfig | null>(null);
    const [resolvedDate, setResolvedDate] = useState("");
    const [internalCalendarMonth, setInternalCalendarMonth] = useState<Date>(() => new Date());
    /** Fase 3: aviso de media semanal tras crear override (informativo, no bloquea). */
    const [weeklyOverrideWarning, setWeeklyOverrideWarning] = useState<string | null>(null);
    const [dailyOverrideWarning, setDailyOverrideWarning] = useState<string | null>(null);

    const { data: physicalQualitiesCatalog = [] } = useGetPhysicalQualitiesQuery();

    const isMonthControlled = controlledMonth != null && onMonthChange != null;
    const calendarMonth = useMemo(
        () =>
            isMonthControlled ? parseMonthToDate(controlledMonth) : internalCalendarMonth,
        [isMonthControlled, controlledMonth, internalCalendarMonth]
    );

    const handleCalendarMonthChange = useCallback(
        (date: Date) => {
            if (onMonthChange) {
                onMonthChange(formatMonth(date));
            } else {
                setInternalCalendarMonth(date);
            }
        },
        [onMonthChange]
    );

    const calendarMonthStr = useMemo(
        () =>
            `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}`,
        [calendarMonth]
    );

    const {
        data: planningCalendarData,
        isLoading: calendarLoading,
    } = usePlanningCalendar({
        clientId: clientId ?? null,
        month: clientId != null ? calendarMonthStr : null,
    });

    const {
        monthlyPlans,
        isLoading,
        isError,
        error,
        createMonthlyPlan,
        updateMonthlyPlan,
        deleteMonthlyPlan,
        isCreating,
        isUpdating,
        isDeleting,
    } = useMonthlyPlan({ planId });

    const monthlyPlanIdForWeekly = selectedMonthlyForWeekly ?? monthlyPlans[0]?.id ?? null;
    const {
        weeklyOverrides,
        createWeeklyOverride,
        deleteWeeklyOverride,
        isCreating: isCreatingWeekly,
        isDeleting: isDeletingWeekly,
    } = useWeeklyOverrides(monthlyPlanIdForWeekly);

    const {
        dailyOverrides,
        createDailyOverride,
        deleteDailyOverride,
        isCreating: isCreatingDaily,
        isDeleting: isDeletingDaily,
    } = useDailyOverrides(clientId ?? null);

    const [viewMode, setViewMode] = useState<"calendar" | "week">("calendar");
    const [internalWeek, setInternalWeek] = useState(1);
    const effectiveWeek = controlledWeek ?? internalWeek;

    const { days: weekDays, isLoading: weekLoading } = useWeekPlanningData({
        clientId: clientId ?? null,
        planId,
        month: calendarMonthStr,
        week: effectiveWeek,
    });

    const { data: resolvedDay, isLoading: resolvedLoading } = useResolvedDay({
        clientId: clientId ?? null,
        date: resolvedDate || null,
    });

    const { data: coherenceData } = useTrainingPlanCoherence({ planId });

    const monthCoherenceByMonth = useMemo(() => {
        if (!coherenceData?.month_coherence) return new Map<string, PlanCoherenceMonthItem>();
        const m = new Map<string, PlanCoherenceMonthItem>();
        for (const item of coherenceData.month_coherence) {
            m.set(item.month, item);
            m.set(String(item.month_plan_id), item);
        }
        return m;
    }, [coherenceData?.month_coherence]);

    const weekCoherenceByWeekId = useMemo(() => {
        if (!coherenceData?.week_coherence) return new Map<string, PlanCoherenceWeekItem>();
        const m = new Map<string, PlanCoherenceWeekItem>();
        for (const item of coherenceData.week_coherence) {
            m.set(item.week_id, item);
            m.set(String(item.weekly_override_id), item);
        }
        return m;
    }, [coherenceData?.week_coherence]);

    const dayCoherenceByDate = useMemo(() => {
        if (!coherenceData?.day_coherence) return new Map<string, PlanCoherenceDayItem>();
        const m = new Map<string, PlanCoherenceDayItem>();
        for (const item of coherenceData.day_coherence) {
            m.set(item.date, item);
            m.set(String(item.daily_override_id), item);
        }
        return m;
    }, [coherenceData?.day_coherence]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMonth) return;
        try {
            await createMonthlyPlan({
                training_plan_id: planId,
                client_id: clientId ?? undefined,
                month: selectedMonth,
                qualities: monthlyQualities,
            });
            setSelectedMonth("");
            setMonthlyQualities(null);
        } catch (err) {
            console.error(err);
            alert("Error al crear el baseline mensual");
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            await updateMonthlyPlan(id, { qualities: editQualities });
            setEditingId(null);
            setEditQualities(null);
        } catch (err) {
            console.error(err);
            alert("Error al actualizar");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este baseline mensual?")) return;
        try {
            await deleteMonthlyPlan(id);
        } catch (err) {
            console.error(err);
            alert("Error al eliminar");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="error">
                Error al cargar la planificación:{" "}
                {error && typeof error === "object" && "data" in error
                    ? String((error as { data?: unknown }).data)
                    : String(error)}
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Fase 3: Calendario del mes (solo si hay cliente asignado) */}
            {clientId != null && (
                <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                            Calendario de planificación
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="flex rounded-lg border border-border p-0.5" role="tablist">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={viewMode === "calendar"}
                                    onClick={() => setViewMode("calendar")}
                                    className={`min-h-touch-sm min-w-touch-sm rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        viewMode === "calendar"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    Calendario
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={viewMode === "week"}
                                    onClick={() => setViewMode("week")}
                                    className={`min-h-touch-sm min-w-touch-sm rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        viewMode === "week"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    Vista semana
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="planning-week-select" className="text-sm font-medium text-muted-foreground">
                                    Semana
                                </label>
                                <select
                                    id="planning-week-select"
                                    value={effectiveWeek}
                                    onChange={(e) => {
                                        const v = Number(e.target.value);
                                        if (onWeekChange) onWeekChange(v);
                                        else setInternalWeek(v);
                                    }}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                                    aria-label="Semana del mes (1-4)"
                                >
                                    {[1, 2, 3, 4].map((w) => (
                                        <option key={w} value={w}>
                                            {w}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {viewMode === "calendar" ? (
                        calendarLoading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <SessionCalendar
                                sessions={[]}
                                currentMonth={calendarMonth}
                                onMonthChange={handleCalendarMonthChange}
                                planningDays={planningCalendarData}
                            />
                        )
                    ) : (
                        <WeekViewGrid days={weekDays} isLoading={weekLoading} />
                    )}
                </section>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Nuevo baseline mensual
                </h3>
                <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
                    <div>
                        <label
                            htmlFor="planning-baseline-month"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Mes (YYYY-MM)
                        </label>
                        <input
                            id="planning-baseline-month"
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div className="min-w-[280px] flex-1">
                        <span className="mb-1 block text-sm font-medium text-gray-700">
                            Cualidades
                        </span>
                        <QualitiesEditor
                            idPrefix="planning-baseline"
                            catalog={physicalQualitiesCatalog}
                            value={monthlyQualities}
                            onChange={setMonthlyQualities}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating || !selectedMonth}
                        className="rounded-lg bg-[#4A67B3] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d5a9e] disabled:opacity-50"
                    >
                        {isCreating ? "Creando…" : "Crear"}
                    </button>
                </form>
            </section>

            {/* TICK-P02: Badge de coherencia global del plan */}
            {coherenceData != null && (
                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800">
                        Coherencia del plan
                    </h3>
                    <div className="flex items-center gap-2">
                        <CoherenceBadge percentage={Math.round(coherenceData.overall_coherence)} />
                        <span className="text-sm text-gray-600">
                            Global (umbral desviación: {coherenceData.deviation_threshold}%)
                        </span>
                    </div>
                </section>
            )}

            {/* TICK-P05: Botón Sincronizar planificación. Endpoint sync bottom-up no disponible en backend (removido en Fase 6); UI preparada para cuando exista. */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    Sincronizar planificación
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                    Actualizar la planificación desde sesiones realizadas (sync bottom-up). En desarrollo.
                </p>
                <button
                    type="button"
                    disabled
                    title="Endpoint de sincronización no disponible aún"
                    className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                    Sincronizar planificación
                </button>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Baselines mensuales
                </h3>
                {monthlyPlans.length === 0 ? (
                    <p className="text-gray-500">Aún no hay baselines. Crea uno arriba.</p>
                ) : (
                    <ul className="space-y-2">
                        {monthlyPlans.map((mp) => (
                            <li
                                key={mp.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium text-gray-800">
                                        {mp.month}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {qualitiesToDisplayString(mp.qualities)}
                                    </span>
                                    {(() => {
                                        const item = monthCoherenceByMonth.get(mp.month) ?? monthCoherenceByMonth.get(String(mp.id));
                                        return item ? <CoherenceBadge percentage={Math.round(item.coherence_percentage)} /> : null;
                                    })()}
                                </div>
                                <div className="flex gap-2">
                                    {editingId === mp.id ? (
                                        <>
                                            <div className="min-w-[260px]">
                                                <QualitiesEditor
                                                    idPrefix={`edit-baseline-${mp.id}`}
                                                    catalog={physicalQualitiesCatalog}
                                                    value={editQualities}
                                                    onChange={setEditQualities}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleUpdate(mp.id)}
                                                disabled={isUpdating}
                                                className="rounded bg-green-600 px-2 py-1 text-sm text-white"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditQualities(null);
                                                }}
                                                className="rounded bg-gray-400 px-2 py-1 text-sm text-white"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(mp.id);
                                                    setEditQualities(toNormalizedNested(mp.qualities as Record<string, number | QualityValue> | null));
                                                }}
                                                className="rounded bg-[#4A67B3] px-2 py-1 text-sm text-white hover:bg-[#3d5a9e]"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(mp.id)}
                                                disabled={isDeleting}
                                                className="rounded bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Fase 2: Overrides semanales */}
            {monthlyPlans.length > 0 && (
                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">
                        Overrides semanales
                    </h3>
                    <div className="mb-3">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Baseline mensual
                        </label>
                        <select
                            value={selectedMonthlyForWeekly ?? monthlyPlans[0]?.id ?? ""}
                            onChange={(e) =>
                                setSelectedMonthlyForWeekly(
                                    e.target.value ? Number(e.target.value) : null
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            {monthlyPlans.map((mp) => (
                                <option key={mp.id} value={mp.id}>
                                    {mp.month}
                                </option>
                            ))}
                        </select>
                    </div>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!monthlyPlanIdForWeekly || !weekIdText.trim()) return;
                            setWeeklyOverrideWarning(null);
                            try {
                                const result: WeeklyOverride = await createWeeklyOverride({
                                    monthly_plan_id: monthlyPlanIdForWeekly,
                                    week_id: weekIdText.trim(),
                                    qualities: weeklyQualities,
                                });
                                if (result?.weekly_average_warning) {
                                    setWeeklyOverrideWarning(result.weekly_average_warning);
                                }
                                setWeekIdText("");
                                setWeeklyQualities(null);
                            } catch (err) {
                                console.error(err);
                                alert("Error al crear override semanal");
                            }
                        }}
                        className="mb-3 flex flex-wrap items-end gap-3"
                    >
                        <div>
                            <label htmlFor="planning-weekly-week-id" className="mb-1 block text-sm text-gray-700">
                                week_id (ej. 2026-02-W1)
                            </label>
                            <input
                                id="planning-weekly-week-id"
                                type="text"
                                value={weekIdText}
                                onChange={(e) => setWeekIdText(e.target.value)}
                                placeholder="2026-02-W1"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="min-w-[280px]">
                            <span className="mb-1 block text-sm text-gray-700">Cualidades</span>
                            <QualitiesEditor
                                idPrefix="planning-weekly"
                                catalog={physicalQualitiesCatalog}
                                value={weeklyQualities}
                                onChange={setWeeklyQualities}
                            />
                        </div>
                        <button
                            type="submit"
                            aria-label="Añadir override semanal"
                            disabled={isCreatingWeekly || !weekIdText.trim()}
                            className="rounded-lg bg-[#4A67B3] px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            Añadir
                        </button>
                    </form>
                    {weeklyOverrideWarning && (
                        <Alert variant="warning" className="mb-3">
                            {weeklyOverrideWarning}
                        </Alert>
                    )}
                    <ul className="space-y-2">
                        {weeklyOverrides.map((wo) => (
                            <li
                                key={wo.id}
                                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2 text-sm"
                            >
                                <span className="flex flex-wrap items-center gap-2">
                                    {wo.week_id}{" "}
                                    <span className="text-gray-600">
                                        {qualitiesToDisplayString(wo.qualities)}
                                    </span>
                                    {(() => {
                                        const item = weekCoherenceByWeekId.get(wo.week_id) ?? weekCoherenceByWeekId.get(String(wo.id));
                                        return item ? <CoherenceBadge percentage={Math.round(item.coherence_percentage)} /> : null;
                                    })()}
                                </span>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!confirm("¿Eliminar este override?")) return;
                                        try {
                                            await deleteWeeklyOverride(wo.id);
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    disabled={isDeletingWeekly}
                                    className="rounded bg-red-600 px-2 py-1 text-white"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                        {weeklyOverrides.length === 0 && (
                            <li className="text-gray-500">Ningún override semanal.</li>
                        )}
                    </ul>
                </section>
            )}

            {/* Fase 2: Overrides diarios (solo si hay cliente) */}
            {clientId != null && (
                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">
                        Overrides diarios
                    </h3>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!dailyDateText.trim()) return;
                            setDailyOverrideWarning(null);
                            try {
                                const result: DailyOverride = await createDailyOverride({
                                    client_id: clientId,
                                    date: dailyDateText.trim(),
                                    qualities: dailyQualities,
                                });
                                if (result?.weekly_average_warning) {
                                    setDailyOverrideWarning(result.weekly_average_warning);
                                }
                                setDailyDateText("");
                                setDailyQualities(null);
                            } catch (err) {
                                console.error(err);
                                alert("Error al crear override diario");
                            }
                        }}
                        className="mb-3 flex flex-wrap items-end gap-3"
                    >
                        <div>
                            <label className="mb-1 block text-sm text-gray-700">
                                Fecha (YYYY-MM-DD)
                            </label>
                            <input
                                type="date"
                                value={dailyDateText}
                                onChange={(e) => setDailyDateText(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="min-w-[280px]">
                            <span className="mb-1 block text-sm text-gray-700">Cualidades</span>
                            <QualitiesEditor
                                idPrefix="planning-daily"
                                catalog={physicalQualitiesCatalog}
                                value={dailyQualities}
                                onChange={setDailyQualities}
                            />
                        </div>
                        <button
                            type="submit"
                            aria-label="Añadir override diario"
                            disabled={isCreatingDaily || !dailyDateText}
                            className="rounded-lg bg-[#4A67B3] px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            Añadir
                        </button>
                    </form>
                    {dailyOverrideWarning && (
                        <Alert variant="warning" className="mb-3">
                            {dailyOverrideWarning}
                        </Alert>
                    )}
                    <ul className="space-y-2">
                        {dailyOverrides.map((do_) => (
                            <li
                                key={do_.id}
                                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2 text-sm"
                            >
                                <span className="flex flex-wrap items-center gap-2">
                                    {do_.date}{" "}
                                    <span className="text-gray-600">
                                        {qualitiesToDisplayString(do_.qualities)}
                                    </span>
                                    {(() => {
                                        const item = dayCoherenceByDate.get(do_.date) ?? dayCoherenceByDate.get(String(do_.id));
                                        return item ? <CoherenceBadge percentage={Math.round(item.coherence_percentage)} /> : null;
                                    })()}
                                </span>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!confirm("¿Eliminar este override?")) return;
                                        try {
                                            await deleteDailyOverride(do_.id);
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    disabled={isDeletingDaily}
                                    className="rounded bg-red-600 px-2 py-1 text-white"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                        {dailyOverrides.length === 0 && (
                            <li className="text-gray-500">Ningún override diario.</li>
                        )}
                    </ul>
                </section>
            )}

            {/* Fase 2: Plan resuelto para un día */}
            {clientId != null && (
                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">
                        Plan resuelto (día)
                    </h3>
                    <div className="mb-3 flex flex-wrap items-end gap-3">
                        <div>
                            <label className="mb-1 block text-sm text-gray-700">
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={resolvedDate}
                                onChange={(e) => setResolvedDate(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    {resolvedLoading && resolvedDate ? (
                        <p className="text-gray-500">Cargando…</p>
                    ) : resolvedDay && resolvedDate ? (
                        <div className={`rounded-lg border p-3 text-sm ${
                            !resolvedDay.is_trainable
                                ? "border-red-200 bg-red-50"
                                : resolvedDay.source === "day" || resolvedDay.source === "week"
                                    ? "border-violet-200 bg-violet-50"
                                    : "border-gray-200 bg-gray-50"
                        }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    resolvedDay.source === "month"
                                        ? "bg-slate-200 text-slate-700"
                                        : resolvedDay.source === "week"
                                            ? "bg-violet-200 text-violet-700"
                                            : resolvedDay.source === "day"
                                                ? "bg-emerald-200 text-emerald-700"
                                                : "bg-gray-200 text-gray-600"
                                }`}>
                                    {resolvedDay.source === "month" ? "Heredado (Mes)"
                                        : resolvedDay.source === "week" ? "Override (Semana)"
                                        : resolvedDay.source === "day" ? "Override (Día)"
                                        : "Sin origen"}
                                </span>
                                {!resolvedDay.is_trainable && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-700">
                                        No entrenable
                                    </span>
                                )}
                            </div>
                            <p>
                                <strong>Cualidades:</strong>{" "}
                                {qualitiesToDisplayString(resolvedDay.qualities)}
                            </p>
                            {(resolvedDay.resolved_volume != null ||
                                resolvedDay.resolved_intensity != null) && (
                                <div className="mt-2 flex gap-4">
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Volumen:</span>
                                        <span className="font-semibold">
                                            {resolvedDay.resolved_volume != null
                                                ? `${Math.round(resolvedDay.resolved_volume * 100)}%`
                                                : "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Intensidad:</span>
                                        <span className="font-semibold">
                                            {resolvedDay.resolved_intensity != null
                                                ? `${Math.round(resolvedDay.resolved_intensity * 100)}%`
                                                : "—"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            Elige una fecha para ver el plan resuelto.
                        </p>
                    )}
                </section>
            )}
        </div>
    );
};
