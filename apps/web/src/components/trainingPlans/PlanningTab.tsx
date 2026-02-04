/**
 * PlanningTab.tsx — Baseline mensual (Plan de cargas Fase 1)
 *
 * UI: formulario para crear/editar monthly plan (mes + cualidades), lista de baselines.
 * Lógica: useMonthlyPlan en shared; solo presentación aquí.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 1
 */

import React, { useState } from "react";
import { useMonthlyPlan } from "@nexia/shared/hooks/training/useMonthlyPlan";
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
        </div>
    );
};
