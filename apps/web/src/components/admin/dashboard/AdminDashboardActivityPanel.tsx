/**
 * AdminDashboardActivityPanel.tsx — Panel actividad sistema (glass premium).
 */

import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ADMIN_DASHBOARD_ACTIVITY_CARD,
    ADMIN_DASHBOARD_ACTIVITY_METRIC,
    ADMIN_DASHBOARD_ACTIVITY_METRICS_GRID,
    ADMIN_DASHBOARD_SECTION_LABEL,
} from "./adminDashboardPresentation";

export interface AdminActivityMetric {
    value: string;
    label: string;
}

export interface AdminDashboardActivityPanelProps {
    title: string;
    description: string;
    metrics: AdminActivityMetric[];
    onClick: () => void;
}

export const AdminDashboardActivityPanel: React.FC<AdminDashboardActivityPanelProps> = ({
    title,
    description,
    metrics,
    onClick,
}) => {
    return (
        <section className="flex min-h-0 flex-1 flex-col space-y-3" aria-label={title}>
            <p className={cn(ADMIN_DASHBOARD_SECTION_LABEL, "shrink-0")}>Actividad</p>
            <button
                type="button"
                onClick={onClick}
                className={cn(ADMIN_DASHBOARD_ACTIVITY_CARD, "min-h-0 flex-1")}
            >
                <NexiaGlassAccentRim />
                <div className="relative flex flex-1 flex-col justify-between gap-6 pt-1 text-left lg:gap-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1.5">
                            <h2 className="text-lg font-semibold text-foreground lg:text-xl">
                                {title}
                            </h2>
                            <p className="text-sm text-muted-foreground lg:text-base">
                                {description}
                            </p>
                        </div>
                        <ChevronRight
                            className="size-5 shrink-0 text-muted-foreground/70 lg:size-6"
                            aria-hidden
                        />
                    </div>
                    <div className={ADMIN_DASHBOARD_ACTIVITY_METRICS_GRID}>
                        {metrics.map((metric) => (
                            <div key={metric.label} className="text-center">
                                <p className={ADMIN_DASHBOARD_ACTIVITY_METRIC}>{metric.value}</p>
                                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                                    {metric.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </button>
        </section>
    );
};
