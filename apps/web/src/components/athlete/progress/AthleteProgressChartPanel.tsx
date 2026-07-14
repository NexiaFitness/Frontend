/**
 * AthleteProgressChartPanel.tsx — Contenedor glass para gráficos V10.
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { ATHLETE_SECTION_LABEL } from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_PROGRESS_CHART_PANEL,
    ATHLETE_PROGRESS_EMPTY,
} from "./athleteProgressViewPresentation";

export interface AthleteProgressChartPanelProps {
    label: string;
    title: string;
    subtitle?: string;
    emptyMessage?: string;
    isEmpty?: boolean;
    children: React.ReactNode;
}

export const AthleteProgressChartPanel: React.FC<AthleteProgressChartPanelProps> = ({
    label,
    title,
    subtitle,
    emptyMessage,
    isEmpty = false,
    children,
}) => {
    return (
        <section className={ATHLETE_PROGRESS_CHART_PANEL} aria-label={title}>
            <NexiaGlassAccentRim />
            <div className="relative space-y-1">
                <p className={ATHLETE_SECTION_LABEL}>{label}</p>
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                {subtitle && (
                    <p className="text-caption text-muted-foreground">{subtitle}</p>
                )}
            </div>
            {isEmpty && emptyMessage ? (
                <p className={ATHLETE_PROGRESS_EMPTY}>{emptyMessage}</p>
            ) : (
                <div className="relative -mx-1">{children}</div>
            )}
        </section>
    );
};
