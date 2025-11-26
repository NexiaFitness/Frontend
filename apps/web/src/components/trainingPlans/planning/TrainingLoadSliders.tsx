/**
 * TrainingLoadSliders.tsx — Sliders visuales con bloques para Volume e Intensity
 *
 * Contexto:
 * - Componente para dashboards de planning analytics
 * - Muestra carga de entrenamiento en formato visual (bloques)
 * - Valores de 1-10 para coherencia
 * - Por defecto en modo read-only (solo visualización)
 *
 * Responsabilidades:
 * - Renderizar card con título "Training Load"
 * - Mostrar bloques visuales de Volume (10 bloques)
 * - Mostrar bloques visuales de Intensity (10 bloques)
 * - Permitir edición si readOnly={false}
 *
 * Notas:
 * - Usa colores del proyecto (#3b82f6 para Volume, #f59e0b para Intensity)
 * - Bloques llenos vs vacíos según el valor
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { TYPOGRAPHY } from "@/utils/typography";

export interface TrainingLoadSlidersProps {
    volumeLevel: number; // 1-10
    intensityLevel: number; // 1-10
    readOnly?: boolean; // Default: true
    showTitle?: boolean; // Default: true - Si false, no muestra card ni título
    onVolumeChange?: (value: number) => void;
    onIntensityChange?: (value: number) => void;
}

interface BlockSliderProps {
    label: string;
    value: number;
    max: number;
    color: "blue" | "amber";
    readOnly?: boolean;
    onChange?: (value: number) => void;
}

const BlockSlider: React.FC<BlockSliderProps> = ({
    label,
    value,
    max,
    color,
    readOnly,
    onChange,
}) => {
    const blocks = Array.from({ length: max }, (_, i) => i + 1);
    const filledCount = Math.round(value);

    const colorClasses = {
        blue: {
            filled: "bg-blue-500",
            empty: "bg-slate-200",
            hover: "hover:bg-blue-400",
        },
        amber: {
            filled: "bg-amber-500",
            empty: "bg-slate-200",
            hover: "hover:bg-amber-400",
        },
    };

    const colors = colorClasses[color];

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                    {label}
                </span>
                <span className="text-sm text-slate-600 font-semibold">
                    {value.toFixed(0)} / {max}
                </span>
            </div>
            <div className="flex gap-1.5">
                {blocks.map((block) => {
                    const isFilled = block <= filledCount;
                    return (
                        <button
                            key={block}
                            onClick={() => !readOnly && onChange?.(block)}
                            disabled={readOnly}
                            className={`
                                flex-1 h-6 rounded transition-all duration-200
                                ${isFilled ? colors.filled : colors.empty}
                                ${!readOnly && colors.hover}
                                ${!readOnly && "cursor-pointer active:scale-95"}
                                ${readOnly && "cursor-default"}
                            `}
                            aria-label={`${label} level ${block}`}
                            title={`Set ${label} to ${block}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export const TrainingLoadSliders: React.FC<TrainingLoadSlidersProps> = ({
    volumeLevel,
    intensityLevel,
    readOnly = true,
    showTitle = true,
    onVolumeChange,
    onIntensityChange,
}) => {
    const content = (
        <div className="space-y-6">
            <BlockSlider
                label="VOLUMEN"
                value={volumeLevel}
                max={10}
                color="blue"
                readOnly={readOnly}
                onChange={onVolumeChange}
            />
            <BlockSlider
                label="INTENSIDAD"
                value={intensityLevel}
                max={10}
                color="amber"
                readOnly={readOnly}
                onChange={onIntensityChange}
            />
        </div>
    );

    if (!showTitle) {
        return content;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className={`${TYPOGRAPHY.cardTitle} mb-6`}>Training Load</h3>
            {content}
        </div>
    );
};