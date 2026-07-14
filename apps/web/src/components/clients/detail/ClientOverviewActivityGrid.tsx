/**
 * ClientOverviewActivityGrid.tsx — Grid de actividad reciente (Card-7/8, DESIGN.md).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronRight,
    Dumbbell,
    Sparkles,
    CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/buttons";
import type { OverviewPulseRow } from "@/hooks/clients/clientOverviewPulse.types";
import {
    OVERVIEW_ACTIVITY_CARD_CLASS,
    OVERVIEW_ACTIVITY_LABELS,
    OVERVIEW_EMPTY_CARD_CLASS,
    OVERVIEW_ZONE_TITLES,
} from "./clientOverviewPresentation";
import { TYPOGRAPHY } from "@/utils/typography";
import { cn } from "@/lib/utils";

export interface ClientOverviewActivityGridProps {
    rows: OverviewPulseRow[];
}

function rowIcon(kind: OverviewPulseRow["kind"]) {
    switch (kind) {
        case "last_session":
            return CalendarCheck;
        case "signal":
            return Sparkles;
        default:
            return Dumbbell;
    }
}

function rowAccentClass(row: OverviewPulseRow): string {
    if (row.kind === "signal" && row.severity === "warning") {
        return "border-l-[3px] border-l-warning bg-warning/10";
    }
    if (row.kind === "signal") {
        return "border-l-[3px] border-l-primary bg-primary/10";
    }
    if (row.kind === "last_session") {
        return "border-l-[3px] border-l-success bg-success/10";
    }
    return "";
}

export const ClientOverviewActivityGrid: React.FC<ClientOverviewActivityGridProps> = ({
    rows,
}) => {
    const navigate = useNavigate();
    const isEmptyOnly = rows.length === 1 && rows[0].kind === "empty";
    const activityRows = rows.filter((r) => r.kind !== "empty");

    if (isEmptyOnly) {
        const empty = rows[0];
        return (
            <section data-testid="client-overview-activity">
                <div className={OVERVIEW_EMPTY_CARD_CLASS}>
                    <h3 className={`${TYPOGRAPHY.cardTitle} text-foreground`}>
                        {empty.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{empty.detail}</p>
                    {empty.href && (
                        <div className="mt-4">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(empty.href!)}
                            >
                                {OVERVIEW_ACTIVITY_LABELS.emptyCta}
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section data-testid="client-overview-activity">
            <h3 className={`${TYPOGRAPHY.dashboardViewHeading} mb-4 text-foreground`}>
                {OVERVIEW_ZONE_TITLES.activity}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activityRows.map((row) => {
                    const Icon = rowIcon(row.kind);
                    const accent = rowAccentClass(row);
                    return (
                        <button
                            key={row.id}
                            type="button"
                            className={cn(OVERVIEW_ACTIVITY_CARD_CLASS, accent)}
                            onClick={() => row.href && navigate(row.href)}
                            disabled={!row.href}
                        >
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 rounded-lg bg-surface-2 p-2.5 text-primary">
                                    <Icon className="size-5" aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={TYPOGRAPHY.labelSmall}>{row.title}</p>
                                    <p className="mt-1 text-sm font-medium text-foreground line-clamp-3">
                                        {row.detail}
                                    </p>
                                </div>
                                {row.href && (
                                    <ChevronRight
                                        className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                                        aria-hidden
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
