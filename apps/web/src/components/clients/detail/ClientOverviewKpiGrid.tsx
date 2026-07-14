/**
 * ClientOverviewKpiGrid.tsx — Grid KPI uniforme tab Resumen (DESIGN.md).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    AlertTriangle,
    CalendarDays,
    Flame,
    Scale,
    Target,
    type LucideIcon,
} from "lucide-react";
import type {
    OverviewStatChip,
    OverviewStatChipId,
    OverviewStatChipTone,
} from "@/hooks/clients/clientOverviewPulse.types";
import {
    OVERVIEW_KPI_DESCRIPTIONS,
    OVERVIEW_KPI_TILE_CLASS,
    OVERVIEW_ZONE_TITLES,
} from "./clientOverviewPresentation";
import { TYPOGRAPHY } from "@/utils/typography";
import { cn } from "@/lib/utils";

const CHIP_ICONS: Record<OverviewStatChipId, LucideIcon> = {
    adherence: Target,
    monotony: Activity,
    weight: Scale,
    fatigue: Flame,
    risk: AlertTriangle,
    next_session: CalendarDays,
};

const TONE_BORDER: Record<OverviewStatChipTone, string> = {
    neutral: "border-border hover:border-primary/30",
    success: "border-success/30 bg-success/10 hover:border-success/50",
    warning: "border-warning/30 bg-warning/10 hover:border-warning/50",
    destructive: "border-destructive/30 bg-destructive/10 hover:border-destructive/50",
};

const TONE_VALUE: Record<OverviewStatChipTone, string> = {
    neutral: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
};

export interface ClientOverviewKpiGridProps {
    chips: OverviewStatChip[];
}

function parseWeightDisplay(raw: string): { value: string; delta: string } {
    const match = raw.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (!match) return { value: raw, delta: "" };
    return { value: match[1].trim(), delta: match[2].trim() };
}

export const ClientOverviewKpiGrid: React.FC<ClientOverviewKpiGridProps> = ({ chips }) => {
    const navigate = useNavigate();
    const visible = chips.filter((c) => !c.hidden);

    return (
        <section data-testid="client-overview-kpi-grid">
            <h3 className={`${TYPOGRAPHY.dashboardViewHeading} mb-4 text-foreground`}>
                {OVERVIEW_ZONE_TITLES.kpiSection}
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {visible.map((chip) => {
                    const Icon = CHIP_ICONS[chip.id];
                    const description = OVERVIEW_KPI_DESCRIPTIONS[chip.id] ?? "";
                    const parsed =
                        chip.id === "weight" ? parseWeightDisplay(chip.value) : { value: chip.value, delta: "" };

                    const inner = (
                        <>
                            <div className="flex items-center justify-between gap-2">
                                <span className={TYPOGRAPHY.labelSmall}>{chip.label}</span>
                                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                            </div>
                            <div>
                                <p
                                    className={cn(
                                        "text-2xl font-bold leading-none",
                                        TONE_VALUE[chip.tone],
                                    )}
                                >
                                    {parsed.value}
                                </p>
                                {parsed.delta && (
                                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                                        {parsed.delta}
                                    </p>
                                )}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{description}</p>
                        </>
                    );

                    const className = cn(OVERVIEW_KPI_TILE_CLASS, TONE_BORDER[chip.tone]);

                    if (chip.href) {
                        return (
                            <button
                                key={chip.id}
                                type="button"
                                className={cn(className, "w-full text-left")}
                                onClick={() => navigate(chip.href!)}
                            >
                                {inner}
                            </button>
                        );
                    }

                    return (
                        <div key={chip.id} className={className}>
                            {inner}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
