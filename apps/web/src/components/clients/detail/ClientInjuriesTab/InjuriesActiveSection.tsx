/**
 * InjuriesActiveSection.tsx — Sección de lesiones activas
 *
 * Muestra cards con detalle resumido y CTA para registrar nuevas.
 *
 * @author Nelson Valero
 * @since v5.7.0
 */

import React from "react";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";

interface InjuriesActiveSectionProps {
    injuries: InjuryWithDetails[];
    isLoading: boolean;
    onAddClick: () => void;
}

const painLevelColor = (level: number) => {
    if (level <= 2) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (level === 3) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
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

export const InjuriesActiveSection: React.FC<InjuriesActiveSectionProps> = ({
    injuries,
    isLoading,
    onAddClick,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (!injuries || injuries.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Lesiones activas</h3>
                    <p className="text-gray-600 mt-1">Sin lesiones activas registradas.</p>
                </div>
                <button
                    onClick={onAddClick}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    Registrar lesión
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Lesiones activas</h3>
                <span className="text-sm text-gray-500">{injuries.length} registros</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {injuries.map((injury) => (
                    <div
                        key={injury.id}
                        className="bg-white rounded-lg shadow-sm border border-red-100 p-4 flex flex-col gap-3"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Articulación</p>
                                <p className="text-base font-semibold text-gray-900">
                                    {injury.joint_name || "N/D"}
                                </p>
                                {injury.movement_name && (
                                    <p className="text-sm text-gray-600 mt-1">
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
                                {injury.status === "active"
                                    ? "Activa"
                                    : injury.status === "resolved"
                                      ? "Resuelta"
                                      : "Monitoreo"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${painLevelColor(
                                    injury.pain_level
                                )}`}
                            >
                                Dolor {injury.pain_level}/5
                            </span>
                            {injury.injury_date && (
                                <span className="text-xs text-gray-500">
                                    Desde {new Date(injury.injury_date).toLocaleDateString("es-ES")}
                                </span>
                            )}
                        </div>

                        {injury.notes && (
                            <p className="text-sm text-gray-600 line-clamp-3">{injury.notes}</p>
                        )}

                        <div className="flex items-center gap-3 mt-auto">
                            <button
                                onClick={onAddClick}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Registrar nueva
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


