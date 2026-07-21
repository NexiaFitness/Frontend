/**
 * ClientOverviewLoadBridge.tsx — Puente carga max 2 señales (UX-OVERVIEW v2 F2).
 */

import React from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, Info } from "lucide-react";
import type {
    ClientLoadInsights,
    ClientLoadSignal,
} from "@nexia/shared/types/clientLoadInsights";
import { LoadingSpinner } from "@/components/ui/feedback";
import {
    OVERVIEW_ACTIVITY_LABELS,
    OVERVIEW_HOVER_CARD,
    OVERVIEW_SECTION_SHELL,
    clientTabPath,
} from "./clientOverviewPresentation";
import { PLATFORM_LINK_PRIMARY } from "@/components/ui/surface/platformPremiumPresentation";
import { TYPOGRAPHY } from "@/utils/typography";
import { cn } from "@/lib/utils";

const MAX_SIGNALS = 2;

export interface ClientOverviewLoadBridgeProps {
    clientId: number;
    loadInsights: ClientLoadInsights | null | undefined;
    isLoading?: boolean;
    isError?: boolean;
}

function SignalIcon({ signal }: { signal: ClientLoadSignal }) {
    if (signal.severity === "warning") {
        return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />;
    }
    return <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />;
}

export const ClientOverviewLoadBridge: React.FC<ClientOverviewLoadBridgeProps> = ({
    clientId,
    loadInsights,
    isLoading = false,
    isError = false,
}) => {
    if (isLoading) {
        return (
            <div
                className={cn(OVERVIEW_SECTION_SHELL, "flex items-center justify-center py-10")}
                data-testid="client-overview-load-bridge"
            >
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (isError || !loadInsights) {
        return null;
    }

    const signals = loadInsights.signals.slice(0, MAX_SIGNALS);
    const hasSignals = signals.length > 0;
    const gymHistoryHref = clientTabPath(clientId, "progress", { subtab: "performance" });

    if (!hasSignals) {
        return (
            <div className={OVERVIEW_SECTION_SHELL} data-testid="client-overview-load-bridge">
                <div className="flex items-center gap-2">
                    <Activity className="size-5 text-muted-foreground" aria-hidden />
                    <h4 className={`${TYPOGRAPHY.dashboardViewHeading} text-foreground`}>
                        {OVERVIEW_ACTIVITY_LABELS.loadBridge}
                    </h4>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                    {OVERVIEW_ACTIVITY_LABELS.loadEmpty}
                </p>
            </div>
        );
    }

    return (
        <div
            className={cn(OVERVIEW_SECTION_SHELL, OVERVIEW_HOVER_CARD, "h-full space-y-4")}
            data-testid="client-overview-load-bridge"
        >
            <div className="flex items-center gap-2">
                <Activity className="size-5 text-primary" aria-hidden />
                <h4 className={`${TYPOGRAPHY.dashboardViewHeading} text-foreground`}>
                    {OVERVIEW_ACTIVITY_LABELS.loadBridge}
                </h4>
            </div>

            <ul className="space-y-2">
                {signals.map((signal) => (
                    <li
                        key={`${signal.signal_type}-${signal.exercise_id}`}
                        className={cn(
                            "flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3",
                            signal.severity === "warning" &&
                                "border-l-[3px] border-l-warning bg-warning/10",
                            signal.severity !== "warning" &&
                                "border-l-[3px] border-l-primary bg-primary/10",
                        )}
                    >
                        <SignalIcon signal={signal} />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                                {signal.exercise_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{signal.message}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <Link to={gymHistoryHref} className={PLATFORM_LINK_PRIMARY}>
                {OVERVIEW_ACTIVITY_LABELS.gymHistoryLink}
            </Link>
        </div>
    );
};
