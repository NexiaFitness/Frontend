/**
 * ClientPlanningTab.tsx — Planificación desde perfil de cliente
 *
 * Por defecto: plan activo vía GET active-by-client/{client_id}.
 * Si la URL trae `?plan=:id` (focusPlanId): muestra ese plan si pertenece al cliente
 * (alineado con handleViewPlan en ClientDetail); si coincide con el activo, no duplica fetch.
 *
 * Sin plan activo y sin plan enfocado válido: estado vacío + CTA "Crear plan".
 *
 * @author Frontend Team
 * @since Fase 1 U3
 * @updated v9.0.0 — Eliminado PlanningTab legacy; solo PlanPeriodizationSection
 * @updated 2026-04 — Soporte ?plan= para ver periodización de un plan concreto
 */

import React, { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { ActivePlanByClientOut, TrainingPlan } from "@nexia/shared/types/training";
import {
    useGetActivePlanByClientQuery,
    useGetTrainingPlanQuery,
} from "@nexia/shared/api/trainingPlansApi";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { PlanPeriodizationSection } from "@/components/trainingPlans/periodization";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientPlanningTabProps {
    clientId: number;
    trainingPlans?: TrainingPlan[];
    isLoadingPlans?: boolean;
    /**
     * ID de plan desde `?plan=` (ClientDetail). null = solo plan activo.
     */
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
    const [, setSearchParams] = useSearchParams();

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
                    return {
                        kind: "error" as const,
                        message:
                            focusedError && typeof focusedError === "object" && "data" in focusedError
                                ? String((focusedError as { data?: unknown }).data ?? "No se pudo cargar el plan.")
                                : "No se pudo cargar el plan.",
                    };
                }
                if (focusedPlan.client_id !== clientId) {
                    return {
                        kind: "wrong_client" as const,
                    };
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

    const isLoading =
        isLoadingPlans ||
        isLoadingActive ||
        resolved.kind === "loading";

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

    return (
        <div className="space-y-4">
            {showNonActiveBanner && (
                <Alert variant="warning" className="text-sm">
                    Estás viendo la periodización de un plan concreto (enlace o pestaña).{" "}
                    {activePlan ? "Puede no ser el plan activo del cliente." : "No hay plan activo asignado."}{" "}
                    <button
                        type="button"
                        className="underline font-medium text-foreground hover:no-underline"
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
        </div>
    );
};
