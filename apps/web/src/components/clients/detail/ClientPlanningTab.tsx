/**
 * ClientPlanningTab.tsx - Planificación desde perfil de cliente (Fase 6)
 *
 * Orquestador: gestiona modo client-only (sin TrainingPlan) o modo plan (plan asociado).
 * PlanningTab no se modifica; se reutiliza con planId cuando hay plan seleccionado.
 * Modo client-only: UI propia con useMonthlyPlan({ clientId }), sin coherencia del plan.
 *
 * @author Frontend Team
 * @since Fase 6 planificación client-only
 */

import React, { useState, useMemo } from "react";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { useMonthlyPlan } from "@nexia/shared/hooks/training/useMonthlyPlan";
import { useResolvedDay } from "@nexia/shared/hooks/training/useResolvedDay";
import { usePlanningCalendar } from "@nexia/shared/hooks/training/usePlanningCalendar";
import {
    useWeeklyOverrides,
    useDailyOverrides,
} from "@nexia/shared/hooks/training/usePlanningOverrides";
import type { QualityConfig } from "@nexia/shared/types/planningCargas";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { SessionCalendar } from "@/components/sessionProgramming";
import { PlanningTab } from "@/components/trainingPlans/PlanningTab";

interface ClientPlanningTabProps {
    clientId: number;
    trainingPlans: TrainingPlan[];
    isLoadingPlans: boolean;
}

const CLIENT_ONLY_VALUE = "__client_only__";

function qualitiesToDisplayString(qualities: QualityConfig | null): string {
    if (!qualities || Object.keys(qualities).length === 0) return "—";
    return Object.entries(qualities)
        .map(([k, v]) => `${k}: ${Math.round((v as number) * 100)}%`)
        .join(", ");
}

function parseQualities(text: string): QualityConfig | null {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const out: QualityConfig = {};
    const pairs = trimmed.split(/[,;]/).map((s) => s.trim());
    for (const p of pairs) {
        const idx = p.lastIndexOf(":");
        if (idx === -1) continue;
        const name = p.slice(0, idx).trim();
        const val = parseFloat(p.slice(idx + 1).trim());
        if (name && !Number.isNaN(val)) out[name] = val / 100;
    }
    return Object.keys(out).length ? out : null;
}

interface ClientOnlyPlanningContentProps {
    clientId: number;
}

function ClientOnlyPlanningContent({ clientId }: ClientOnlyPlanningContentProps) {
    const [selectedMonth, setSelectedMonth] = useState("");
    const [qualitiesText, setQualitiesText] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQualitiesText, setEditQualitiesText] = useState("");
    const [selectedMonthlyForWeekly, setSelectedMonthlyForWeekly] = useState<number | null>(null);
    const [weekIdText, setWeekIdText] = useState("");
    const [weeklyQualitiesText, setWeeklyQualitiesText] = useState("");
    const [dailyDateText, setDailyDateText] = useState("");
    const [dailyQualitiesText, setDailyQualitiesText] = useState("");
    const [resolvedDate, setResolvedDate] = useState("");
    const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

    const calendarMonthStr = useMemo(
        () =>
            `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}`,
        [calendarMonth]
    );

    const {
        data: planningCalendarData,
        isLoading: calendarLoading,
    } = usePlanningCalendar({
        clientId,
        month: calendarMonthStr,
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
    } = useMonthlyPlan({ clientId });

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
    } = useDailyOverrides(clientId);

    const { data: resolvedDay, isLoading: resolvedLoading } = useResolvedDay({
        clientId,
        date: resolvedDate || null,
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMonth) return;
        try {
            await createMonthlyPlan({
                client_id: clientId,
                month: selectedMonth,
                qualities: parseQualities(qualitiesText),
            });
            setSelectedMonth("");
            setQualitiesText("");
        } catch (err) {
            console.error(err);
            alert("Error al crear el baseline mensual");
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            await updateMonthlyPlan(id, { qualities: parseQualities(editQualitiesText) });
            setEditingId(null);
            setEditQualitiesText("");
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
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Calendario de planificación
                </h3>
                {calendarLoading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                ) : (
                    <SessionCalendar
                        sessions={[]}
                        currentMonth={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        planningDays={planningCalendarData}
                    />
                )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Nuevo baseline mensual
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                    Planificacion sin plan asociado. Los baselines se vinculan al cliente.
                </p>
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
                    <div className="min-w-[200px] flex-1">
                        <label
                            htmlFor="planning-baseline-qualities"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Cualidades (ej: Fuerza: 60, Resistencia: 40)
                        </label>
                        <input
                            id="planning-baseline-qualities"
                            type="text"
                            value={qualitiesText}
                            onChange={(e) => setQualitiesText(e.target.value)}
                            placeholder="Fuerza: 60, Resistencia: 40"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                                    <span className="font-medium text-gray-800">{mp.month}</span>
                                    <span className="text-sm text-gray-600">
                                        {qualitiesToDisplayString(mp.qualities)}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {editingId === mp.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editQualitiesText}
                                                onChange={(e) => setEditQualitiesText(e.target.value)}
                                                placeholder="Fuerza: 70, Resistencia: 30"
                                                className="rounded border border-gray-300 px-2 py-1 text-sm"
                                            />
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
                                                    setEditQualitiesText("");
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
                                                    setEditQualitiesText(
                                                        mp.qualities
                                                            ? Object.entries(mp.qualities)
                                                                  .map(
                                                                      ([k, v]) =>
                                                                          `${k}: ${Math.round((v as number) * 100)}`
                                                                  )
                                                                  .join(", ")
                                                            : ""
                                                    );
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
                            try {
                                await createWeeklyOverride({
                                    monthly_plan_id: monthlyPlanIdForWeekly,
                                    week_id: weekIdText.trim(),
                                    qualities: parseQualities(weeklyQualitiesText),
                                });
                                setWeekIdText("");
                                setWeeklyQualitiesText("");
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
                        <div className="min-w-[180px]">
                            <label htmlFor="planning-weekly-qualities" className="mb-1 block text-sm text-gray-700">
                                Cualidades
                            </label>
                            <input
                                id="planning-weekly-qualities"
                                type="text"
                                value={weeklyQualitiesText}
                                onChange={(e) => setWeeklyQualitiesText(e.target.value)}
                                placeholder="Fuerza: 80"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                            <li className="text-gray-500">Ningun override semanal.</li>
                        )}
                    </ul>
                </section>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Overrides diarios
                </h3>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (!dailyDateText.trim()) return;
                        try {
                            await createDailyOverride({
                                client_id: clientId,
                                date: dailyDateText.trim(),
                                qualities: parseQualities(dailyQualitiesText),
                            });
                            setDailyDateText("");
                            setDailyQualitiesText("");
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
                    <div className="min-w-[180px]">
                        <label className="mb-1 block text-sm text-gray-700">Cualidades</label>
                        <input
                            type="text"
                            value={dailyQualitiesText}
                            onChange={(e) => setDailyQualitiesText(e.target.value)}
                            placeholder="Fuerza: 90"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                <ul className="space-y-2">
                    {dailyOverrides.map((do_) => (
                        <li
                            key={do_.id}
                            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2 text-sm"
                        >
                            <span>
                                {do_.date}{" "}
                                <span className="text-gray-600">
                                    {qualitiesToDisplayString(do_.qualities)}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!confirm("Eliminar este override?")) return;
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

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Plan resuelto (dia)
                </h3>
                <div className="mb-3 flex flex-wrap items-end gap-3">
                    <div>
                        <label className="mb-1 block text-sm text-gray-700">Fecha</label>
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
                    <div
                        className={`rounded-lg border p-3 text-sm ${
                            !resolvedDay.is_trainable
                                ? "border-red-200 bg-red-50"
                                : resolvedDay.source === "day" || resolvedDay.source === "week"
                                  ? "border-violet-200 bg-violet-50"
                                  : "border-gray-200 bg-gray-50"
                        }`}
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    resolvedDay.source === "month"
                                        ? "bg-slate-200 text-slate-700"
                                        : resolvedDay.source === "week"
                                          ? "bg-violet-200 text-violet-700"
                                          : resolvedDay.source === "day"
                                            ? "bg-emerald-200 text-emerald-700"
                                            : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                {resolvedDay.source === "month"
                                    ? "Heredado (Mes)"
                                    : resolvedDay.source === "week"
                                      ? "Override (Semana)"
                                      : resolvedDay.source === "day"
                                        ? "Override (Día)"
                                        : "Sin origen"}
                            </span>
                            {!resolvedDay.is_trainable && (
                                <span className="inline-flex items-center rounded-full bg-red-200 px-2 py-0.5 text-xs font-medium text-red-700">
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
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">Elige una fecha para ver el plan resuelto.</p>
                )}
            </section>
        </div>
    );
}

export const ClientPlanningTab: React.FC<ClientPlanningTabProps> = ({
    clientId,
    trainingPlans,
    isLoadingPlans,
}) => {
    const [selectedPlanId, setSelectedPlanId] = useState<string>(CLIENT_ONLY_VALUE);

    if (isLoadingPlans) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (trainingPlans.length === 0) {
        return <ClientOnlyPlanningContent clientId={clientId} />;
    }

    const selectedPlan = selectedPlanId !== CLIENT_ONLY_VALUE
        ? trainingPlans.find((p) => String(p.id) === selectedPlanId)
        : null;

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    Modo de planificación
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Ver/editar:</label>
                    <select
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value={CLIENT_ONLY_VALUE}>
                            Solo cliente (sin plan asociado)
                        </option>
                        {trainingPlans.map((tp) => (
                            <option key={tp.id} value={String(tp.id)}>
                                Plan: {tp.name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {selectedPlan ? (
                <PlanningTab planId={selectedPlan.id} clientId={clientId} />
            ) : (
                <ClientOnlyPlanningContent clientId={clientId} />
            )}
        </div>
    );
};
