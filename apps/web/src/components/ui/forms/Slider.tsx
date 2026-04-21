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
    labelIcon?: React.ReactNode;
    value: number;
    min: number;
    max: number;
    step?: number;
    color?: "primary" | "warning";
    readOnly?: boolean;
    onChange?: (value: number) => void;
}


export const Slider: React.FC<SliderProps> = ({
    label,
    labelIcon,
    value,
    min,
    max,
    step = 1,
    color = "primary",
    readOnly = false,
    onChange,
}) => {
    const selectedColor = color || "primary";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!readOnly && onChange) {
            const newValue = parseFloat(e.target.value);
            onChange(newValue);
        }
    };

    const trackFillPercent = ((value - min) / (max - min)) * 100;
    const trackColor =
        selectedColor === "primary"
            ? "hsl(var(--primary))"
            : "hsl(var(--warning))";
    const thumbClass =
        selectedColor === "primary"
            ? "[&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
            : "[&::-webkit-slider-thumb]:bg-warning [&::-moz-range-thumb]:bg-warning";

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    {labelIcon}
                    <span>{label}</span>
                </label>
                <span className="text-sm font-medium text-foreground">
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
                    w-full h-2 bg-input rounded-lg appearance-none cursor-pointer
                    ${readOnly ? "opacity-60 cursor-not-allowed" : ""}
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-md
                    ${thumbClass}
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:shadow-md
                `}
                style={{
                    background: readOnly
                        ? undefined
                        : `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${trackFillPercent}%, hsl(var(--input)) ${trackFillPercent}%, hsl(var(--input)) 100%)`,
                }}
            />
        </div>
    );
};











