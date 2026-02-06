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

    // En modo create, mantener el formulario tradicional con botón al final
    if (mode === "create") {
        return (
            <form onSubmit={onSubmit} className="space-y-10">
                {/* Datos personales */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Datos personales</h3>
                    <PersonalInfo
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                        isEditMode={false}
                    />
                </div>

                {/* Métricas físicas básicas */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Métricas físicas</h3>
                    <PhysicalMetrics
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                </div>

                {/* Métricas antropométricas */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Antropometría</h3>
                    <AnthropometricMetrics
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                </div>

                {/* Objetivos */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Objetivos</h3>
                    <TrainingGoals
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                </div>

                {/* Experiencia */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Experiencia</h3>
                    <Experience
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                </div>

                {/* Información de salud */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Salud</h3>
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
    const sectionClass = "bg-white rounded-lg shadow p-6";
    const headingClass = "text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4";

    return (
        <div className="space-y-10">
            {/* Información Personal */}
            <section
                role="region"
                aria-labelledby="personal-info-heading"
                className={sectionClass}
            >
                <h3 id="personal-info-heading" className={headingClass}>
                    Información Personal
                </h3>
                <PersonalInfo
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    isEditMode={true}
                    hideHeading
                />
                <div className="flex justify-end pt-4 mt-6 border-t border-gray-200">
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
                className={sectionClass}
            >
                <h3 id="anthropometric-heading" className={headingClass}>
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
                <div className="flex justify-end pt-4 mt-6 border-t border-gray-200">
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
                className={sectionClass}
            >
                <h3 id="training-params-heading" className={headingClass}>
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
                <div className="flex justify-end pt-4 mt-6 border-t border-gray-200">
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
                className={sectionClass}
            >
                <h3 id="health-info-heading" className={headingClass}>
                    Información de Salud
                </h3>
                <HealthInfo
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                />
                <div className="flex justify-end pt-4 mt-6 border-t border-gray-200">
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


