/**
 * ClientFormBase.tsx — Componente base unificado para formularios de cliente
 *
 * Contexto:
 * - Unifica la UI de ClientOnboarding y ClientEditForm
 * - Usa useClientForm hook para lógica compartida
 * - Renderiza todos los componentes compartidos siempre visibles
 * - Compatible con modo 'create' y 'edit'
 *
 * Arquitectura:
 * - Lógica: useClientForm (packages/shared)
 * - UI: Componentes desde clients/shared/
 * - Validaciones: validateClientForm (packages/shared)
 *
 * @author Frontend Team
 * @since v4.6.0
 */

import React from "react";
import type { ClientFormData } from "@nexia/shared/types/client";
import { useClientForm } from "@nexia/shared/hooks/clients/useClientForm";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";
import { PersonalInfo } from "./shared/PersonalInfo";
import { PhysicalMetrics } from "./shared/PhysicalMetrics";
import { AnthropometricMetrics } from "./shared/AnthropometricMetrics";
import { TrainingGoals } from "./shared/TrainingGoals";
import { Experience } from "./shared/Experience";
import { HealthInfo } from "./shared/HealthInfo";

export interface ClientFormBaseProps {
    mode: "create" | "edit";
    initialData: ClientFormData;
    clientId?: number;
    onSubmitSuccess?: () => void;
}

export const ClientFormBase: React.FC<ClientFormBaseProps> = ({
    mode,
    initialData,
    clientId,
    onSubmitSuccess,
}) => {
    const { formData, errors, updateField, handleSubmit, isSubmitting } = useClientForm({
        mode,
        clientId,
        initialData,
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await handleSubmit();
        if (result.success && onSubmitSuccess) {
            onSubmitSuccess();
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-10">
            {/* Datos personales */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={TYPOGRAPHY.sectionTitle}>Datos personales</h3>
                <PersonalInfo
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    isEditMode={mode === "edit"}
                />
            </div>

            {/* Métricas físicas básicas */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={TYPOGRAPHY.sectionTitle}>Métricas físicas</h3>
                <PhysicalMetrics
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
            </div>

            {/* Métricas antropométricas */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={TYPOGRAPHY.sectionTitle}>Antropometría</h3>
                <AnthropometricMetrics
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
            </div>

            {/* Objetivos */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={TYPOGRAPHY.sectionTitle}>Objetivos</h3>
                <TrainingGoals
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
            </div>

            {/* Experiencia */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={TYPOGRAPHY.sectionTitle}>Experiencia</h3>
                <Experience
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
            </div>

            {/* Información de salud */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={TYPOGRAPHY.sectionTitle}>Salud</h3>
                <HealthInfo
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
            </div>

            {/* Botón de submit */}
            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                >
                    {isSubmitting
                        ? "Guardando..."
                        : mode === "create"
                        ? "Crear cliente"
                        : "Guardar cambios"}
                </Button>
            </div>
        </form>
    );
};


