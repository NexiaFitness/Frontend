/**
 * ClientOverviewTab.tsx — Tab Resumen (UX-OVERVIEW v2, F0).
 *
 * F0: loop atleta↔entrenador (feedback + load) + acción inmediata (alertas|plan).
 * F2+ sustituirá MetricCard por KPICard y LoadBridge.
 */

import React, { useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";
import type { Client } from "@nexia/shared/types/client";
import type { TrainingSession } from "@nexia/shared/types/training";
import type { PhysicalTestResultOut } from "@nexia/shared/types/testing";
import type { ClientProgress } from "@nexia/shared/types/progress";
import { KPICard } from "@/components/dashboard/trainer/widgets";
import { Smile, ClipboardCheck, CalendarDays, Scale, Zap } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useCoherence } from "@nexia/shared/hooks/clients/useCoherence";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import {
    useGetClientTrainingSessionsQuery,
    useGetClientTestResultsQuery,
    useGetClientRatingsQuery,
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
    const location = useLocation();
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

    const { data: clientRatings = [], isLoading: isLoadingRatings } = useGetClientRatingsQuery(
        { clientId: isValidClientId ? clientId : 0 },
        { skip: !isValidClientId },
    );

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

    const satisfactionDisplay = useMemo(() => {
        if (!clientRatings.length) return "--";
        const avg = clientRatings.reduce((sum, r) => sum + r.rating, 0) / clientRatings.length;
        return `${avg.toFixed(1)}/5`;
    }, [clientRatings]);

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
        <section className="space-y-6">
            <h2 className="sr-only">{OVERVIEW_ZONE_TITLES.pageTitle}</h2>

            <section
                data-testid="client-overview-kpi-section"
                aria-label={OVERVIEW_ZONE_TITLES.kpiSection}
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <KPICard
                        value={satisfactionDisplay}
                        trend=""
                        label="Satisfacción"
                        description={`${clientRatings.length} valoración${clientRatings.length !== 1 ? "es" : ""}`}
                        icon={Smile}
                        color="success"
                        isLoading={isLoadingRatings}
                    />
                    <KPICard
                        value={`${coherenceData?.adherence_percentage?.toFixed(0) ?? 0}%`}
                        trend=""
                        label="Adherencia al plan"
                        description={`${coherenceData?.sessions_completed ?? 0}/${coherenceData?.sessions_total ?? 0} sesiones`}
                        icon={ClipboardCheck}
                        color="success"
                        isLoading={isLoadingCoherence}
                    />
                    <KPICard
                        value={
                            upcomingSession?.session_date
                                ? formatDate(upcomingSession.session_date)
                                : "—"
                        }
                        trend=""
                        label="Próxima sesión"
                        description={
                            upcomingSession
                                ? (upcomingSession.session_type || upcomingSession.session_name || "Sesión programada")
                                : "sin programar"
                        }
                        icon={CalendarDays}
                        color="primary"
                        isLoading={isLoadingSessions}
                    />
                    <KPICard
                        value={latestWeight ? `${latestWeight} kg` : "—"}
                        trend={
                            weightChange != null
                                ? `${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)} kg`
                                : ""
                        }
                        label="Último peso"
                        description={trend ? `tendencia ${trend}` : "sin registros recientes"}
                        icon={Scale}
                        color="info"
                        isLoading={isLoadingProgress}
                    />
                    <KPICard
                        value={
                            avgPostFatigue != null
                                ? `${avgPostFatigue.toFixed(1)}/10`
                                : avgPreFatigue != null
                                  ? `${avgPreFatigue.toFixed(1)}/10`
                                  : "—"
                        }
                        trend=""
                        label="Fatiga media"
                        description="post-sesión · últimos 7 días"
                        icon={Zap}
                        color="warning"
                        isLoading={isLoadingFatigue}
                    />
                </div>
            </section>

            <ClientOverviewTopSection
                clientId={clientId}
                plan={planCompact}
                isLoadingPlans={isLoadingPlans}
                alertsSectionRef={alertsSectionRef}
                planAlignedWithObjective={recommendationsMode === "compact_ok"}
                onOpenCreatePlan={onOpenCreatePlan}
                onOpenUseTemplate={onOpenUseTemplate}
                onViewPlan={onViewPlan}
            />

            <div ref={commsSectionRef} data-testid="client-comms-section">
                <ClientAthleteFeedbackCard clientId={clientId} />
            </div>

            {recommendationsMode === "incomplete" && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-5">
                    <RecommendationsCards clientId={clientId} />
                </div>
            )}

            {recommendationsMode === "compact_ok" && (
                <section>
                    <h3 className={`${TYPOGRAPHY.dashboardViewHeading} mb-1 text-foreground`}>
                        {OVERVIEW_ZONE_TITLES.trainingProfile}
                    </h3>
                    <p className="mb-4 text-xs text-muted-foreground">
                        {OVERVIEW_ZONE_TITLES.trainingProfileHint}
                    </p>
                    <RecommendationsCards clientId={clientId} />
                </section>
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
                                        { state: returnToStateFromView(location) },
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
        </section>
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
