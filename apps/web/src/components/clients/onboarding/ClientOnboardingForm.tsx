/**
 * ClientOnboardingForm.tsx — Formulario wizard para alta de clientes
 *
 * Contexto:
 * - Usa useClientForm para lógica compartida
 * - Mantiene UI de wizard (progress bar, navegación por steps)
 * - Renderiza steps individuales del ClientFormBase
 * - Incluye step Review al final
 *
 * Arquitectura:
 * - Lógica: useClientForm (packages/shared)
 * - UI: Componentes desde clients/shared/ + Review desde steps/
 * - Validaciones: validateClientForm (packages/shared)
 *
 * @author Frontend Team
 * @since v4.6.0
 */

import React, { useState, useMemo, useCallback } from "react";
import type { ClientFormData } from "@nexia/shared/types/client";
import { useClientForm } from "@nexia/shared/hooks/clients/useClientForm";
import { validateClientForm } from "@nexia/shared/utils/validations";
import { Button } from "@/components/ui/buttons";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { PersonalInfo } from "../shared/PersonalInfo";
import { PhysicalMetrics } from "../shared/PhysicalMetrics";
import { AnthropometricMetrics } from "../shared/AnthropometricMetrics";
import { TrainingGoals } from "../shared/TrainingGoals";
import { Experience } from "../shared/Experience";
import { HealthInfo } from "../shared/HealthInfo";
import { Review } from "../steps/Review";

const TOTAL_STEPS = 7;

// Metadata de steps
const STEP_METADATA = [
    { title: "Datos personales", description: "Información básica del cliente" },
    { title: "Métricas físicas", description: "Edad, peso, altura y BMI" },
    { title: "Antropometría", description: "Mediciones avanzadas (opcional)" },
    { title: "Objetivos", description: "Meta principal de entrenamiento" },
    { title: "Experiencia", description: "Nivel y frecuencia de entrenamiento" },
    { title: "Salud", description: "Lesiones y observaciones" },
    { title: "Revisión", description: "Confirma los datos antes de guardar" },
];

export interface ClientOnboardingFormProps {
    initialData: ClientFormData;
    onSubmitSuccess?: () => void;
    onBackToDashboard?: () => void;
}

export const ClientOnboardingForm: React.FC<ClientOnboardingFormProps> = ({
    initialData,
    onSubmitSuccess,
    onBackToDashboard,
}) => {
    const [currentStep, setCurrentStep] = useState<number>(0);

    // Usar useClientForm para lógica compartida
    const { formData, errors, updateField, handleSubmit, isSubmitting } = useClientForm({
        mode: "create",
        initialData,
    });

    // Calcular progreso (%)
    const progressPercentage = useMemo(
        () => ((currentStep + 1) / TOTAL_STEPS) * 100,
        [currentStep]
    );

    /**
     * validateStep — Valida solo el paso actual
     */
    const validateStep = useCallback((): boolean => {
        const { isValid, stepErrors } = validateClientForm(formData, currentStep);
        // Los errores se manejan en useClientForm, pero validamos aquí para navegación
        return isValid;
    }, [formData, currentStep]);

    /**
     * Navegación de pasos
     */
    const nextStep = useCallback(() => {
        if (validateStep()) {
            setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
        }
    }, [validateStep]);

    const prevStep = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    // Renderizar step actual
    const renderCurrentStep = () => {
        const stepProps = { formData, errors, updateField };

        switch (currentStep) {
            case 0:
                return <PersonalInfo {...stepProps} isEditMode={false} />;
            case 1:
                return <PhysicalMetrics {...stepProps} />;
            case 2:
                return <AnthropometricMetrics {...stepProps} />;
            case 3:
                return <TrainingGoals {...stepProps} />;
            case 4:
                return <Experience {...stepProps} />;
            case 5:
                return <HealthInfo {...stepProps} />;
            case 6:
                return <Review formData={formData} />;
            default:
                return null;
        }
    };

    // Handler para submit final
    const handleFinalSubmit = async () => {
        const result = await handleSubmit();
        if (result.success && onSubmitSuccess) {
            onSubmitSuccess();
        }
    };

    // Labels de botones
    const isLastStep = currentStep === TOTAL_STEPS - 1;
    const isFirstStep = currentStep === 0;
    const nextButtonLabel = isLastStep ? "Crear cliente" : "Siguiente";

    return (
        <>
            {/* Progress Bar */}
            <div className="px-4 lg:px-8 mb-8 lg:mb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Progress indicator con steps */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-white/80 text-sm font-medium">
                            Paso {currentStep + 1} de {TOTAL_STEPS}
                        </span>
                        <span className="text-white/80 text-sm font-medium">
                            {Math.round(progressPercentage)}% completado
                        </span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-primary-500 h-full transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    {/* Título y descripción del step actual */}
                    <div className="mt-4 text-center">
                        <h2 className="text-white text-xl lg:text-2xl font-semibold mb-2">
                            {STEP_METADATA[currentStep].title}
                        </h2>
                        <p className="text-white/70 text-sm">
                            {STEP_METADATA[currentStep].description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="px-4 lg:px-8 mb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
                        {/* Step content */}
                        <div className="mb-8">{renderCurrentStep()}</div>

                        {/* Navigation buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                            {/* Botón volver al dashboard (solo en primer step) */}
                            {isFirstStep && onBackToDashboard && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={onBackToDashboard}
                                    className={BUTTON_PRESETS.modalPrimary}
                                    disabled={isSubmitting}
                                >
                                    ← Volver al dashboard
                                </Button>
                            )}

                            {/* Botón anterior (no en primer step) */}
                            {!isFirstStep && (
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={prevStep}
                                    className={BUTTON_PRESETS.modalPrimary}
                                    disabled={isSubmitting}
                                >
                                    ← Anterior
                                </Button>
                            )}

                            {/* Spacer para empujar siguiente a la derecha */}
                            <div className="flex-1" />

                            {/* Botón siguiente/enviar */}
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={isLastStep ? handleFinalSubmit : nextStep}
                                className={BUTTON_PRESETS.modalPrimary}
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Guardando..."
                                    : `${nextButtonLabel} →`}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

