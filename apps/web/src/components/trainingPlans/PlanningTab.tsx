/**
 * PlanningTab.tsx — Baseline mensual + overrides + plan resuelto (Fase 1+2)
 *
 * UI: monthly baselines, overrides semanales/diarios, vista plan resuelto por día.
 * Lógica en shared (hooks); solo presentación aquí.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 1
 * @updated Fase 2 - overrides y resolve_day_plan
 */

import React, { useState } from "react";
import { useMonthlyPlan } from "@nexia/shared/hooks/training/useMonthlyPlan";
import { useResolvedDay } from "@nexia/shared/hooks/training/useResolvedDay";
import {
    useWeeklyOverrides,
    useDailyOverrides,
} from "@nexia/shared/hooks/training/usePlanningOverrides";
import type { QualityConfig } from "@nexia/shared/types/planningCargas";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";

interface PlanningTabProps {
    planId: number;
    clientId?: number | null;
}

function qualitiesToDisplayString(qualities: QualityConfig | null): string {
    if (!qualities || Object.keys(qualities).length === 0) return "—";
    return Object.entries(qualities)
        .map(([k, v]) => `${k}: ${Math.round((v as number) * 100)}%`)
        .join(", ");
}

export const PlanningTab: React.FC<PlanningTabProps> = ({ planId, clientId }) => {
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

    const { data: resolvedDay, isLoading: resolvedLoading } = useResolvedDay({
        clientId: clientId ?? null,
        date: resolvedDate || null,
    });

    const parseQualities = (text: string): QualityConfig | null => {
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
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMonth) return;
        try {
            await createMonthlyPlan({
                training_plan_id: planId,
                client_id: clientId ?? undefined,
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
                    Nuevo baseline mensual
                </h3>
                <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Mes (YYYY-MM)
                        </label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div className="min-w-[200px] flex-1">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Cualidades (ej: Fuerza: 60, Resistencia: 40)
                        </label>
                        <input
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
                                <div>
                                    <span className="font-medium text-gray-800">
                                        {mp.month}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-600">
                                        {qualitiesToDisplayString(mp.qualities)}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {editingId === mp.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editQualitiesText}
                                                onChange={(e) =>
                                                    setEditQualitiesText(e.target.value)
                                                }
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
                            <label className="mb-1 block text-sm text-gray-700">
                                week_id (ej. 2026-02-W1)
                            </label>
                            <input
                                type="text"
                                value={weekIdText}
                                onChange={(e) => setWeekIdText(e.target.value)}
                                placeholder="2026-02-W1"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="min-w-[180px]">
                            <label className="mb-1 block text-sm text-gray-700">
                                Cualidades
                            </label>
                            <input
                                type="text"
                                value={weeklyQualitiesText}
                                onChange={(e) => setWeeklyQualitiesText(e.target.value)}
                                placeholder="Fuerza: 80"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
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
                                <span>
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
                            <label className="mb-1 block text-sm text-gray-700">
                                Cualidades
                            </label>
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
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                            <p>
                                <strong>Origen:</strong>{" "}
                                {resolvedDay.source ?? "—"}
                            </p>
                            <p>
                                <strong>Entrenable:</strong>{" "}
                                {resolvedDay.is_trainable ? "Sí" : "No"}
                            </p>
                            <p>
                                <strong>Cualidades:</strong>{" "}
                                {qualitiesToDisplayString(resolvedDay.qualities)}
                            </p>
                            {(resolvedDay.resolved_volume != null ||
                                resolvedDay.resolved_intensity != null) && (
                                <p>
                                    Volumen:{" "}
                                    {resolvedDay.resolved_volume != null
                                        ? `${Math.round(resolvedDay.resolved_volume * 100)}%`
                                        : "—"}
                                    {" · "}
                                    Intensidad:{" "}
                                    {resolvedDay.resolved_intensity != null
                                        ? `${Math.round(resolvedDay.resolved_intensity * 100)}%`
                                        : "—"}
                                </p>
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
