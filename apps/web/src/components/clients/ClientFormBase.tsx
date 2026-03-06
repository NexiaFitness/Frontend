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

    const sectionWrapperClass = "rounded-lg border border-border bg-surface p-6";
    const sectionHeadingClass = "text-lg font-semibold text-foreground mb-4";

    // En modo create, mantener el formulario tradicional con botón al final
    if (mode === "create") {
        return (
            <form onSubmit={onSubmit} className="space-y-8">
                {/* Datos personales */}
                <div className={sectionWrapperClass}>
                    <h3 className={sectionHeadingClass}>Datos personales</h3>
                    <PersonalInfo
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                        isEditMode={false}
                    />
                </div>

                {/* Métricas físicas básicas */}
                <div className={sectionWrapperClass}>
                    <h3 className={sectionHeadingClass}>Métricas físicas</h3>
                    <PhysicalMetrics
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                </div>

                {/* Métricas antropométricas */}
                <div className={sectionWrapperClass}>
                    <h3 className={sectionHeadingClass}>Antropometría</h3>
                    <AnthropometricMetrics
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                </div>

                {/* Objetivos */}
                <div className={sectionWrapperClass}>
                    <h3 className={sectionHeadingClass}>Objetivos</h3>
                    <TrainingGoals
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                </div>

                {/* Experiencia */}
                <div className={sectionWrapperClass}>
                    <h3 className={sectionHeadingClass}>Experiencia</h3>
                    <Experience
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                </div>

                {/* Información de salud */}
                <div className={sectionWrapperClass}>
                    <h3 className={sectionHeadingClass}>Salud</h3>
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
                        {isSubmitting ? "Guardando..." : "Crear cliente"}
                    </Button>
                </div>
            </form>
        );
    }

    // En modo edit, cada sección tiene su propio botón de guardar.
    // Estructura semántica: <section role="region" aria-labelledby> para accesibilidad y tests E2E.
    const editSectionClass = "rounded-lg border border-border bg-surface p-6";
    const editHeadingClass = "text-lg font-semibold text-foreground mb-4";

    return (
        <div className="space-y-8">
            {/* Información Personal */}
            <section
                role="region"
                aria-labelledby="personal-info-heading"
                className={editSectionClass}
            >
                <h3 id="personal-info-heading" className={editHeadingClass}>
                    Información Personal
                </h3>
                <PersonalInfo
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    isEditMode={true}
                    hideHeading
                />
                <div className="flex justify-end pt-4 mt-6 border-t border-border">
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleSectionSave}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
            </section>

            {/* Datos Antropométricos */}
            <section
                role="region"
                aria-labelledby="anthropometric-heading"
                className={editSectionClass}
            >
                <h3 id="anthropometric-heading" className={editHeadingClass}>
                    Datos Antropométricos
                </h3>
                <PhysicalMetrics
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
                <AnthropometricMetrics
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    isEditMode={true}
                />
                <div className="flex justify-end pt-4 mt-6 border-t border-border">
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleSectionSave}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
            </section>

            {/* Parámetros de Entrenamiento */}
            <section
                role="region"
                aria-labelledby="training-params-heading"
                className={editSectionClass}
            >
                <h3 id="training-params-heading" className={editHeadingClass}>
                    Parámetros de Entrenamiento
                </h3>
                <TrainingGoals
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
                <Experience
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
                <div className="flex justify-end pt-4 mt-6 border-t border-border">
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleSectionSave}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
            </section>

            {/* Información de Salud */}
            <section
                role="region"
                aria-labelledby="health-info-heading"
                className={editSectionClass}
            >
                <h3 id="health-info-heading" className={editHeadingClass}>
                    Información de Salud
                </h3>
                <HealthInfo
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
                <div className="flex justify-end pt-4 mt-6 border-t border-border">
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleSectionSave}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
            </section>
        </div>
    );
};


