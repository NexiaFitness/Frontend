/**
 * ClientPlanningTab.tsx — Planificación desde perfil de cliente (vista única del plan)
 *
 * Contenido por plan (activo o ?plan=):
 * - Periodización (PlanPeriodizationSection)
 * - Análisis de periodización (PeriodizationCharts, sección colapsable)
 * - Ejecución del plan (colapsable): ChartsTab si hay sesiones; EmptyState si no
 * - Hitos (MilestonesTab, sección colapsable)
 * - Acciones en barra fija inferior (DashboardFixedFooter): Editar plan, Eliminar plan
 *
 * @see docs/specs/CONSOLIDACION_VISTA_PLAN_EN_CLIENTE.md
 */

import React, { useMemo, useCallback, Suspense, lazy, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart3, Plus } from "lucide-react";
import type { TrainingPlan } from "@nexia/shared/types/training";
import {
    classifyFocusedPlanFetchError,
    getMutationErrorMessage,
    resolveClientPlanningView,
} from "@nexia/shared";
import { usePlanBlockAnalytics } from "@nexia/shared/hooks/training/usePlanBlockAnalytics";
import {
    useGetActivePlanByClientQuery,
    useGetTrainingPlanQuery,
    useDeleteTrainingPlanMutation,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetPeriodBlocksQuery } from "@nexia/shared/api/periodBlocksApi";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import { LoadingSpinner, Alert, EmptyState, useToast } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { PLATFORM_PAGE_WITH_FIXED_FOOTER } from "@/components/ui/surface/platformPremiumPresentation";
import { cn } from "@/lib/utils";
import {
    PlanPeriodizationSection,
    PeriodizationCharts,
} from "@/components/trainingPlans/periodization";
import { PlanningExploreSectionCard } from "@/components/trainingPlans/periodization/PlanningExploreSectionCard";
import { PLANNING_EXPLORE_SECTIONS_STACK } from "@/components/trainingPlans/periodization/planningShellPresentation";
import { MilestonesTab } from "@/components/trainingPlans";
import {
    applyPlanningViewPlansHistory,
    clearPlanningView,
    isPlanningAnalyticsView,
    isPlanningPlansHistoryView,
} from "@/utils/planningHubUrl";
import { DeleteTrainingPlanModal } from "@/components/trainingPlans/DeleteTrainingPlanModal";
import { ConvertPlanToTemplateModal } from "@/components/trainingPlans/ConvertPlanToTemplateModal";
import { buildClientTabPath } from "@/lib/trainingPlanNavigation";
import { scrollDashboardMainToAnchorAfterPaint } from "@/lib/dashboardScroll";
import { isBlockAuthoringActive, parseBlockAuthorParams } from "@/utils/blockAuthoringUrl";
import {
    hasMultipleClientTrainingPlans,
    toActivePlanDisplay,
} from "@/components/trainingPlans/periodization/planningShellUtils";
import { ClientPlansSection } from "./ClientPlansSection";
import { ClientPlanningHubShell } from "./ClientPlanningHubShell";

const ChartsTab = lazy(() =>
    import("@/components/trainingPlans").then((module) => ({
        default: module.ChartsTab,
    })),
);

interface ClientPlanningTabProps {
    clientId: number;
    trainingPlans?: TrainingPlan[];
    isLoadingPlans?: boolean;
    focusPlanId?: number | null;
    onPlanificar?: () => void;
}

export const ClientPlanningTab: React.FC<ClientPlanningTabProps> = ({
    clientId,
    trainingPlans = [],
    isLoadingPlans = false,
    focusPlanId = null,
    onPlanificar,
}) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const blockAuthorActive = isBlockAuthoringActive(
        parseBlockAuthorParams(searchParams),
    );
    const { showError } = useToast();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [convertModalOpen, setConvertModalOpen] = useState(false);
    const [isPhaseAuthoring, setIsPhaseAuthoring] = useState(false);
    const [deletePlan, { isLoading: isDeletingPlan }] = useDeleteTrainingPlanMutation();

    const clearPlanQuery = useCallback(() => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete("plan");
                return next;
            },
            { replace: true },
        );
    }, [setSearchParams]);

    const {
        data: activePlan,
        isLoading: isLoadingActive,
    } = useGetActivePlanByClientQuery(clientId, { skip: !clientId || clientId <= 0 });

    const useFocusedFetch =
        focusPlanId != null &&
        focusPlanId > 0 &&
        !(activePlan != null && activePlan.id === focusPlanId);

    const {
        data: focusedPlan,
        isLoading: isLoadingFocused,
        isError: isFocusedError,
        error: focusedError,
    } = useGetTrainingPlanQuery(focusPlanId!, { skip: !clientId || clientId <= 0 || !useFocusedFetch });

    const focusedFetchErrorKind = useMemo(
        () => classifyFocusedPlanFetchError(isFocusedError, focusedError, focusedPlan),
        [isFocusedError, focusedError, focusedPlan],
    );

    const focusedFetchErrorMessage = useMemo(() => {
        if (focusedFetchErrorKind !== "recoverable" || !focusedError) {
            return undefined;
        }
        return getMutationErrorMessage(focusedError);
    }, [focusedFetchErrorKind, focusedError]);

    const viewResolution = useMemo(
        () =>
            resolveClientPlanningView({
                clientId,
                focusPlanId,
                activePlanId: activePlan?.id,
                focusedFetchEnabled: useFocusedFetch,
                focusedFetchLoading: isLoadingFocused,
                focusedPlan: focusedPlan ?? null,
                focusedFetchErrorKind,
                focusedFetchErrorMessage,
            }),
        [
            clientId,
            focusPlanId,
            activePlan?.id,
            useFocusedFetch,
            isLoadingFocused,
            focusedPlan,
            focusedFetchErrorKind,
            focusedFetchErrorMessage,
        ],
    );

    useEffect(() => {
        if (!viewResolution.sanitizePlanParam) {
            return;
        }
        clearPlanQuery();
    }, [viewResolution.sanitizePlanParam, clearPlanQuery]);

    const detailPlan = useMemo(() => {
        if (viewResolution.kind !== "plan_detail") {
            return null;
        }
        if (viewResolution.planSource === "active" && activePlan != null) {
            return { plan: activePlan, source: "active" as const };
        }
        if (viewResolution.planSource === "focused" && focusedPlan) {
            return {
                plan: toActivePlanDisplay(focusedPlan),
                source: "focused" as const,
            };
        }
        if (activePlan != null) {
            return { plan: activePlan, source: "active" as const };
        }
        return null;
    }, [viewResolution, activePlan, focusedPlan]);

    const planIdForAnalytics = detailPlan?.plan.id ?? null;

    const { sessions, isLoading: executionDataLoading } =
        usePlanBlockAnalytics(planIdForAnalytics);

    const { data: periodBlocks = [] } = useGetPeriodBlocksQuery(planIdForAnalytics ?? 0, {
        skip: planIdForAnalytics == null,
    });
    const { data: physicalQualities = [] } = useGetPhysicalQualitiesQuery();

    const [analyticsOpen, setAnalyticsOpen] = useState(false);
    const [plansHistoryOpen, setPlansHistoryOpen] = useState(false);

    const showClientPlansHistory = hasMultipleClientTrainingPlans(trainingPlans);
    const showExploreSections = !blockAuthorActive && !isPhaseAuthoring;

    const handleOpenPlansHistory = useCallback(() => {
        setSearchParams((prev) => applyPlanningViewPlansHistory(prev), {
            replace: true,
        });
    }, [setSearchParams]);

    const handleViewPlanFromHistory = useCallback(
        (planId: number) => {
            navigate(buildClientTabPath(clientId, { tab: "planning", planId }));
            requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        },
        [clientId, navigate],
    );

    useEffect(() => {
        if (!isPlanningAnalyticsView(searchParams)) {
            return;
        }
        setAnalyticsOpen(true);
        setSearchParams((prev) => clearPlanningView(prev), { replace: true });
        return scrollDashboardMainToAnchorAfterPaint(() =>
            document.getElementById("planning-analytics-section"),
        );
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (!isPlanningPlansHistoryView(searchParams)) {
            return;
        }
        setPlansHistoryOpen(true);
        setSearchParams((prev) => clearPlanningView(prev), { replace: true });
        return scrollDashboardMainToAnchorAfterPaint(() =>
            document.getElementById("client-plans-history"),
        );
    }, [searchParams, setSearchParams]);

    const isLoading =
        isLoadingPlans ||
        isLoadingActive ||
        viewResolution.kind === "loading" ||
        (viewResolution.kind === "plan_detail" && detailPlan == null);

    const handleDeleteConfirm = useCallback(async () => {
        if (!detailPlan) return;
        const { plan } = detailPlan;
        try {
            await deletePlan({ id: plan.id, clientId }).unwrap();
            setDeleteModalOpen(false);
            navigate(buildClientTabPath(clientId, { tab: "planning" }));
        } catch (err: unknown) {
            showError(getMutationErrorMessage(err));
        }
    }, [detailPlan, deletePlan, clientId, navigate, showError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (viewResolution.kind === "recoverable_error") {
        return (
            <div className="space-y-4" data-testid="client-planning-recoverable-error">
                <Alert variant="error">
                    {viewResolution.errorMessage ??
                        "No se pudo cargar el plan. Inténtalo de nuevo."}
                </Alert>
            </div>
        );
    }

    if (viewResolution.kind === "hub") {
        return (
            <ClientPlanningHubShell
                clientId={clientId}
                trainingPlans={trainingPlans}
                isLoadingPlans={isLoadingPlans}
                onPlanificar={onPlanificar}
                onViewPlan={handleViewPlanFromHistory}
            />
        );
    }

    if (!detailPlan) {
        return (
            <ClientPlanningHubShell
                clientId={clientId}
                trainingPlans={trainingPlans}
                isLoadingPlans={isLoadingPlans}
                onPlanificar={onPlanificar}
                onViewPlan={handleViewPlanFromHistory}
            />
        );
    }

    const { plan, source } = detailPlan;
    const isOperationalPlan =
        activePlan?.id === plan.id || plan.lifecycle_status === "operational";
    const showNonActiveBanner =
        source === "focused" && (activePlan == null || activePlan.id !== plan.id);

    const hasExecutionData =
        (plan.sessions_total ?? 0) > 0 || sessions.length > 0;

    return (
        <div
            className={cn(
                "min-w-0 space-y-6 overflow-x-hidden",
                !(isPhaseAuthoring || blockAuthorActive) && PLATFORM_PAGE_WITH_FIXED_FOOTER,
            )}
            data-testid="client-planning-tab"
        >
            {showNonActiveBanner && (
                <Alert variant="warning" className="text-sm">
                    Estás viendo la periodización de un plan concreto (enlace o pestaña).{" "}
                    {activePlan ? "Puede no ser el plan activo del cliente." : "No hay plan activo asignado."}{" "}
                    <button
                        type="button"
                        className="font-medium text-foreground underline hover:no-underline"
                        onClick={clearPlanQuery}
                    >
                        Volver al plan activo
                    </button>
                </Alert>
            )}

            <PlanPeriodizationSection
                planId={plan.id}
                clientId={clientId}
                planStartDate={plan.start_date}
                planEndDate={plan.end_date}
                activePlan={toActivePlanDisplay(plan)}
                planGoalForRecommendations={plan.goal}
                onAuthoringChange={setIsPhaseAuthoring}
                showOtherPlansAction={showClientPlansHistory}
                onOpenOtherPlans={handleOpenPlansHistory}
            />

            {showExploreSections ? (
                <div className={PLANNING_EXPLORE_SECTIONS_STACK}>
                    {periodBlocks.length > 0 ? (
                        <PlanningExploreSectionCard
                            id="planning-analytics-section"
                            title="Análisis de periodización"
                            description="Progresión planificada por fases, volumen e intensidad."
                            testId="planning-view-analytics"
                            open={analyticsOpen}
                            onOpenChange={setAnalyticsOpen}
                        >
                            <PeriodizationCharts
                                blocks={periodBlocks}
                                catalog={physicalQualities}
                            />
                        </PlanningExploreSectionCard>
                    ) : null}

                    <PlanningExploreSectionCard
                        title="Ejecución del plan"
                        description="Cumplimiento de la carga planificada: coherencia, desviación y plan vs real."
                        defaultOpen={false}
                    >
                        <div className="space-y-4" data-testid="plan-execution-section">
                            {executionDataLoading ? (
                                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/10 py-16">
                                    <LoadingSpinner size="lg" />
                                </div>
                            ) : hasExecutionData ? (
                                <Suspense fallback={<LoadingSpinner size="lg" />}>
                                    <ChartsTab
                                        planId={plan.id}
                                        planStartDate={plan.start_date}
                                        planEndDate={plan.end_date}
                                    />
                                </Suspense>
                            ) : (
                                <div
                                    className="rounded-lg border border-dashed border-border/50 bg-muted/10"
                                    data-testid="plan-execution-empty"
                                >
                                    <EmptyState
                                        icon={<BarChart3 />}
                                        title="Sin datos de ejecución"
                                        description="Programa y completa sesiones en los bloques del plan para ver coherencia, desviación y plan vs real."
                                        action={
                                            <div className="flex flex-wrap items-center justify-center gap-2">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() =>
                                                        navigate(
                                                            buildClientTabPath(clientId, {
                                                                tab: "sessions",
                                                            }),
                                                        )
                                                    }
                                                >
                                                    Ir a sesiones
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const qs = new URLSearchParams({
                                                            clientId: String(clientId),
                                                            planId: String(plan.id),
                                                        });
                                                        navigate(
                                                            `/dashboard/session-programming/create-session?${qs.toString()}`,
                                                        );
                                                    }}
                                                >
                                                    <Plus className="size-4" aria-hidden />
                                                    Crear sesión
                                                </Button>
                                            </div>
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </PlanningExploreSectionCard>

                    <PlanningExploreSectionCard
                        title="Hitos del plan"
                        description="Objetivos intermedios y seguimiento de logros del programa."
                        defaultOpen={false}
                    >
                        <MilestonesTab planId={plan.id} />
                    </PlanningExploreSectionCard>

                    {showClientPlansHistory ? (
                        <PlanningExploreSectionCard
                            id="client-plans-history"
                            title="Historial"
                            description="Planes asignados a este cliente."
                            testId="planning-plans-history-section"
                            open={plansHistoryOpen}
                            onOpenChange={setPlansHistoryOpen}
                        >
                            <ClientPlansSection
                                clientId={clientId}
                                trainingPlans={trainingPlans}
                                isLoading={isLoadingPlans}
                                embedded
                                onViewPlan={handleViewPlanFromHistory}
                            />
                        </PlanningExploreSectionCard>
                    ) : null}
                </div>
            ) : null}

            {!isPhaseAuthoring && !blockAuthorActive && (
                <DashboardFixedFooter>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        {!plan.was_converted_to_template ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setConvertModalOpen(true)}
                            >
                                Convertir en plantilla
                            </Button>
                        ) : null}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/training-plans/${plan.id}/edit`)}
                        >
                            Editar plan
                        </Button>
                        <Button
                            type="button"
                            variant="outline-destructive"
                            size="sm"
                            onClick={() => setDeleteModalOpen(true)}
                        >
                            Eliminar plan
                        </Button>
                    </div>
                </DashboardFixedFooter>
            )}

            <DeleteTrainingPlanModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                plan={plan}
                isLoading={isDeletingPlan}
                isOperationalPlan={isOperationalPlan}
            />

            <ConvertPlanToTemplateModal
                open={convertModalOpen}
                onClose={() => setConvertModalOpen(false)}
                plan={plan}
            />
        </div>
    );
};
