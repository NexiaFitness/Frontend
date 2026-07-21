/**
 * ClientOverviewTab.tsx — Tab Resumen premium (UX-OVERVIEW v2).
 *
 * Zonas: Acción → Comunicación → KPIs → Recomendaciones → Actividad gym → Relación.
 */

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { Client } from "@nexia/shared/types/client";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useClientOverviewPulse } from "@/hooks/clients/useClientOverviewPulse";
import { ClientAthleteCommsSection } from "./ClientAthleteCommsSection";
import { ClientOverviewKpiRow } from "./ClientOverviewKpiRow";
import { ClientOverviewLastSessionCard } from "./ClientOverviewLastSessionCard";
import { ClientOverviewLoadBridge } from "./ClientOverviewLoadBridge";
import { ClientOverviewRelationCollapsible } from "./ClientOverviewRelationCollapsible";
import { ClientOverviewTopSection } from "./ClientOverviewTopSection";
import { RecommendationsCards } from "./RecommendationsCards";
import {
    OVERVIEW_PAGE_SUBTITLE,
    OVERVIEW_ZONE_TITLES,
} from "./clientOverviewPresentation";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientOverviewTabProps {
    client: Client;
    clientId: number;
    trainingPlans?: TrainingPlan[];
    isLoadingPlans?: boolean;
    onOpenCreatePlan?: () => void;
    onOpenUseTemplate?: () => void;
    onViewPlan?: (planId: number) => void;
}

export const ClientOverviewTab: React.FC<ClientOverviewTabProps> = ({
    client,
    clientId,
    trainingPlans = [],
    isLoadingPlans = false,
    onOpenCreatePlan,
    onOpenUseTemplate,
    onViewPlan,
}) => {
    const [searchParams] = useSearchParams();
    const alertsSectionRef = useRef<HTMLDivElement>(null);
    const commsSectionRef = useRef<HTMLDivElement>(null);
    const isValidClientId = clientId > 0;

    const vm = useClientOverviewPulse({
        clientId,
        client,
        trainingPlans,
        isLoadingPlans,
        enabled: isValidClientId,
    });

    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
        let attempts = 0;
        let timerId: ReturnType<typeof setTimeout>;

        const tryScroll = () => {
            if (ref.current) {
                ref.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
                return;
            }
            if (attempts < 20) {
                attempts += 1;
                timerId = setTimeout(tryScroll, 100);
            }
        };

        timerId = setTimeout(tryScroll, 100);
        return () => clearTimeout(timerId);
    };

    useEffect(() => {
        const focus = searchParams.get("focus");
        if (focus === "alerts") return scrollToSection(alertsSectionRef);
        if (focus === "comms") return scrollToSection(commsSectionRef);
        return undefined;
    }, [searchParams]);

    if (!isValidClientId) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-muted-foreground">ID de cliente inválido</p>
            </div>
        );
    }

    if (vm.isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <section className="space-y-8">
            <h2 className="sr-only">{OVERVIEW_ZONE_TITLES.pageTitle}</h2>
            <p className="text-sm text-muted-foreground">{OVERVIEW_PAGE_SUBTITLE}</p>

            <ClientOverviewTopSection
                clientId={clientId}
                plan={vm.planCompact}
                isLoadingPlans={isLoadingPlans}
                alertsSectionRef={alertsSectionRef}
                planAlignedWithObjective={vm.recommendationsMode === "compact_ok"}
                onOpenCreatePlan={onOpenCreatePlan}
                onOpenUseTemplate={onOpenUseTemplate}
                onViewPlan={onViewPlan}
            />

            <div ref={commsSectionRef}>
                <ClientAthleteCommsSection clientId={clientId} />
            </div>

            <ClientOverviewKpiRow chips={vm.statChips} loadingFlags={vm.loadingFlags} />

            {vm.recommendationsMode === "incomplete" && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-5">
                    <RecommendationsCards clientId={vm.recommendationsClientId} />
                </div>
            )}

            {vm.recommendationsMode === "compact_ok" && (
                <section>
                    <h3 className={`${TYPOGRAPHY.dashboardViewHeading} mb-1 text-foreground`}>
                        {OVERVIEW_ZONE_TITLES.trainingProfile}
                    </h3>
                    <p className="mb-4 text-xs text-muted-foreground">
                        {OVERVIEW_ZONE_TITLES.trainingProfileHint}
                    </p>
                    <RecommendationsCards clientId={vm.recommendationsClientId} />
                </section>
            )}

            <section data-testid="client-overview-activity">
                <h3 className={`${TYPOGRAPHY.dashboardViewHeading} mb-4 text-foreground`}>
                    {OVERVIEW_ZONE_TITLES.activity}
                </h3>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ClientOverviewLastSessionCard
                        clientId={clientId}
                        session={vm.lastCompletedSession}
                        isLoading={vm.loadingFlags.sessions}
                    />
                    <ClientOverviewLoadBridge
                        clientId={clientId}
                        loadInsights={vm.loadInsights}
                        isLoading={vm.loadingFlags.loadInsights}
                        isError={vm.isError}
                    />
                </div>
            </section>

            {vm.showRelationBlock && (
                <ClientOverviewRelationCollapsible
                    clientId={clientId}
                    habitInsights={vm.habitInsights}
                    lastRating={vm.lastRating}
                />
            )}
        </section>
    );
};
