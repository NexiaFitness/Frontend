/**
 * PhysicalQualitiesList.tsx — Lista editable de cualidades físicas con porcentajes
 *
 * Contexto:
 * - Lista de cualidades físicas con inputs numéricos
 * - Usado en dashboards de planning analytics
 * - Permite edición de porcentajes si editable={true}
 * - Muestra total calculado automáticamente
 *
 * Responsabilidades:
 * - Mostrar lista de cualidades con indicadores de color
 * - Inputs numéricos editables (si editable={true})
 * - Botón "+ Add Quality" (si editable={true})
 * - Calcular y mostrar total
 * - Validar que total = 100%
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React, { useState, useMemo } from "react";
import type { TrainingPlanDistributionItem } from "@nexia/shared/types/trainingAnalytics";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";

export interface PhysicalQualitiesListProps {
    qualities: TrainingPlanDistributionItem[];
    editable?: boolean; // Default: false
    onUpdate?: (qualities: TrainingPlanDistributionItem[]) => void;
}

const QUALITY_COLORS: Record<string, string> = {
    Strength: "#3b82f6", // blue-500
    Power: "#f59e0b", // amber-500
    Aerobic: "#10b981", // green-500
    Mobility: "#8b5cf6", // purple-500
    Speed: "#ec4899", // pink-500
    Endurance: "#06b6d4", // cyan-500
    Fuerza: "#3b82f6",
    Potencia: "#f59e0b",
    Aeróbico: "#10b981",
    Movilidad: "#8b5cf6",
    Velocidad: "#ec4899",
    Resistencia: "#06b6d4",
};

// Paleta de colores consistente con otros gráficos del proyecto
const CHART_COLORS = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
];

const getColorForQuality = (qualityName: string, index: number): string => {
    if (QUALITY_COLORS[qualityName]) {
        return QUALITY_COLORS[qualityName];
    }
    // Fallback: usar paleta de colores del proyecto
    return CHART_COLORS[index % CHART_COLORS.length];
};

export const PhysicalQualitiesList: React.FC<PhysicalQualitiesListProps> = ({
    qualities,
    editable = false,
    onUpdate,
}) => {
    const [localQualities, setLocalQualities] = useState<TrainingPlanDistributionItem[]>(qualities);

    // Sincronizar con props cuando cambien
    React.useEffect(() => {
        setLocalQualities(qualities);
    }, [qualities]);

    // Calcular total
    const total = useMemo(() => {
        return localQualities.reduce((sum, q) => sum + q.percentage, 0);
    }, [localQualities]);

    // Validar total
    const isTotalValid = total === 100;

    const handlePercentageChange = (index: number, newPercentage: number) => {
        if (!editable || !onUpdate) return;

        const updated = [...localQualities];
        updated[index] = {
            ...updated[index],
            percentage: Math.max(0, Math.min(100, newPercentage)),
        };
        setLocalQualities(updated);
        onUpdate(updated);
    };

    const handleAddQuality = () => {
        if (!editable || !onUpdate) return;

        const newQuality: TrainingPlanDistributionItem = {
            name: `Quality ${localQualities.length + 1}`,
            percentage: 0,
        };
        const updated = [...localQualities, newQuality];
        setLocalQualities(updated);
        onUpdate(updated);
    };

    if (localQualities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
                <p className="mb-4">No hay cualidades físicas definidas</p>
                {editable && (
                    <Button variant="outline" size="sm" onClick={handleAddQuality}>
                        + Agregar Cualidad
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Lista de cualidades */}
            <div className="space-y-2">
                {localQualities.map((quality, index) => {
                    const color = getColorForQuality(quality.name, index);
                    return (
                        <div
                            key={`${quality.name}-${index}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            {/* Color indicator */}
                            <div
                                className="w-4 h-4 rounded flex-shrink-0"
                                style={{ backgroundColor: color }}
                            />

                            {/* Nombre */}
                            <span className="flex-1 text-sm font-medium text-slate-700 min-w-0 truncate">
                                {quality.name}
                            </span>

                            {/* Input de porcentaje */}
                            {editable ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={quality.percentage}
                                        onChange={(e) =>
                                            handlePercentageChange(
                                                index,
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        min={0}
                                        max={100}
                                        step={1}
                                        className="w-20 text-right"
                                    />
                                    <span className="text-sm text-slate-500">%</span>
                                </div>
                            ) : (
                                <span className="text-sm font-semibold text-slate-900">
                                    {quality.percentage.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Botón agregar (si editable) */}
            {editable && (
                <div className="pt-2 border-t border-slate-200">
                    <Button variant="outline" size="sm" onClick={handleAddQuality} className="w-full">
                        + Agregar Cualidad
                    </Button>
                </div>
            )}

            {/* Total */}
            <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Total</span>
                    <span
                        className={`text-sm font-bold ${
                            isTotalValid ? "text-slate-900" : "text-red-600"
                        }`}
                    >
                        {total.toFixed(1)}%
                    </span>
                </div>
                {!isTotalValid && editable && (
                    <p className="text-xs text-red-600 mt-1">
                        El total debe ser exactamente 100%
                    </p>
                )}
            </div>
        </div>
    );
};

