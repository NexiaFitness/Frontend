/**
 * useCreateSessionFromTemplate.ts — Hook para crear sesión desde template
 *
 * Contexto:
 * - Encapsula lógica de crear sesión desde template existente
 * - Maneja validaciones y transformaciones
 * - Sin dependencias de UI
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import { useCallback } from "react";
import {
    useCreateTrainingSessionMutation,
    useGetSessionTemplateQuery,
    useUseSessionTemplateMutation,
    useApplyTemplateToSessionMutation,
} from "../../api/sessionProgrammingApi";
import { buildDefaultSessionName } from "../../utils/sessionProgramming/buildDefaultSessionName";
import {
    validateSessionDateWithinPlan,
    type TrainingPlanDateRange,
} from "../../utils/sessionProgramming/sessionPlanDateBounds";
import type { TrainingSessionCreate } from "../../types/sessionProgramming";

interface UseCreateSessionFromTemplateParams {
    templateId: number;
    clientId: number;
    trainerId: number;
}

interface CreateSessionFromTemplateInput {
    sessionDate: string;
    trainingPlanId: number;
    planDateRange?: TrainingPlanDateRange | null;
}

interface UseCreateSessionFromTemplateResult {
    createSession: (data: CreateSessionFromTemplateInput) => Promise<void>;
    isCreating: boolean;
    isError: boolean;
    error: unknown;
    template: ReturnType<typeof useGetSessionTemplateQuery>["data"];
    isLoadingTemplate: boolean;
}

export const useCreateSessionFromTemplate = ({
    templateId,
    clientId,
    trainerId,
}: UseCreateSessionFromTemplateParams): UseCreateSessionFromTemplateResult => {
    const [createMutation, { isLoading, isError, error }] = useCreateTrainingSessionMutation();
    const [applyTemplateMutation] = useApplyTemplateToSessionMutation();
    const [useTemplateMutation] = useUseSessionTemplateMutation();
    const { data: template, isLoading: isLoadingTemplate } = useGetSessionTemplateQuery(
        templateId,
        { skip: !templateId || templateId <= 0 }
    );

    const createSession = useCallback(
        async (data: CreateSessionFromTemplateInput) => {
            if (!template) {
                throw new Error("Template no encontrado");
            }

            const dateError = validateSessionDateWithinPlan(
                data.sessionDate,
                data.planDateRange ?? null
            );
            if (dateError) {
                throw new Error(dateError);
            }

            const sessionData: TrainingSessionCreate = {
                training_plan_id: data.trainingPlanId,
                client_id: clientId,
                trainer_id: trainerId,
                session_date: data.sessionDate,
                session_name: buildDefaultSessionName({
                    sessionDate: data.sessionDate,
                    templateName: template.name,
                }),
                session_type: template.session_type,
                planned_duration: template.estimated_duration ?? undefined,
                planned_intensity: undefined,
                planned_volume: undefined,
                status: "planned",
                notes: template.description?.trim()
                    ? template.description.trim()
                    : `Creada desde template: ${template.name}`,
            };

            const created = await createMutation(sessionData).unwrap();

            // Copiar ejercicios del template a la sesión (para que aparezcan en "Ejercicios de la sesión")
            await applyTemplateMutation({
                templateId,
                sessionId: created.id,
            }).unwrap();

            // Incrementar contador de uso del template
            await useTemplateMutation(templateId).unwrap();
        },
        [
            createMutation,
            applyTemplateMutation,
            useTemplateMutation,
            clientId,
            trainerId,
            templateId,
            template,
        ]
    );

    return {
        createSession,
        isCreating: isLoading,
        isError,
        error,
        template,
        isLoadingTemplate,
    };
};


