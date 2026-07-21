/**
 * ClientOverviewLastSessionCard.tsx — Card última sesión completada (UX-OVERVIEW v2 F2).
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";
import type { TrainingSession } from "@nexia/shared/types/training";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import {
    OVERVIEW_ACTIVITY_CARD_CLASS,
    OVERVIEW_ACTIVITY_LABELS,
    OVERVIEW_EMPTY_CARD_CLASS,
    OVERVIEW_HOVER_CARD,
    OVERVIEW_SECTION_SHELL,
    clientTabPath,
} from "./clientOverviewPresentation";
import { TYPOGRAPHY } from "@/utils/typography";
import { cn } from "@/lib/utils";

export interface ClientOverviewLastSessionCardProps {
    clientId: number;
    session: TrainingSession | null;
    isLoading?: boolean;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
    });
}

export const ClientOverviewLastSessionCard: React.FC<ClientOverviewLastSessionCardProps> = ({
    clientId,
    session,
    isLoading = false,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (isLoading) {
        return (
            <div
                className={cn(OVERVIEW_SECTION_SHELL, "animate-pulse space-y-3")}
                data-testid="client-overview-last-session"
            >
                <div className="h-4 w-32 rounded bg-surface-2" />
                <div className="h-6 w-48 rounded bg-surface-2" />
            </div>
        );
    }

    if (!session?.session_date) {
        return (
            <div className={OVERVIEW_EMPTY_CARD_CLASS} data-testid="client-overview-last-session">
                <h4 className={`${TYPOGRAPHY.cardTitle} text-foreground`}>
                    {OVERVIEW_ACTIVITY_LABELS.lastSession}
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                    {OVERVIEW_ACTIVITY_LABELS.emptyDetail}
                </p>
                <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate(clientTabPath(clientId, "sessions"))}
                >
                    {OVERVIEW_ACTIVITY_LABELS.emptyCta}
                </Button>
            </div>
        );
    }

    const sessionLabel =
        session.session_type || session.session_name || "Sesión";

    return (
        <div
            className={cn(OVERVIEW_SECTION_SHELL, OVERVIEW_HOVER_CARD, "h-full")}
            data-testid="client-overview-last-session"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <CalendarCheck className="size-5 text-success" aria-hidden />
                    <h4 className={`${TYPOGRAPHY.dashboardViewHeading} text-foreground`}>
                        {OVERVIEW_ACTIVITY_LABELS.lastSession}
                    </h4>
                </div>
                <Badge variant="subtle-success">{OVERVIEW_ACTIVITY_LABELS.completedBadge}</Badge>
            </div>

            <p className="mt-3 text-sm font-semibold text-foreground">{sessionLabel}</p>
            <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(session.session_date)}
            </p>

            <button
                type="button"
                className={cn(
                    OVERVIEW_ACTIVITY_CARD_CLASS,
                    "mt-4 flex items-center justify-between",
                    OVERVIEW_HOVER_CARD,
                )}
                onClick={() =>
                    navigate(`/dashboard/session-programming/sessions/${session.id}`, {
                        state: returnToStateFromView(location),
                    })
                }
            >
                <span className="text-sm font-medium text-foreground">
                    {OVERVIEW_ACTIVITY_LABELS.viewExecution}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </button>
        </div>
    );
};
