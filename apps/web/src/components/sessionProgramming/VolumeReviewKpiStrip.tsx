/**
 * KPIs de volumen en revisión de sesión — usa ContextStripShell (mismo patrón que
 * PeriodBlockConstructorSummaryStrip / SessionContextStrip).
 */

import React from "react";
import { Activity, BarChart3, SlidersHorizontal } from "lucide-react";

import type { WeeklyVolumeSummaryCounts } from "@nexia/shared";
import {
    VOLUME_REVIEW_KPI_ARIA,
    VOLUME_REVIEW_KPI_GROUPS_LABEL,
    VOLUME_REVIEW_KPI_SERIES_HINT,
    VOLUME_REVIEW_KPI_SERIES_LABEL,
} from "@nexia/shared/training/weeklyVolumePanelPresentation";
import { volumeStatusDotClass, volumeStatusLabel } from "@nexia/shared";
import { ContextStripShell } from "@/components/ui/ContextStripShell";
import { cn } from "@/lib/utils";

function StatusChip({
    count,
    status,
}: {
    count: number;
    status: "deficit" | "on_target" | "excess";
}) {
    if (count <= 0) return null;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5",
                "text-[11px] font-medium text-primary ring-1 ring-primary/30 tabular-nums"
            )}
        >
            <span className={cn(volumeStatusDotClass(status), "text-[8px] leading-none")} aria-hidden>
                ●
            </span>
            {count} {volumeStatusLabel(status)}
        </span>
    );
}

export interface VolumeReviewKpiStripProps {
    coveredCount: number;
    totalProgrammed: number;
    totalExpectedCovered: number;
    statusSummary: WeeklyVolumeSummaryCounts;
}

export const VolumeReviewKpiStrip: React.FC<VolumeReviewKpiStripProps> = ({
    coveredCount,
    totalProgrammed,
    totalExpectedCovered,
    statusSummary,
}) => {
    const hasStatus =
        statusSummary.deficit > 0 ||
        statusSummary.on_target > 0 ||
        statusSummary.excess > 0;

    return (
        <ContextStripShell
            ariaLabel={VOLUME_REVIEW_KPI_ARIA}
            zones={[
                {
                    icon: <Activity className="h-3.5 w-3.5" />,
                    label: VOLUME_REVIEW_KPI_GROUPS_LABEL,
                    children: (
                        <>
                            <p className="text-sm font-semibold text-foreground tabular-nums">
                                {coveredCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {coveredCount === 1 ? "grupo muscular" : "grupos musculares"}
                            </p>
                        </>
                    ),
                },
                {
                    icon: <BarChart3 className="h-3.5 w-3.5" />,
                    label: VOLUME_REVIEW_KPI_SERIES_LABEL,
                    children: (
                        <>
                            <p className="text-sm font-semibold text-foreground tabular-nums">
                                {totalProgrammed}
                                <span className="text-muted-foreground font-medium">
                                    {" "}
                                    / {totalExpectedCovered}
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {VOLUME_REVIEW_KPI_SERIES_HINT}
                            </p>
                        </>
                    ),
                },
                {
                    icon: <SlidersHorizontal className="h-3.5 w-3.5" />,
                    label: "Estado en sesión",
                    children:
                        coveredCount === 0 || !hasStatus ? (
                            <p className="text-sm text-muted-foreground">—</p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                <StatusChip count={statusSummary.deficit} status="deficit" />
                                <StatusChip count={statusSummary.on_target} status="on_target" />
                                <StatusChip count={statusSummary.excess} status="excess" />
                            </div>
                        ),
                },
            ]}
        />
    );
};
