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
 * - UI: Componentes desde clients/shared/ + FormSection premium
 * - Validaciones: validateClientForm (packages/shared)
 *
 * @author Frontend Team
 * @since v4.6.0
 */

import React from "react";
import { Activity, Ruler, Target, User } from "lucide-react";
import type { ClientFormData } from "@nexia/shared/types/client";
import { useClientForm } from "@nexia/shared/hooks/clients/useClientForm";
import { Button } from "@/components/ui/buttons";
import { FormSection } from "@/components/ui/forms/FormSection";
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

    const handleSectionSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const result = await handleSubmit();
        if (result.success && onSubmitSuccess) {
            onSubmitSuccess();
        }
    };

    const saveButton = (label: string) => (
        <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSectionSave}
            disabled={isSubmitting}
            isLoading={isSubmitting}
        >
            {isSubmitting ? "Guardando..." : label}
        </Button>
    );

    const stepProps = { formData, errors, updateField };

    if (mode === "create") {
        return (
            <form onSubmit={onSubmit} className="space-y-6">
                <FormSection
                    icon={<User className="h-4 w-4" />}
                    title="Datos personales"
                    eyebrow="Identidad"
                >
                    <PersonalInfo {...stepProps} isEditMode={false} hideHeading />
                </FormSection>

                <FormSection
                    icon={<Ruler className="h-4 w-4" />}
                    title="Métricas físicas"
                    eyebrow="Antropometría"
                >
                    <PhysicalMetrics {...stepProps} />
                </FormSection>

                <FormSection icon={<Ruler className="h-4 w-4" />} title="Antropometría" eyebrow="Medidas">
                    <AnthropometricMetrics {...stepProps} />
                </FormSection>

                <FormSection icon={<Target className="h-4 w-4" />} title="Objetivos" eyebrow="Entrenamiento">
                    <TrainingGoals {...stepProps} />
                </FormSection>

                <FormSection icon={<Target className="h-4 w-4" />} title="Experiencia" eyebrow="Nivel">
                    <Experience {...stepProps} />
                </FormSection>

                <FormSection icon={<Activity className="h-4 w-4" />} title="Salud" eyebrow="Historial">
                    <HealthInfo {...stepProps} />
                </FormSection>

                <div className="flex justify-end pt-2">
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Guardando..." : "Crear cliente"}
                    </Button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-6">
            <FormSection
                icon={<User className="h-4 w-4" />}
                title="Información Personal"
                eyebrow="Identidad"
                headingId="personal-info-heading"
                footer={saveButton("Guardar cambios")}
            >
                <PersonalInfo {...stepProps} isEditMode hideHeading />
            </FormSection>

            <FormSection
                icon={<Ruler className="h-4 w-4" />}
                title="Datos Antropométricos"
                eyebrow="Medidas"
                headingId="anthropometric-heading"
                footer={saveButton("Guardar cambios")}
            >
                <PhysicalMetrics {...stepProps} />
                <AnthropometricMetrics {...stepProps} isEditMode />
            </FormSection>

            <FormSection
                icon={<Target className="h-4 w-4" />}
                title="Parámetros de Entrenamiento"
                eyebrow="Planificación"
                headingId="training-params-heading"
                footer={saveButton("Guardar cambios")}
            >
                <TrainingGoals {...stepProps} hideHeading />
                <div className="mt-6 border-t border-primary/15 pt-6">
                    <Experience {...stepProps} />
                </div>
            </FormSection>

            <FormSection
                icon={<Activity className="h-4 w-4" />}
                title="Información de Salud"
                eyebrow="Notas clínicas"
                headingId="health-info-heading"
                footer={saveButton("Guardar cambios")}
            >
                <HealthInfo {...stepProps} />
            </FormSection>
        </div>
    );
};
