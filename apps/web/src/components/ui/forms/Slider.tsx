/**
 * Slider.tsx — Componente de slider (range input)
 *
 * Contexto:
 * - Input range estilizado para dashboards de planning
 * - Usado para ajustar Volume e Intensity (1-10)
 * - Colores: blue para Volume, amber para Intensity
 *
 * Responsabilidades:
 * - Renderizar slider HTML5 estilizado
 * - Mostrar label con valor actual
 * - Soporte para modo read-only
 * - Colores personalizables
 *
 * Notas: style en input justificado — gradiente lineal del track según value/min/max (runtime).
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React from "react";

export interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    color?: "blue" | "amber";
    readOnly?: boolean;
    onChange?: (value: number) => void;
}

const colorClasses: Record<NonNullable<SliderProps["color"]>, string> = {
    blue: "accent-blue-500",
    amber: "accent-amber-500",
};

export const Slider: React.FC<SliderProps> = ({
    label,
    value,
    min,
    max,
    step = 1,
    color = "blue",
    readOnly = false,
    onChange,
}) => {
    const selectedColor = color || "blue";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!readOnly && onChange) {
            const newValue = parseFloat(e.target.value);
            onChange(newValue);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
                <span className="text-sm font-semibold text-gray-900">
                    {value}/{max}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                disabled={readOnly}
                className={`
                    w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                    ${readOnly ? "opacity-60 cursor-not-allowed" : ""}
                    ${colorClasses[selectedColor]}
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-md
                    ${selectedColor === "blue"
                        ? "[&::-webkit-slider-thumb]:bg-blue-500"
                        : "[&::-webkit-slider-thumb]:bg-amber-500"
                    }
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:shadow-md
                    ${selectedColor === "blue"
                        ? "[&::-moz-range-thumb]:bg-blue-500"
                        : "[&::-moz-range-thumb]:bg-amber-500"
                    }
                `}
                style={{
                    background: readOnly
                        ? undefined
                        : `linear-gradient(to right, ${
                              selectedColor === "blue" ? "#3b82f6" : "#f59e0b"
                          } 0%, ${
                              selectedColor === "blue" ? "#3b82f6" : "#f59e0b"
                          } ${((value - min) / (max - min)) * 100}%, #e5e7eb ${
                              ((value - min) / (max - min)) * 100
                          }%, #e5e7eb 100%)`,
                }}
            />
        </div>
    );
};











