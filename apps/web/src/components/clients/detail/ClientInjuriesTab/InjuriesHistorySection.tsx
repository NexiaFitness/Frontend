/**
 * InjuriesHistorySection.tsx — Historial de lesiones
 *
 * Lista con filtro de estado, siguiendo patrón de TestingTab (lista + filtros).
 *
 * @author Nelson Valero
 * @since v5.7.0
 */

import React, { useMemo, useState } from "react";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";

interface InjuriesHistorySectionProps {
    injuries: InjuryWithDetails[];
    totalCount: number;
    isLoading: boolean;
}

type FilterValue = "all" | "active" | "resolved" | "monitoring";

const statusLabel = (status: string) => {
    if (status === "resolved") return "Resuelta";
    if (status === "monitoring") return "Monitoreo";
    return "Activa";
};

const statusColor = (status: string) => {
    switch (status) {
        case "resolved":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "monitoring":
            return "bg-amber-50 text-amber-700 border-amber-200";
        default:
            return "bg-red-50 text-red-700 border-red-200";
    }
};

export const InjuriesHistorySection: React.FC<InjuriesHistorySectionProps> = ({
    injuries,
    totalCount,
    isLoading,
}) => {
    const [filter, setFilter] = useState<FilterValue>("all");

    const filteredInjuries = useMemo(() => {
        if (filter === "all") return injuries;
        return injuries.filter((injury) => injury.status === filter);
    }, [filter, injuries]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Historial completo ({totalCount})
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Ordenado por fecha de registro (más reciente primero).
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Estado:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterValue)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                    >
                        <option value="all">Todas</option>
                        <option value="active">Activas</option>
                        <option value="monitoring">Monitoreo</option>
                        <option value="resolved">Resueltas</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <LoadingSpinner />
                </div>
            ) : filteredInjuries.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                    No hay lesiones en el historial para este filtro.
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredInjuries
                        .slice()
                        .sort(
                            (a, b) =>
                                new Date(b.injury_date).getTime() - new Date(a.injury_date).getTime()
                        )
                        .map((injury) => (
                            <div
                                key={injury.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col gap-2"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Articulación</p>
                                        <p className="text-base font-semibold text-gray-900">
                                            {injury.joint_name || "N/D"}
                                        </p>
                                        {injury.movement_name && (
                                            <p className="text-sm text-gray-600">
                                                Movimiento: {injury.movement_name}
                                            </p>
                                        )}
                                        {injury.muscle_name && (
                                            <p className="text-sm text-gray-600">
                                                Músculo: {injury.muscle_name}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColor(
                                            injury.status
                                        )}`}
                                    >
                                        {statusLabel(injury.status)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span>
                                        Dolor: <strong>{injury.pain_level}/5</strong>
                                    </span>
                                    {injury.injury_date && (
                                        <span>
                                            Inicio:{" "}
                                            {new Date(injury.injury_date).toLocaleDateString("es-ES")}
                                        </span>
                                    )}
                                    {injury.resolution_date && (
                                        <span>
                                            Resolución:{" "}
                                            {new Date(injury.resolution_date).toLocaleDateString("es-ES")}
                                        </span>
                                    )}
                                </div>
                                {injury.notes && (
                                    <p className="text-sm text-gray-600">{injury.notes}</p>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};


