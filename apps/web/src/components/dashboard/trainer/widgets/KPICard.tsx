/**
 * KPICard — KPI premium dashboard entrenador (glass + rim).
 *
 * Tokens: trainerDashboardPresentation.ts
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    TRAINER_DASHBOARD_KPI_CARD,
    TRAINER_DASHBOARD_KPI_COLOR,
    TRAINER_DASHBOARD_KPI_DESCRIPTION,
    TRAINER_DASHBOARD_KPI_ICON_WRAP,
    TRAINER_DASHBOARD_KPI_LABEL,
    TRAINER_DASHBOARD_KPI_TREND_DOWN,
    TRAINER_DASHBOARD_KPI_TREND_NEUTRAL,
    TRAINER_DASHBOARD_KPI_TREND_UP,
    TRAINER_DASHBOARD_KPI_VALUE,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";

export type KPICardColor = "primary" | "success" | "warning" | "destructive" | "info";

interface KPICardProps {
    value: string | number;
    trend: string;
    label: string;
    description: string;
    icon: LucideIcon;
    color?: KPICardColor;
    isLoading?: boolean;
    className?: string;
}

function parseTrend(trend: string): number {
    return parseFloat(String(trend).replace(/[^0-9.-]/g, "")) || 0;
}

export const KPICard: React.FC<KPICardProps> = ({
    value,
    trend,
    label,
    description,
    icon: Icon,
    color = "primary",
    isLoading,
    className,
}) => {
    if (isLoading) {
        return (
            <div className={cn(TRAINER_DASHBOARD_KPI_CARD, "animate-pulse", className)}>
                <NexiaGlassAccentRim />
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-20 rounded bg-muted/50" />
                        <div className="h-8 w-14 rounded bg-muted/50" />
                        <div className="h-3 w-24 rounded bg-muted/40" />
                    </div>
                    <div className={cn(TRAINER_DASHBOARD_KPI_ICON_WRAP, "size-10 animate-pulse bg-muted/40")} />
                </div>
            </div>
        );
    }

    const trendNum = parseTrend(trend);
    const trendClass =
        trendNum > 0
            ? TRAINER_DASHBOARD_KPI_TREND_UP
            : trendNum < 0
              ? TRAINER_DASHBOARD_KPI_TREND_DOWN
              : TRAINER_DASHBOARD_KPI_TREND_NEUTRAL;

    return (
        <article className={cn(TRAINER_DASHBOARD_KPI_CARD, className)}>
            <NexiaGlassAccentRim />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className={TRAINER_DASHBOARD_KPI_LABEL}>{label}</p>
                    <p className={TRAINER_DASHBOARD_KPI_VALUE}>{value}</p>
                    <p className={TRAINER_DASHBOARD_KPI_DESCRIPTION}>{description}</p>
                    {trend ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold">
                            {trendNum > 0 ? (
                                <ArrowUpRight className={cn("h-3.5 w-3.5", trendClass)} aria-hidden />
                            ) : trendNum < 0 ? (
                                <ArrowDownRight className={cn("h-3.5 w-3.5", trendClass)} aria-hidden />
                            ) : (
                                <Minus className={cn("h-3.5 w-3.5", trendClass)} aria-hidden />
                            )}
                            <span className={trendClass}>{trend}</span>
                        </span>
                    ) : null}
                </div>
                <div className={cn(TRAINER_DASHBOARD_KPI_ICON_WRAP, TRAINER_DASHBOARD_KPI_COLOR[color])}>
                    <Icon className="h-5 w-5" aria-hidden />
                </div>
            </div>
        </article>
    );
};
