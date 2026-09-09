/**
 * PlanningDateRangeMeta.tsx — Rango de fechas + duración (plan activo, bloque, wizard).
 */

import React from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatProgramDurationLabel } from "./planningShellUtils";
import { PLANNING_ACTIVE_PLAN_META } from "./planningShellPresentation";

function formatDateShort(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export interface PlanningDateRangeMetaProps {
    startDate: string;
    endDate: string;
    className?: string;
    testId?: string;
}

export const PlanningDateRangeMeta: React.FC<PlanningDateRangeMetaProps> = ({
    startDate,
    endDate,
    className,
    testId = "planning-date-range-meta",
}) => (
    <p
        className={cn(PLANNING_ACTIVE_PLAN_META, className)}
        data-testid={testId}
    >
        <CalendarDays className="size-3.5 shrink-0" aria-hidden />
        <span>
            {formatDateShort(startDate)} – {formatDateShort(endDate)}
        </span>
        <span className="text-muted-foreground/60" aria-hidden>
            ·
        </span>
        <span>{formatProgramDurationLabel(startDate, endDate)}</span>
    </p>
);
