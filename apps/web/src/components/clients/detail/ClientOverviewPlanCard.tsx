/**
 * ClientOverviewPlanCard.tsx — Tarjeta de plan activo / empty (pareja visual con alertas).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarRange, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import type { OverviewPlanCompact } from "@/hooks/clients/clientOverviewPulse.types";
import {
    OVERVIEW_ACTION_CARD,
    OVERVIEW_ZONE_TITLES,
    clientTabPath,
} from "./clientOverviewPresentation";
import { TYPOGRAPHY } from "@/utils/typography";
import { cn } from "@/lib/utils";

export interface ClientOverviewPlanCardProps {
    clientId: number;
    plan: OverviewPlanCompact;
    isLoading?: boolean;
    embedded?: boolean;
    onOpenCreatePlan?: () => void;
    onOpenUseTemplate?: () => void;
    onViewPlan?: (planId: number) => void;
}

export const ClientOverviewPlanCard: React.FC<ClientOverviewPlanCardProps> = ({
    clientId,
    plan,
    isLoading = false,
    embedded = false,
    onOpenCreatePlan,
    onOpenUseTemplate,
    onViewPlan,
}) => {
    const navigate = useNavigate();
    const shell = cn(
        OVERVIEW_ACTION_CARD,
        embedded && "h-full",
        plan.kind !== "none" && "border-primary/30",
    );

    if (isLoading) {
        return (
            <div className={cn(shell, "flex items-center justify-center")}>
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (plan.kind === "none") {
        return (
            <div className={shell} data-testid="client-overview-plan-empty">
                <div className="flex flex-1 flex-col justify-between gap-4">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <div className="rounded-lg bg-warning/20 p-2 text-warning">
                                <CalendarRange className="size-5" aria-hidden />
                            </div>
                            <p className={TYPOGRAPHY.labelSmall}>
                                {OVERVIEW_ZONE_TITLES.planEmpty}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {OVERVIEW_ZONE_TITLES.planEmptyDetail}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {onOpenCreatePlan && (
                            <Button variant="primary" size="sm" onClick={onOpenCreatePlan}>
                                Crear plan
                            </Button>
                        )}
                        {onOpenUseTemplate && (
                            <Button variant="outline" size="sm" onClick={onOpenUseTemplate}>
                                Usar plantilla
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const openPlanning = () => {
        if (plan.activePlanId == null) return;
        if (onViewPlan) {
            onViewPlan(plan.activePlanId);
        } else {
            navigate(clientTabPath(clientId, "planning", { plan: String(plan.activePlanId) }));
        }
    };

    return (
        <button
            type="button"
            data-testid="client-overview-plan-banner"
            onClick={openPlanning}
            className={cn(
                shell,
                "w-full text-left transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]",
            )}
        >
            <div className="flex h-full flex-col justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-lg bg-primary/20 p-2.5 text-primary">
                        <CalendarRange className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className={TYPOGRAPHY.labelSmall}>
                                {OVERVIEW_ZONE_TITLES.planActive}
                            </p>
                            <Badge variant="subtle-success">Activo</Badge>
                            {plan.kind === "multiple" && plan.planCount != null && (
                                <Badge variant="subtle-secondary">{plan.planCount} planes</Badge>
                            )}
                        </div>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                            {plan.activePlanName}
                        </p>
                        {plan.activePlanDateRange && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {plan.activePlanDateRange}
                            </p>
                        )}
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                </div>
                <p className="text-xs text-muted-foreground">
                    Abre el detalle en la pestaña Planificación
                </p>
            </div>
        </button>
    );
};
