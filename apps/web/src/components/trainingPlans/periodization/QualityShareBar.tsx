/**
 * QualityShareBar.tsx — % cualidad física (color de catálogo + track premium).
 */

import React from "react";

import { cn } from "@/lib/utils";

import {
    QUALITY_SHARE_BAR_DOT_CLASS,
    QUALITY_SHARE_BAR_FILL_CLASS,
    QUALITY_SHARE_BAR_LABEL_CLASS,
    QUALITY_SHARE_BAR_LABEL_COMFORT_CLASS,
    QUALITY_SHARE_BAR_PERCENT_CLASS,
    QUALITY_SHARE_BAR_TRACK_CLASS,
    qualityShareBarDotStyle,
    qualityShareBarFillStyle,
    qualityShareBarLabelToneStyle,
} from "./qualityShareBarPresentation";

interface Props {
    name: string;
    percentage: number;
    colorHex: string;
    className?: string;
    /** comfortable: sin truncar etiqueta (p. ej. «Fuerza máxima» en contexto día). */
    labelDensity?: "default" | "comfortable";
}

export const QualityShareBar: React.FC<Props> = ({
    name,
    percentage,
    colorHex,
    className,
    labelDensity = "default",
}) => {
    const clamped = Math.max(0, Math.min(100, percentage));

    return (
        <div className={cn("flex min-w-0 items-center gap-2", className)}>
            <span
                className={QUALITY_SHARE_BAR_DOT_CLASS}
                style={qualityShareBarDotStyle(colorHex)}
                aria-hidden
            />
            <span
                className={
                    labelDensity === "comfortable"
                        ? QUALITY_SHARE_BAR_LABEL_COMFORT_CLASS
                        : QUALITY_SHARE_BAR_LABEL_CLASS
                }
                style={qualityShareBarLabelToneStyle(colorHex)}
                title={name}
            >
                {name}
            </span>
            <div
                className={QUALITY_SHARE_BAR_TRACK_CLASS}
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${name} ${clamped} por ciento`}
            >
                <div
                    className={QUALITY_SHARE_BAR_FILL_CLASS}
                    style={qualityShareBarFillStyle(colorHex, clamped)}
                />
            </div>
            <span className={QUALITY_SHARE_BAR_PERCENT_CLASS}>{clamped}%</span>
        </div>
    );
};
