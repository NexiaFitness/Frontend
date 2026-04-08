/**
 * CreateTrainingPlan.tsx — Alta de plan de entrenamiento (editor unificado).
 *
 * Contexto: monta `TrainingPlanEditorForm` + `useTrainingPlanEditor` en modo create.
 * Query opcional `?clientId=` para contexto cliente e instancias.
 *
 * @author Frontend Team
 * @since v7.0.0 - Rediseño compacto (Imagen 2)
 * @updated v8.0.0 - Editor unificado con edición (shared validation + mismo formulario)
 */

import React, { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { TrainingPlanInstance } from "@nexia/shared/types/training";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { RecommendationsCards } from "@/components/clients/detail/RecommendationsCards";
import { PlanOverlapModal } from "@/components/trainingPlans/modals";
import { TrainingPlanEditorForm } from "@/components/trainingPlans/editor/TrainingPlanEditorForm";
import { useTrainingPlanEditor } from "@/hooks/trainingPlans/useTrainingPlanEditor";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import { TRAINING_PLAN_GOAL } from "@nexia/shared/types/training";

const GOAL_OPTIONS = [
    { value: TRAINING_PLAN_GOAL.HYPERTROPHY, label: "Hipertrofia" },
    { value: TRAINING_PLAN_GOAL.STRENGTH, label: "Fuerza" },
    { value: TRAINING_PLAN_GOAL.POWER, label: "Potencia" },
    { value: TRAINING_PLAN_GOAL.ENDURANCE, label: "Resistencia" },
    { value: TRAINING_PLAN_GOAL.WEIGHT_LOSS, label: "Pérdida de peso" },
    { value: TRAINING_PLAN_GOAL.REHABILITATION, label: "Rehabilitación" },
    { value: TRAINING_PLAN_GOAL.GENERAL_FITNESS, label: "Fitness general" },
    { value: TRAINING_PLAN_GOAL.SPORT_PERFORMANCE, label: "Rendimiento deportivo" },
];

export const CreateTrainingPlan: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const clientIdFromQuery = searchParams.get("clientId");
    const clientId = clientIdFromQuery ? Number(clientIdFromQuery) : null;
    const fallbackPath = "/dashboard/training-plans";
    const { goBack } = useReturnToOrigin({ fallbackPath });

    const { data: trainerProfile, isLoading: isLoadingTrainer } = useGetCurrentTrainerProfileQuery();
    const trainerId = trainerProfile?.id ?? 0;

    const editor = useTrainingPlanEditor(
        { kind: "create", clientId, trainerId },
        { cancelPath: fallbackPath }
    );

    const handleOpenActivePlan = useCallback(
        (instance: TrainingPlanInstance) => {
            const planId = instance.source_plan_id;
            if (planId == null || planId <= 0 || clientId == null || clientId <= 0) {
                return;
            }
            const params = new URLSearchParams({
                returnToClient: String(clientId),
                tab: "planning",
            });
            navigate(`/dashboard/training-plans/${planId}?${params.toString()}`);
        },
        [navigate, clientId]
    );

    useEffect(() => {
        if (isLoadingTrainer) return;
        if (!trainerId) {
            navigate("/dashboard");
        }
    }, [isLoadingTrainer, trainerId, navigate]);

    if (isLoadingTrainer || !trainerId) {
        return (
            <div className="flex h-64 items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <TrainingPlanEditorForm
                formId="create-training-plan-form"
                mode="create"
                pageTitle="Planificación"
                cardTitle="Nueva planificación"
                client={editor.clientForBlock}
                showClientBlock={editor.showClientBlock}
                draft={editor.draft}
                onDraftChange={editor.setDraft}
                errors={editor.formErrors}
                goalOptions={GOAL_OPTIONS}
                existingInstances={editor.existingInstances}
                isLoadingInstances={editor.isLoadingInstances}
                isSubmitDisabled={editor.isSubmitDisabled}
                isSubmitting={editor.isSubmitting}
                submitLabel="Crear planificación"
                onSubmit={editor.handleSubmit}
                onCancel={() => goBack()}
                onOpenActivePlan={clientId ? handleOpenActivePlan : undefined}
            />

            {editor.recommendationsClientId != null && (
                <div className="pb-8">
                    <RecommendationsCards
                        clientId={editor.recommendationsClientId}
                        planGoal={editor.draft.goal || undefined}
                    />
                </div>
            )}

            <PlanOverlapModal
                isOpen={editor.isOverlapModalOpen}
                onClose={editor.handleCancelOverlap}
                onConfirm={editor.handleConfirmOverlap}
                planName={editor.overlappingPlan?.name || ""}
                planStartDate={editor.overlappingPlan?.start_date || ""}
                planEndDate={editor.overlappingPlan?.end_date || ""}
                isLoading={editor.isSubmitting}
            />
        </>
    );
};
