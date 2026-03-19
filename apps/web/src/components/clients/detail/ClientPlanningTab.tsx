/**
 * ClientPlanningTab.tsx — Planificación desde perfil de cliente (Fase 1.2–1.3)
 *
 * Obtiene el plan activo del cliente vía GET active-by-client/{client_id}.
 * Si no hay plan activo: estado vacío + CTA "Crear plan" (abre modal, no navega).
 * Si hay plan activo: reutiliza PlanningTab con ese planId (sin selector).
 * Controla estado de planificación en URL: ?tab=planning&month=YYYY-MM&week=N.
 * Reacciona a cambios de URL (back/forward o edición manual).
 *
 * @author Frontend Team
 * @since Fase 1 U3
 * @updated Fase 1 U3 — estado month/week en URL
 */

import React, { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { useGetActivePlanByClientQuery } from "@nexia/shared/api/trainingPlansApi";
import { LoadingSpinner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { PlanningTab } from "@/components/trainingPlans/PlanningTab";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    getDefaultPlanningMonth,
    getDefaultPlanningWeek,
    validatePlanningMonth,
    validatePlanningWeek,
} from "@/utils/planningUrl";

const PLANNING_MONTH_PARAM = "month";
const PLANNING_WEEK_PARAM = "week";

interface ClientPlanningTabProps {
    clientId: number;
    trainingPlans?: TrainingPlan[];
    isLoadingPlans?: boolean;
    /** Si no hay plan activo, el CTA "Crear plan" llama a esto (abre modal). */
    onOpenCreatePlan?: () => void;
}

export const ClientPlanningTab: React.FC<ClientPlanningTabProps> = ({
    clientId,
    trainingPlans: _trainingPlans = [],
    isLoadingPlans = false,
    onOpenCreatePlan,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const { month, week } = useMemo(() => {
        const rawMonth = searchParams.get(PLANNING_MONTH_PARAM);
        const rawWeek = searchParams.get(PLANNING_WEEK_PARAM);
        const month = rawMonth && validatePlanningMonth(rawMonth)
            ? rawMonth
            : getDefaultPlanningMonth();
        const parsedWeek = rawWeek != null ? parseInt(rawWeek, 10) : NaN;
        const week = validatePlanningWeek(parsedWeek) ? parsedWeek : getDefaultPlanningWeek();
        return { month, week };
    }, [searchParams]);

    const setPlanningParams = useCallback(
        (updates: { month?: string; week?: number }) => {
            const next = new URLSearchParams(searchParams);
            if (updates.month != null) next.set(PLANNING_MONTH_PARAM, updates.month);
            if (updates.week != null) next.set(PLANNING_WEEK_PARAM, String(updates.week));
            setSearchParams(next, { replace: true });
        },
        [searchParams, setSearchParams]
    );

    const handleMonthChange = useCallback(
        (newMonth: string) => setPlanningParams({ month: newMonth }),
        [setPlanningParams]
    );

    const handleWeekChange = useCallback(
        (newWeek: number) => setPlanningParams({ week: newWeek }),
        [setPlanningParams]
    );

    const {
        data: activePlan,
        isLoading: isLoadingActive,
        isError,
    } = useGetActivePlanByClientQuery(clientId, { skip: !clientId || clientId <= 0 });

    const isLoading = isLoadingPlans || isLoadingActive;
    const hasActivePlan = activePlan != null && activePlan.id != null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!hasActivePlan) {
        return (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                <p className={`${TYPOGRAPHY.sectionTitle} mb-2 text-foreground`}>
                    Sin plan activo
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                    {isError
                        ? "No se pudo cargar el plan activo. Puedes crear un plan para este cliente."
                        : "Este cliente no tiene un plan de entrenamiento activo. Crea uno para ver baselines, overrides y calendario aquí."}
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

    return (
        <PlanningTab
            planId={activePlan.id}
            clientId={clientId}
            month={month}
            week={week}
            onMonthChange={handleMonthChange}
            onWeekChange={handleWeekChange}
        />
    );
};
