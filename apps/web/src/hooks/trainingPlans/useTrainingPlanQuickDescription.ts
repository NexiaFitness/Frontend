/**
 * useTrainingPlanQuickDescription — Ampliar el campo description del plan (PUT parcial).
 * Si ya hay texto, concatena con doble salto de línea.
 */

import { useCallback } from "react";
import { useUpdateTrainingPlanMutation } from "@nexia/shared/api/trainingPlansApi";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { getMutationErrorMessage } from "@nexia/shared";
import { useToast } from "@/components/ui/feedback";

export function useTrainingPlanQuickDescription(
    plan: TrainingPlan | undefined,
    planId: number
) {
    const [updatePlan, { isLoading }] = useUpdateTrainingPlanMutation();
    const { showSuccess, showError } = useToast();

    const saveDescriptionNote = useCallback(
        async (text: string): Promise<boolean> => {
            const t = text.trim();
            if (!t || !plan) return false;

            const current = (plan.description ?? "").trim();
            const next = current ? `${current}\n\n${t}` : t;

            try {
                await updatePlan({ id: planId, data: { description: next } }).unwrap();
                showSuccess("Descripción guardada");
                return true;
            } catch (e) {
                showError(getMutationErrorMessage(e));
                return false;
            }
        },
        [plan, planId, updatePlan, showSuccess, showError]
    );

    return { saveDescriptionNote, isSavingDescription: isLoading };
}
