/**
 * QualityShareBar.tsx — Barra de % cualidad física (tinte glass, paridad premium).
 */

import React from "react";

import { cn } from "@/lib/utils";

import {
    QUALITY_SHARE_BAR_DOT_CLASS,
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
}) => (
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
        <div className={QUALITY_SHARE_BAR_TRACK_CLASS} aria-hidden>
            <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={qualityShareBarFillStyle(colorHex, percentage)}
            />
        </div>
        <span className={QUALITY_SHARE_BAR_PERCENT_CLASS}>{percentage}%</span>
    </div>
);
