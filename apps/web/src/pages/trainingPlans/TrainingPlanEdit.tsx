/**
 * TrainingPlanEdit.tsx — Edición de plan (editor unificado con creación).
 *
 * Contexto: `TrainingPlanEditorForm` + `useTrainingPlanEditor` en modo edit;
 * solape de fechas con otros planes del mismo cliente y confirmación en modal.
 *
 * @author Frontend Team
 * @since v5.0.0
 * @updated v8.0.0 - Editor unificado
 */

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/buttons";
import { PlanOverlapModal } from "@/components/trainingPlans/modals";
import { TrainingPlanEditorForm } from "@/components/trainingPlans/editor/TrainingPlanEditorForm";
import { useTrainingPlanEditor } from "@/hooks/trainingPlans/useTrainingPlanEditor";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
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

export const TrainingPlanEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const planId = parseInt(id || "0", 10);

    const { data: trainerProfile, isLoading: isLoadingTrainer } = useGetCurrentTrainerProfileQuery();
    const trainerId = trainerProfile?.id ?? 0;

    const detailPath = `/dashboard/training-plans/${planId}`;
    const listPath = "/dashboard/training-plans";

    const editor = useTrainingPlanEditor(
        { kind: "edit", planId, trainerId },
        { cancelPath: detailPath, editSuccessPath: detailPath }
    );

    useEffect(() => {
        if (isLoadingTrainer) return;
        if (!trainerId) {
            navigate("/dashboard");
        }
    }, [isLoadingTrainer, trainerId, navigate]);

    if (!id || Number.isNaN(planId) || planId <= 0) {
        return (
            <div className="p-6">
                <Alert variant="error">ID de plan inválido</Alert>
            </div>
        );
    }

    if (isLoadingTrainer || !trainerId) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (editor.isPlanLoadError) {
        return (
            <div className="p-6">
                <Alert variant="error">
                    Error al cargar el plan. Por favor, intenta nuevamente.
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => navigate(listPath)}>
                        Volver a la lista
                    </Button>
                </div>
            </div>
        );
    }

    if (editor.isPageLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <TrainingPlanEditorForm
                formId="edit-training-plan-form"
                mode="edit"
                pageTitle="Planificación"
                cardTitle="Editar planificación"
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
                submitLabel="Guardar cambios"
                onSubmit={editor.handleSubmit}
                onCancel={() => navigate(detailPath)}
            />

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
