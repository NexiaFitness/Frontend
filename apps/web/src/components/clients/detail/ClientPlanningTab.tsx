/**
 * ClientPlanningTab.tsx — Planificación desde perfil de cliente (vista única del plan)
 *
 * Contenido por plan (activo o ?plan=):
 * - Periodización (PlanPeriodizationSection)
 * - Progresión planificada (PeriodizationCharts, dentro de la sección anterior)
 * - Ejecución del plan (colapsable): ChartsTab si hay sesiones; EmptyState si no
 * - Hitos (MilestonesTab, sección colapsable)
 * - Acciones en barra fija inferior (DashboardFixedFooter): Editar plan, Eliminar plan
 *
 * @see docs/specs/CONSOLIDACION_VISTA_PLAN_EN_CLIENTE.md
 */

import React, { useMemo, useCallback, Suspense, lazy, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart3, Plus } from "lucide-react";
import type { ActivePlanByClientOut, TrainingPlan } from "@nexia/shared/types/training";
import { getMutationErrorMessage } from "@nexia/shared";
import { usePlanBlockAnalytics } from "@nexia/shared/hooks/training/usePlanBlockAnalytics";
import {
    useGetActivePlanByClientQuery,
    useGetTrainingPlanQuery,
    useDeleteTrainingPlanMutation,
} from "@nexia/shared/api/trainingPlansApi";
import { LoadingSpinner, Alert, EmptyState, useToast } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { CollapsibleFormGroup } from "@/components/ui/forms/CollapsibleFormGroup";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { PlanPeriodizationSection } from "@/components/trainingPlans/periodization";
import { MilestonesTab } from "@/components/trainingPlans";
import { DeleteTrainingPlanModal } from "@/components/trainingPlans/DeleteTrainingPlanModal";
import { buildClientTabPath } from "@/lib/trainingPlanNavigation";
import { TYPOGRAPHY } from "@/utils/typography";

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
    onOpenCreatePlan?: () => void;
    onOpenUseTemplate?: () => void;
}

function toActivePlanShape(plan: TrainingPlan): ActivePlanByClientOut {
    return {
        ...plan,
        display_name: plan.name,
        display_goal: plan.goal,
    };
}

export const ClientPlanningTab: React.FC<ClientPlanningTabProps> = ({
    clientId,
    trainingPlans: _trainingPlans = [],
    isLoadingPlans = false,
    focusPlanId = null,
    onOpenCreatePlan,
}) => {
    const navigate = useNavigate();
    const [, setSearchParams] = useSearchParams();
    const { showError } = useToast();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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

    const resolved = useMemo(() => {
        if (!clientId || clientId <= 0) {
            return { kind: "loading" as const };
        }
        if (focusPlanId != null && focusPlanId > 0) {
            if (activePlan != null && activePlan.id === focusPlanId) {
                return { kind: "ok" as const, plan: activePlan, source: "active" as const };
            }
            if (useFocusedFetch) {
                if (isLoadingFocused) {
                    return { kind: "loading" as const };
                }
                if (isFocusedError || !focusedPlan) {
                    const isNotFound =
                        focusedError &&
                        typeof focusedError === "object" &&
                        (("status" in focusedError &&
                            (focusedError.status === 404 || focusedError.status === "PARSING_ERROR")) ||
                            getMutationErrorMessage(focusedError).toLowerCase().includes("not found"));
                    return {
                        kind: "error" as const,
                        message: isNotFound
                            ? "El plan de entrenamiento no existe o ha sido eliminado."
                            : focusedError &&
                                typeof focusedError === "object" &&
                                "data" in focusedError
                              ? getMutationErrorMessage(focusedError)
                              : "No se pudo cargar el plan.",
                    };
                }
                if (focusedPlan.client_id !== clientId) {
                    return { kind: "wrong_client" as const };
                }
                return {
                    kind: "ok" as const,
                    plan: toActivePlanShape(focusedPlan),
                    source: "focused" as const,
                };
            }
        }
        if (activePlan != null && activePlan.id != null) {
            return { kind: "ok" as const, plan: activePlan, source: "active" as const };
        }
        return { kind: "empty" as const };
    }, [
        clientId,
        focusPlanId,
        activePlan,
        useFocusedFetch,
        isLoadingFocused,
        isFocusedError,
        focusedPlan,
        focusedError,
    ]);

    const planIdForAnalytics =
        resolved.kind === "ok" ? resolved.plan.id : null;

    const { sessions, isLoading: executionDataLoading } =
        usePlanBlockAnalytics(planIdForAnalytics);

    const isLoading =
        isLoadingPlans ||
        isLoadingActive ||
        resolved.kind === "loading";

    const handleDeleteConfirm = useCallback(async () => {
        if (resolved.kind !== "ok") return;
        const plan = resolved.plan;
        try {
            await deletePlan({ id: plan.id, clientId }).unwrap();
            setDeleteModalOpen(false);
            navigate(buildClientTabPath(clientId, { tab: "sessions" }));
        } catch (err: unknown) {
            showError(getMutationErrorMessage(err));
        }
    }, [resolved, deletePlan, clientId, navigate, showError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (resolved.kind === "error") {
        return (
            <div className="space-y-4">
                <Alert variant="error">{resolved.message}</Alert>
                <Button variant="outline" size="sm" onClick={clearPlanQuery}>
                    Quitar plan de la URL
                </Button>
            </div>
        );
    }

    if (resolved.kind === "wrong_client") {
        return (
            <div className="space-y-4">
                <Alert variant="error">
                    El plan indicado en la URL no pertenece a este cliente.
                </Alert>
                <Button variant="outline" size="sm" onClick={clearPlanQuery}>
                    Quitar plan de la URL
                </Button>
            </div>
        );
    }

    if (resolved.kind === "empty") {
        return (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                <p className={`${TYPOGRAPHY.sectionTitle} mb-2 text-foreground`}>
                    Sin plan activo
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                    Este cliente no tiene un plan de entrenamiento activo.
                    Crea uno para empezar a planificar.
                </p>
                {onOpenCreatePlan && (
                    <Button
                        variant="primary"
                        onClick={onOpenCreatePlan}
                        aria-label="Crear plan de entrenamiento"
                    >
                        Crear plan
                    </Button>
                )}
            </div>
        );
    }

    const { plan, source } = resolved;
    const showNonActiveBanner =
        source === "focused" && (activePlan == null || activePlan.id !== plan.id);

    const hasExecutionData =
        (plan.sessions_total ?? 0) > 0 || sessions.length > 0;

    return (
        <div className="space-y-8 pb-24" data-testid="client-planning-tab">
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
                activePlan={source === "active" ? plan : undefined}
                planGoalForRecommendations={plan.goal}
            />

            <CollapsibleFormGroup title="Ejecución del plan" defaultOpen={false}>
                <div className="space-y-4" data-testid="plan-execution-section">
                    <p className="text-sm text-muted-foreground">
                        Cumplimiento de la carga planificada: coherencia por bloques, desviación y plan vs real.
                    </p>
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
            </CollapsibleFormGroup>

            <CollapsibleFormGroup title="Hitos del plan" defaultOpen={false}>
                <MilestonesTab planId={plan.id} />
            </CollapsibleFormGroup>

            <DashboardFixedFooter>
                <div className="flex flex-wrap items-center justify-end gap-3">
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

            <DeleteTrainingPlanModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                plan={plan}
                isLoading={isDeletingPlan}
            />
        </div>
    );
};
