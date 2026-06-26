/**
 * ClientOverviewTab.tsx — Tab Resumen (UX-OVERVIEW v2, F0).
 *
 * F0: loop atleta↔entrenador (feedback + load) + acción inmediata (alertas|plan).
 * F2+ sustituirá MetricCard por KPICard y LoadBridge.
 */

import React, { useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Client } from "@nexia/shared/types/client";
import type { TrainingSession } from "@nexia/shared/types/training";
import type { PhysicalTestResultOut } from "@nexia/shared/types/testing";
import type { ClientProgress } from "@nexia/shared/types/progress";
import type { MetricCardColor } from "@nexia/shared/types/coherence";
import { MetricCard } from "@/components/ui/cards";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useCoherence } from "@nexia/shared/hooks/clients/useCoherence";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import {
    useGetClientTrainingSessionsQuery,
    useGetClientTestResultsQuery,
} from "@nexia/shared/api/clientsApi";
import {
    useGetActivePlanByClientQuery,
    useGetTrainingPlanRecommendationsQuery,
} from "@nexia/shared/api/trainingPlansApi";
import {
    buildPlanCompact,
    buildRecommendationsMode,
} from "@/hooks/clients/clientOverviewPulseSelectors";
import { ClientAthleteFeedbackCard } from "./ClientAthleteFeedbackCard";
import { ClientLoadInsightsCard } from "./ClientLoadInsightsCard";
import { ClientOverviewTopSection } from "./ClientOverviewTopSection";
import { RecommendationsCards } from "./RecommendationsCards";
import { OVERVIEW_ZONE_TITLES } from "./clientOverviewPresentation";
import { TYPOGRAPHY } from "@/utils/typography";
import type { TrainingPlan } from "@nexia/shared/types/training";

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
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const alertsSectionRef = useRef<HTMLDivElement>(null);
    const commsSectionRef = useRef<HTMLDivElement>(null);
    const isValidClientId = clientId > 0;

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

    const { data: coherenceData, isLoading: isLoadingCoherence } = useCoherence(
        isValidClientId ? clientId : 0,
        undefined,
        undefined,
        undefined,
        "week",
    );

    const {
        latestWeight,
        weightChange,
        trend,
        progressHistory,
        isLoading: isLoadingProgress,
    } = useClientProgress(isValidClientId ? clientId : 0, client);

    const {
        avgPreFatigue,
        avgPostFatigue,
        isLoading: isLoadingFatigue,
    } = useClientFatigue(isValidClientId ? clientId : 0);

    const { data: sessions = [], isLoading: isLoadingSessions } =
        useGetClientTrainingSessionsQuery(
            { clientId: isValidClientId ? clientId : 0, skip: 0, limit: 1000 },
            { skip: !isValidClientId },
        );

    const { data: testResults = [], isLoading: isLoadingTests } =
        useGetClientTestResultsQuery(
            { clientId: isValidClientId ? clientId : 0 },
            { skip: !isValidClientId },
        );

    const { data: activePlan } = useGetActivePlanByClientQuery(clientId, {
        skip: !isValidClientId,
    });

    const { data: recommendations } = useGetTrainingPlanRecommendationsQuery(
        { clientId: isValidClientId ? clientId : 0 },
        { skip: !isValidClientId },
    );

    const planCompact = useMemo(
        () => buildPlanCompact(activePlan ?? null, trainingPlans),
        [activePlan, trainingPlans],
    );

    const recommendationsMode = useMemo(
        () => buildRecommendationsMode(recommendations),
        [recommendations],
    );

    const upcomingSession = useMemo((): TrainingSession | null => {
        if (!isValidClientId || sessions.length === 0) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filtered = sessions.filter(
            (s) => s.session_date && new Date(s.session_date) >= today,
        );
        if (filtered.length === 0) return null;
        return [...filtered].sort(
            (a, b) =>
                new Date(a.session_date!).getTime() - new Date(b.session_date!).getTime(),
        )[0];
    }, [isValidClientId, sessions]);

    const lastCompletedSession = useMemo((): TrainingSession | null => {
        if (!isValidClientId || sessions.length === 0) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filtered = sessions.filter(
            (s) =>
                s.status === "completed" &&
                s.session_date &&
                new Date(s.session_date) < today,
        );
        if (filtered.length === 0) return null;
        return [...filtered].sort(
            (a, b) =>
                new Date(b.session_date!).getTime() - new Date(a.session_date!).getTime(),
        )[0];
    }, [isValidClientId, sessions]);

    const lastTest = useMemo((): PhysicalTestResultOut | null => {
        if (!isValidClientId || testResults.length === 0) return null;
        return [...testResults].sort(
            (a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime(),
        )[0];
    }, [isValidClientId, testResults]);

    const lastProgressRecord = useMemo((): ClientProgress | null => {
        if (!isValidClientId || !progressHistory?.length) return null;
        return [...progressHistory].sort(
            (a, b) =>
                new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime(),
        )[0];
    }, [isValidClientId, progressHistory]);

    const adherenceColor = useMemo((): MetricCardColor => {
        const adherence = coherenceData?.adherence_percentage ?? 0;
        if (adherence >= 80) return "green";
        if (adherence >= 60) return "orange";
        return "red";
    }, [coherenceData?.adherence_percentage]);

    const isLoading =
        isLoadingCoherence ||
        isLoadingProgress ||
        isLoadingFatigue ||
        isLoadingSessions ||
        isLoadingTests;

    if (!isValidClientId) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-muted-foreground">ID de cliente inválido</p>
            </div>
        );
    }

    const formatDate = (dateStr: string): string =>
        new Date(dateStr).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
        });

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className={`${TYPOGRAPHY.pageTitle} text-foreground`}>
                    {OVERVIEW_ZONE_TITLES.pageTitle}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {OVERVIEW_ZONE_TITLES.pageSubtitle}
                </p>
            </div>

            <ClientOverviewTopSection
                clientId={clientId}
                plan={planCompact}
                isLoadingPlans={isLoadingPlans}
                alertsSectionRef={alertsSectionRef}
                onOpenCreatePlan={onOpenCreatePlan}
                onOpenUseTemplate={onOpenUseTemplate}
                onViewPlan={onViewPlan}
            />

            <div ref={commsSectionRef} data-testid="client-comms-section">
                <ClientAthleteFeedbackCard clientId={clientId} />
            </div>

            <section data-testid="client-overview-kpi-section">
                <h3 className={`${TYPOGRAPHY.dashboardViewHeading} mb-4 text-foreground`}>
                    {OVERVIEW_ZONE_TITLES.kpiSection}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Adherencia"
                        value={`${coherenceData?.adherence_percentage.toFixed(0) ?? 0}%`}
                        subtitle={`${coherenceData?.sessions_completed ?? 0}/${coherenceData?.sessions_total ?? 0} sesiones`}
                        color={adherenceColor}
                    />
                    <MetricCard
                        title="Último Peso"
                        value={latestWeight ? `${latestWeight} kg` : "N/A"}
                        subtitle={
                            weightChange != null
                                ? `${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)} kg ${trend ? `(${trend})` : ""}`
                                : "Sin cambios"
                        }
                        color="blue"
                    />
                    <MetricCard
                        title="Fatiga Promedio"
                        value={
                            avgPreFatigue && avgPostFatigue
                                ? `Pre: ${avgPreFatigue.toFixed(1)} | Post: ${avgPostFatigue.toFixed(1)}`
                                : avgPreFatigue
                                  ? `Pre: ${avgPreFatigue.toFixed(1)}`
                                  : "N/A"
                        }
                        subtitle="Últimos 7 días"
                        color="orange"
                    />
                    <MetricCard
                        title="Próxima Sesión"
                        value={
                            upcomingSession?.session_date
                                ? formatDate(upcomingSession.session_date)
                                : "No programada"
                        }
                        subtitle={
                            upcomingSession?.session_type ||
                            upcomingSession?.session_name ||
                            ""
                        }
                        color="blue"
                    />
                </div>
            </section>

            {recommendationsMode === "incomplete" && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-5">
                    <RecommendationsCards clientId={clientId} />
                </div>
            )}

            {recommendationsMode === "compact_ok" && (
                <p className="text-sm text-muted-foreground">
                    {OVERVIEW_ZONE_TITLES.recommendationsOk}
                </p>
            )}

            <ClientLoadInsightsCard clientId={clientId} />

            {(lastCompletedSession || lastTest || lastProgressRecord) && (
                <section>
                    <h3 className={`${TYPOGRAPHY.dashboardViewHeading} mb-4 text-foreground`}>
                        {OVERVIEW_ZONE_TITLES.activity}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {lastCompletedSession?.session_date && (
                            <ActivityCard
                                title="Última Sesión"
                                date={formatDate(lastCompletedSession.session_date)}
                                detail={
                                    lastCompletedSession.session_type ||
                                    lastCompletedSession.session_name ||
                                    "Sesión"
                                }
                                onClick={() =>
                                    navigate(
                                        `/dashboard/session-programming/sessions/${lastCompletedSession.id}`,
                                    )
                                }
                            />
                        )}
                        {lastTest && (
                            <ActivityCard
                                title="Último Test"
                                date={formatDate(lastTest.test_date)}
                                detail={`${lastTest.value} ${lastTest.unit}`}
                                onClick={() =>
                                    navigate(`/dashboard/clients/${clientId}?tab=testing`)
                                }
                            />
                        )}
                        {lastProgressRecord && (
                            <ActivityCard
                                title="Último Registro"
                                date={formatDate(lastProgressRecord.fecha_registro)}
                                detail={
                                    lastProgressRecord.peso
                                        ? `${lastProgressRecord.peso} kg${lastProgressRecord.imc ? ` | IMC: ${lastProgressRecord.imc.toFixed(1)}` : ""}`
                                        : "Sin datos"
                                }
                                onClick={() =>
                                    navigate(`/dashboard/clients/${clientId}?tab=progress`)
                                }
                            />
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

interface ActivityCardProps {
    title: string;
    date: string;
    detail: string;
    onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, date, detail, onClick }) => (
    <button
        onClick={onClick}
        type="button"
        className="rounded-lg border border-border bg-muted/50 p-4 text-left transition-colors hover:border-border hover:bg-surface-2"
    >
        <p className="mb-1 text-xs font-medium text-muted-foreground">{title}</p>
        <p className="mb-1 text-sm font-semibold text-foreground">{date}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
    </button>
);
