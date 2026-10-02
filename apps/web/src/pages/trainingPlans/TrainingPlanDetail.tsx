/**
 * TrainingPlanDetail.tsx — Redirect al perfil de cliente
 *
 * El detalle operativo (periodización, ejecución, hitos) vive en
 * ClientDetail → tab Planificación. Esta ruta conserva bookmarks y enlaces legacy.
 *
 * - Plan con client_id → redirect a /clients/:id?tab=planning&plan=:id
 * - tab=sessions legacy → /clients/:id?tab=sessions
 * - Plan sin cliente → vista mínima para asignar
 *
 * @see docs/specs/CONSOLIDACION_VISTA_PLAN_EN_CLIENTE.md
 */

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import type { TrainingPlanInstance } from "@nexia/shared/types/training";
import { buildClientTabPath } from "@/lib/trainingPlanNavigation";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { resolveTrainingPlanDetailRedirect } from "@/lib/trainingPlanNavigation";
import { AssignPlanModal } from "@/components/trainingPlans";
import { TrainingPlanHeader } from "@/components/trainingPlans/TrainingPlanHeader";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export const TrainingPlanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const planId = parseInt(id || "0", 10);
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    const { data: plan, isLoading, isError, error, refetch } = useGetTrainingPlanQuery(planId, {
        skip: !id || isNaN(planId),
    });

    const redirectTarget = plan?.client_id
        ? resolveTrainingPlanDetailRedirect(plan.client_id, planId, searchParams)
        : null;

    useEffect(() => {
        if (!redirectTarget) return;
        navigate(redirectTarget, { replace: true });
    }, [redirectTarget, navigate]);

    const handleAssignSuccess = useCallback(
        (instance: TrainingPlanInstance) => {
            setAssignModalOpen(false);
            const clientId = instance.client_id;
            const assignedPlanId = instance.source_plan_id;
            if (clientId && assignedPlanId) {
                navigate(
                    buildClientTabPath(clientId, {
                        tab: "planning",
                        planId: assignedPlanId,
                    }),
                    { replace: true }
                );
                return;
            }
            refetch();
        },
        [navigate, refetch]
    );

    if (!id || isNaN(planId)) {
        return (
            <div className="p-6">
                <Alert variant="error">ID de plan de entrenamiento inválido</Alert>
            </div>
        );
    }

    if (isLoading || redirectTarget) {
        return (
            <div
                className="flex items-center justify-center min-h-[40vh]"
                data-testid="training-plan-detail-redirect"
            >
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError || !plan) {
        const isNotFound = error && "status" in error && error.status === 404;
        return (
            <div className="p-6" data-testid="training-plan-detail">
                <Alert
                    variant="error"
                    title={
                        isNotFound
                            ? "El plan de entrenamiento solicitado no existe o ha sido eliminado."
                            : "Error al cargar el plan de entrenamiento"
                    }
                    description={
                        isNotFound ? undefined : "Por favor, intenta de nuevo."
                    }
                    action={
                        isNotFound ? (
                            <Button
                                variant="ghost-primary"
                                size="sm"
                                onClick={() => navigate("/dashboard/training-plans")}
                            >
                                <ArrowLeft className="mr-1 size-4" aria-hidden />
                                Volver a Planes
                            </Button>
                        ) : (
                            <Button variant="ghost-primary" size="sm" onClick={() => refetch()}>
                                <RotateCcw className="mr-1 size-4" aria-hidden />
                                Reintentar
                            </Button>
                        )
                    }
                />
            </div>
        );
    }

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Planificación", path: "/dashboard/training-plans" },
        { label: plan.name, active: true },
    ];

    return (
        <div className="space-y-8 pb-12" data-testid="training-plan-detail">
            <TrainingPlanHeader
                plan={plan}
                breadcrumbItems={breadcrumbItems}
                onAssignPlan={() => setAssignModalOpen(true)}
            />
            <Alert
                variant="warning"
                title="Este plan no tiene cliente asignado"
                description="Asigna un cliente para editar periodización, sesiones y analítica desde su ficha."
            />
            <AssignPlanModal
                open={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                planId={planId}
                planName={plan.name}
                onSuccess={handleAssignSuccess}
            />
        </div>
    );
};
