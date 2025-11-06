/**
 * ClientOnboarding.tsx — Wizard multi-step para alta de clientes
 *
 * Contexto:
 * - Flujo de 7 pasos para crear clientes con datos completos (básicos + antropométricos).
 * - Integrado en dashboard de trainer con layout consistente.
 * - Progress bar visual, navegación step-by-step, validaciones por paso.
 * - Conecta con useClientOnboarding hook (shared, cross-platform).
 *
 * Arquitectura:
 * - DashboardLayout + TrainerSideMenu + DashboardNavbar (consistencia visual).
 * - Renderizado condicional del step actual basado en currentStep.
 * - Botones: Volver al dashboard, Anterior, Siguiente/Enviar.
 *
 * Steps:
 * 0: PersonalInfo
 * 1: PhysicalMetrics
 * 2: AnthropometricMetrics
 * 3: TrainingGoals
 * 4: Experience
 * 5: HealthInfo
 * 6: Review
 *
 * @author Frontend Team
 * @since v2.5.0
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useClientOnboarding } from "@nexia/shared";
import type { ClientFormData } from "@nexia/shared/types/client";

// Importar steps
import { PersonalInfo } from "@/components/clients/steps/PersonalInfo";
import { PhysicalMetrics } from "@/components/clients/steps/PhysicalMetrics";
import { AnthropometricMetrics } from "@/components/clients/steps/AnthropometricMetrics";
import { TrainingGoals } from "@/components/clients/steps/TrainingGoals";
import { Experience } from "@/components/clients/steps/Experience";
import { HealthInfo } from "@/components/clients/steps/HealthInfo";
import { Review } from "@/components/clients/steps/Review";

// Datos iniciales vacíos
const initialFormData: ClientFormData = {
    nombre: "",
    apellidos: "",
    mail: "",
};

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

export const ClientOnboarding: React.FC = () => {
    const navigate = useNavigate();

    // Hook principal del onboarding
    const {
        formData,
        errors,
        currentStep,
        totalSteps,
        isLoading,
        serverError,
        updateField,
        nextStep,
        prevStep,
        submitForm,
    } = useClientOnboarding(initialFormData);

    // Menu items para navbar
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/plans" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    // Calcular progreso (%)
    const progressPercentage = useMemo(
        () => ((currentStep + 1) / totalSteps) * 100,
        [currentStep, totalSteps]
    );

    // Renderizar step actual
    const renderCurrentStep = () => {
        const stepProps = { formData, errors, updateField };

        switch (currentStep) {
            case 0:
                return <PersonalInfo {...stepProps} />;
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
    const handleSubmit = async () => {
        const result = await submitForm();
        if (result.success) {
            navigate("/dashboard/clients", { replace: true });
        }
    };

    // Labels de botones
    const isLastStep = currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;
    const nextButtonLabel = isLastStep ? "Crear cliente" : "Siguiente";

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-8 lg:mb-12 text-center px-4 lg:px-8">
                    <h1 className={`${TYPOGRAPHY.dashboardHero} text-white mb-3 lg:mb-4`}>
                        Nuevo cliente
                    </h1>
                    <p className={`${TYPOGRAPHY.dashboardSubtitleAlt} text-white/70`}>
                        {STEP_METADATA[currentStep].description}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="px-4 lg:px-8 mb-8 lg:mb-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Progress indicator con steps */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-white/80 text-sm font-medium">
                                Paso {currentStep + 1} de {totalSteps}
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

                        {/* Título del step actual */}
                        <div className="mt-4 text-center">
                            <h2 className="text-white text-xl lg:text-2xl font-semibold">
                                {STEP_METADATA[currentStep].title}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="px-4 lg:px-8 mb-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
                            {/* Error del servidor */}
                            {serverError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 text-sm">
                                        Error al crear el cliente. Por favor, intenta de nuevo.
                                    </p>
                                </div>
                            )}

                            {/* Step content */}
                            <div className="mb-8">{renderCurrentStep()}</div>

                            {/* Navigation buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                                {/* Botón volver al dashboard (solo en primer step) */}
                                {isFirstStep && (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => navigate("/dashboard/trainer")}
                                        className={BUTTON_PRESETS.modalPrimary}
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
                                        disabled={isLoading}
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
                                    onClick={isLastStep ? handleSubmit : nextStep}
                                    className={BUTTON_PRESETS.modalPrimary}
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Guardando..."
                                        : `${nextButtonLabel} →`}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="px-4 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-white/50 text-sm">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>Puedes volver atrás en cualquier momento para editar</span>
                        </div>
                        <p className="text-white/50 text-sm">
                            ¿Necesitas ayuda?{" "}
                            <a
                                href="mailto:support@nexia.app"
                                className="text-primary-400 hover:text-primary-300 underline transition-colors"
                            >
                                Contacta con soporte
                            </a>
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};