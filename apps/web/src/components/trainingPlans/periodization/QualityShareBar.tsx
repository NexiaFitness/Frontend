/**
 * QualityShareBar.tsx — % cualidad física (color de catálogo + track premium).
 * Lectura y edición (constructor D-PAP, bloque activo, tarjetas).
 */

import React from "react";

import { cn } from "@/lib/utils";

import {
    QUALITY_SHARE_BAR_DOT_CLASS,
    QUALITY_SHARE_BAR_FILL_CLASS,
    QUALITY_SHARE_BAR_LABEL_CLASS,
    QUALITY_SHARE_BAR_LABEL_COMFORT_CLASS,
    QUALITY_SHARE_BAR_PERCENT_CLASS,
    QUALITY_SHARE_BAR_RANGE_WRAP,
    QUALITY_SHARE_BAR_STACKED_HEADER_CLASS,
    QUALITY_SHARE_BAR_STACKED_NAME_CLASS,
    QUALITY_SHARE_BAR_STACKED_ROOT_CLASS,
    QUALITY_SHARE_BAR_STACKED_TRACK_CLASS,
    QUALITY_SHARE_BAR_TRACK_CLASS,
    QUALITY_SHARE_BAR_TRACK_OVERLAY_CLASS,
    qualityShareBarDotStyle,
    qualityShareBarFillStyle,
    qualityShareBarLabelToneStyle,
    qualityShareBarRangeClass,
} from "./qualityShareBarPresentation";

interface Props {
    name: string;
    percentage: number;
    colorHex: string;
    className?: string;
    /**
     * inline: etiqueta y pista en fila (tarjetas compactas, constructor bloque).
     * stacked: cabecera + pista ancho completo (p. ej. mix en «Hoy toca»).
     */
    layout?: "inline" | "stacked";
    /** comfortable: sin truncar etiqueta (p. ej. «Fuerza máxima» en contexto día). */
    labelDensity?: "default" | "comfortable";
    /** Ayuda junto al nombre (p. ej. tooltip en constructor). */
    labelAccessory?: React.ReactNode;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    id?: string;
    onChange?: (value: number) => void;
}

export const QualityShareBar: React.FC<Props> = ({
    name,
    percentage,
    colorHex,
    className,
    layout = "inline",
    labelDensity = "default",
    labelAccessory,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    id,
    onChange,
}) => {
    const clamped = Math.max(min, Math.min(max, Math.round(percentage)));
    const editable = onChange != null;
    const meterAriaLabel = `${name} ${clamped} por ciento`;

    const fill = (
        <div
            className={QUALITY_SHARE_BAR_FILL_CLASS}
            style={qualityShareBarFillStyle(colorHex, clamped)}
        />
    );

    const trackReadOnly = (
        <div
            className={
                layout === "stacked"
                    ? QUALITY_SHARE_BAR_STACKED_TRACK_CLASS
                    : QUALITY_SHARE_BAR_TRACK_CLASS
            }
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={meterAriaLabel}
        >
            {fill}
        </div>
    );

    const trackEditable = (
        <div
            className={cn(
                QUALITY_SHARE_BAR_RANGE_WRAP,
                layout === "stacked" && "w-full flex-none",
            )}
        >
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2">
                <div className={QUALITY_SHARE_BAR_TRACK_OVERLAY_CLASS} aria-hidden>
                    {fill}
                </div>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={clamped}
                disabled={disabled}
                onChange={(e) => onChange?.(Number(e.target.value))}
                className={qualityShareBarRangeClass()}
                style={{ "--quality-accent": colorHex } as React.CSSProperties}
                aria-label={meterAriaLabel}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={clamped}
            />
        </div>
    );

    const track = editable ? trackEditable : trackReadOnly;

    const labelClass =
        labelDensity === "comfortable"
            ? QUALITY_SHARE_BAR_LABEL_COMFORT_CLASS
            : QUALITY_SHARE_BAR_LABEL_CLASS;

    if (layout === "stacked") {
        return (
            <div className={cn(QUALITY_SHARE_BAR_STACKED_ROOT_CLASS, className)}>
                <div className={QUALITY_SHARE_BAR_STACKED_HEADER_CLASS}>
                    <span
                        className={QUALITY_SHARE_BAR_STACKED_NAME_CLASS}
                        style={qualityShareBarLabelToneStyle(colorHex)}
                        title={name}
                    >
                        <span
                            className={QUALITY_SHARE_BAR_DOT_CLASS}
                            style={qualityShareBarDotStyle(colorHex)}
                            aria-hidden
                        />
                        <span className="truncate">{name}</span>
                        {labelAccessory}
                    </span>
                    <span className={QUALITY_SHARE_BAR_PERCENT_CLASS}>{clamped}%</span>
                </div>
                {track}
            </div>
        );
    }

    return (
        <div className={cn("flex min-w-0 items-center gap-2", className)}>
            <span
                className={QUALITY_SHARE_BAR_DOT_CLASS}
                style={qualityShareBarDotStyle(colorHex)}
                aria-hidden
            />
            <span
                className={cn(labelClass, "inline-flex min-w-0 items-center gap-1")}
                style={qualityShareBarLabelToneStyle(colorHex)}
                title={name}
            >
                <span className="truncate">{name}</span>
                {labelAccessory}
            </span>
            {track}
            <span className={QUALITY_SHARE_BAR_PERCENT_CLASS}>{clamped}%</span>
        </div>
    );
};
