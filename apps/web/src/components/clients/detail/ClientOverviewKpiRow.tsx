/**
 * ClientOverviewKpiRow.tsx — Fila KPICard uniforme tab Resumen (UX-OVERVIEW v2 F2).
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
import { KPICard } from "@/components/dashboard/trainer/widgets";
import type {
    ClientOverviewPulseLoadingFlags,
    OverviewStatChip,
    OverviewStatChipId,
} from "@/hooks/clients/clientOverviewPulse.types";
import {
    OVERVIEW_CHIP_TONE_TO_KPI,
    OVERVIEW_KPI_DESCRIPTIONS,
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

function parseWeightChip(raw: string): { value: string; trend: string } {
    const match = raw.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (!match) return { value: raw, trend: "" };
    return { value: match[1].trim(), trend: match[2].trim() };
}

function chipLoading(
    id: OverviewStatChipId,
    flags: ClientOverviewPulseLoadingFlags,
): boolean {
    switch (id) {
        case "adherence":
        case "monotony":
            return flags.coherence;
        case "weight":
            return flags.progress;
        case "fatigue":
        case "risk":
            return flags.fatigue;
        case "next_session":
            return flags.sessions;
        default:
            return false;
    }
}

export interface ClientOverviewKpiRowProps {
    chips: OverviewStatChip[];
    loadingFlags: ClientOverviewPulseLoadingFlags;
}

export const ClientOverviewKpiRow: React.FC<ClientOverviewKpiRowProps> = ({
    chips,
    loadingFlags,
}) => {
    const navigate = useNavigate();
    const visible = chips.filter((c) => !c.hidden);

    return (
        <section
            data-testid="client-overview-kpi-section"
            aria-label={OVERVIEW_ZONE_TITLES.kpiSection}
        >
            <h3 className={`${TYPOGRAPHY.dashboardViewHeading} mb-4 text-foreground`}>
                {OVERVIEW_ZONE_TITLES.kpiSection}
            </h3>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
                {visible.map((chip) => {
                    const Icon = CHIP_ICONS[chip.id];
                    const parsed =
                        chip.id === "weight"
                            ? parseWeightChip(chip.value)
                            : { value: chip.value, trend: "" };
                    const isLoading = chipLoading(chip.id, loadingFlags);

                    return (
                        <button
                            key={chip.id}
                            type="button"
                            className={cn(
                                "w-full text-left",
                                chip.href && "cursor-pointer",
                                !chip.href && "cursor-default",
                            )}
                            disabled={!chip.href || isLoading}
                            onClick={() => chip.href && navigate(chip.href)}
                        >
                            <KPICard
                                value={parsed.value}
                                trend={parsed.trend}
                                label={chip.label}
                                description={OVERVIEW_KPI_DESCRIPTIONS[chip.id] ?? ""}
                                icon={Icon}
                                color={OVERVIEW_CHIP_TONE_TO_KPI[chip.tone]}
                                isLoading={isLoading}
                                className="h-full"
                            />
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
