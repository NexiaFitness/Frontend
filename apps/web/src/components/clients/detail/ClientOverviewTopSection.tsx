/**
 * ClientOverviewTopSection.tsx — Alertas + plan en grid armónico (DESIGN.md).
 */

import React, { useRef } from "react";
import { useFatigueAlerts } from "@nexia/shared/hooks/clients/useFatigueAlerts";
import type { OverviewPlanCompact } from "@/hooks/clients/clientOverviewPulse.types";
import { ClientAlertsSection } from "./ClientAlertsSection";
import { ClientOverviewPlanCard } from "./ClientOverviewPlanCard";
import { OVERVIEW_ZONE_TITLES } from "./clientOverviewPresentation";
import { TYPOGRAPHY } from "@/utils/typography";

export interface ClientOverviewTopSectionProps {
    clientId: number;
    plan: OverviewPlanCompact;
    isLoadingPlans?: boolean;
    alertsSectionRef?: React.RefObject<HTMLDivElement>;
    planAlignedWithObjective?: boolean;
    onOpenCreatePlan?: () => void;
    onOpenUseTemplate?: () => void;
    onViewPlan?: (planId: number) => void;
}

export const ClientOverviewTopSection: React.FC<ClientOverviewTopSectionProps> = ({
    clientId,
    plan,
    isLoadingPlans = false,
    alertsSectionRef,
    planAlignedWithObjective = false,
    onOpenCreatePlan,
    onOpenUseTemplate,
    onViewPlan,
}) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const sectionRef = alertsSectionRef ?? internalRef;

    const { alerts, isLoading: isLoadingAlerts } = useFatigueAlerts(clientId);
    const unresolvedCount = alerts.filter((a) => !a.is_resolved).length;
    const hasAlerts = !isLoadingAlerts && unresolvedCount > 0;

    return (
        <section data-testid="client-overview-top-section">
            <h3 className={`${TYPOGRAPHY.dashboardViewHeading} mb-4 text-foreground`}>
                {OVERVIEW_ZONE_TITLES.action}
            </h3>
            <div
                className={`grid gap-4 ${hasAlerts ? "lg:grid-cols-2" : "grid-cols-1"}`}
            >
                {hasAlerts && (
                    <ClientAlertsSection
                        clientId={clientId}
                        sectionRef={sectionRef}
                        embedded
                        hideCreateButton
                        hideContextualLinks
                    />
                )}
                <div className={hasAlerts ? undefined : "max-w-2xl"}>
                    <ClientOverviewPlanCard
                        clientId={clientId}
                        plan={plan}
                        isLoading={isLoadingPlans}
                        embedded
                        planAlignedWithObjective={planAlignedWithObjective}
                        onOpenCreatePlan={onOpenCreatePlan}
                        onOpenUseTemplate={onOpenUseTemplate}
                        onViewPlan={onViewPlan}
                    />
                </div>
            </div>
        </section>
    );
};
