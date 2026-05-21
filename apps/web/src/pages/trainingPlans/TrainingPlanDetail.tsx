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
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
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

    const handleAssignSuccess = useCallback(() => {
        setAssignModalOpen(false);
        refetch();
    }, [refetch]);

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
                    action={
                        <>
                            {!isNotFound && (
                                <Button variant="outline-destructive" size="sm" onClick={() => refetch()}>
                                    Reintentar
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/training-plans")}>
                                Volver a Planes
                            </Button>
                        </>
                    }
                >
                    {isNotFound
                        ? "El plan de entrenamiento solicitado no existe o ha sido eliminado."
                        : "Error al cargar el plan de entrenamiento. Por favor, intenta de nuevo."}
                </Alert>
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
            <Alert variant="warning">
                Este plan no tiene cliente asignado. Asigna un cliente para editar periodización, sesiones y analítica desde su ficha.
            </Alert>
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
