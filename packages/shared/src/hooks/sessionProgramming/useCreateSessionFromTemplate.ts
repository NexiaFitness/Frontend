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
import { useCreateTrainingSessionMutation, useGetSessionTemplateQuery, useUseSessionTemplateMutation } from "../../api/sessionProgrammingApi";
import type { TrainingSessionCreate } from "../../types/sessionProgramming";

interface UseCreateSessionFromTemplateParams {
    templateId: number;
    clientId: number;
    trainerId: number;
}

interface UseCreateSessionFromTemplateResult {
    createSession: (data: { sessionDate: string; microcycleId?: number }) => Promise<void>;
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
    const [useTemplateMutation] = useUseSessionTemplateMutation();
    const { data: template, isLoading: isLoadingTemplate } = useGetSessionTemplateQuery(templateId);

    const createSession = useCallback(
        async (data: { sessionDate: string; microcycleId?: number }) => {
            if (!template) {
                throw new Error("Template no encontrado");
            }

            // Crear sesión con datos del template
            const sessionData: TrainingSessionCreate = {
                microcycle_id: data.microcycleId || 0, // Si no hay microcycle, usar 0 (backend puede requerirlo)
                client_id: clientId,
                trainer_id: trainerId,
                session_date: data.sessionDate,
                session_name: template.name,
                session_type: template.session_type,
                planned_duration: template.estimated_duration,
                planned_intensity: null,
                planned_volume: null,
                status: "planned",
                notes: `Creada desde template: ${template.name}`,
            };

            await createMutation(sessionData).unwrap();

            // Incrementar contador de uso del template
            await useTemplateMutation(templateId).unwrap();
        },
        [createMutation, useTemplateMutation, clientId, trainerId, templateId, template]
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

