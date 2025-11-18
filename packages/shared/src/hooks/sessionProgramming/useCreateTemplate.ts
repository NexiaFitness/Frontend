/**
 * useCreateTemplate.ts — Hook para crear template nuevo
 *
 * Contexto:
 * - Encapsula lógica de crear session template
 * - Maneja validaciones y transformaciones
 * - Sin dependencias de UI
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import { useCallback } from "react";
import { useCreateSessionTemplateMutation } from "../../api/sessionProgrammingApi";
import type { SessionTemplateCreate } from "../../types/sessionProgramming";

interface CreateTemplateFormData {
    name: string;
    description?: string | null;
    sessionType: string;
    estimatedDuration?: number | null;
    difficultyLevel?: string | null;
    targetMuscles?: string | null;
    equipmentNeeded?: string | null;
    isPublic?: boolean;
}

interface UseCreateTemplateResult {
    createTemplate: (data: CreateTemplateFormData) => Promise<void>;
    isCreating: boolean;
    isError: boolean;
    error: unknown;
}

export const useCreateTemplate = (): UseCreateTemplateResult => {
    const [createMutation, { isLoading, isError, error }] = useCreateSessionTemplateMutation();

    const createTemplate = useCallback(
        async (data: CreateTemplateFormData) => {
            const templateData: SessionTemplateCreate = {
                name: data.name,
                description: data.description,
                session_type: data.sessionType,
                estimated_duration: data.estimatedDuration,
                difficulty_level: data.difficultyLevel,
                target_muscles: data.targetMuscles,
                equipment_needed: data.equipmentNeeded,
                is_public: data.isPublic || false,
            };

            await createMutation(templateData).unwrap();
        },
        [createMutation]
    );

    return {
        createTemplate,
        isCreating: isLoading,
        isError,
        error,
    };
};

