/**
 * ClientOnboarding.tsx — Vista principal del Onboarding de Clientes
 *
 * Contexto:
 * - Integrado en el dashboard del trainer (con Navbar y SideMenu).
 * - Wizard multi-step que consume useClientOnboarding (shared).
 * - Usa componentes de steps (PersonalInfo, PhysicalMetrics, TrainingGoals, Experience, HealthInfo, Review).
 *
 * Flujo:
 * - Acceso desde /dashboard/clients/onboarding
 * - Avanza paso a paso validando en cada step
 * - Al final, submit → RTK Query createClient
 *
 * @author
 * @since v2.3.0
 */

import React from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";

import { useClientOnboarding } from "@nexia/shared/hooks/clients/useClientOnboarding";
import type { ClientFormData } from "@nexia/shared/types/client";

// Steps
import { PersonalInfo } from "@/components/clients/steps/PersonalInfo";
import { PhysicalMetrics } from "@/components/clients/steps/PhysicalMetrics";
import { TrainingGoals } from "@/components/clients/steps/TrainingGoals";
import { Experience } from "@/components/clients/steps/Experience";
import { HealthInfo } from "@/components/clients/steps/HealthInfo";
import { Review } from "@/components/clients/steps/Review";

const initialClientData: ClientFormData = {
    nombre: "",
    apellidos: "",
    email: "",
    confirmEmail: "",
    edad: undefined,
    peso: undefined,
    altura: undefined,
    objetivo: undefined,
    nivel_experiencia: undefined,
    telefono: "",
    sexo: "",
    observaciones: "",
    lesiones_relevantes: "",
    frecuencia_semanal: "",
};

export const ClientOnboarding: React.FC = () => {
    const {
        formData,
        errors,
        currentStep,
        totalSteps,
        updateField,
        nextStep,
        prevStep,
        submitForm,
        isLoading,
        serverError,
    } = useClientOnboarding(initialClientData);

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/plans" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    // Renderizar step actual
    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <PersonalInfo
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                );
            case 1:
                return (
                    <PhysicalMetrics
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                );
            case 2:
                return (
                    <TrainingGoals
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                );
            case 3:
                return (
                    <Experience
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                );
            case 4:
                return (
                    <HealthInfo
                        formData={formData}
                        errors={errors}
                        updateField={updateField}
                    />
                );
            case 5:
                return <Review formData={formData} />;
            default:
                return null;
        }
    };

    return (
        <>
            {/* Navbar (mobile/tablet) */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Sidebar (desktop) */}
            <TrainerSideMenu />

            {/* Contenido principal */}
            <DashboardLayout>
                {/* Header Section */}
                <div className="mb-8 lg:mb-12 text-center px-4 lg:px-8">
                    <h1 className={`${TYPOGRAPHY.dashboardHero} text-white mb-3 lg:mb-4`}>
                        Alta de nuevo cliente
                    </h1>
                    <p className={`${TYPOGRAPHY.dashboardSubtitleAlt} text-white/70`}>
                        Completa la información necesaria para registrar un nuevo cliente
                    </p>
                </div>

                {/* Wizard Steps */}
                <div className="px-4 lg:px-8 mb-12">
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
                        {renderStep()}

                        {/* Estado / errores */}
                        <div className="mt-6 text-center text-slate-600">
                            Paso {currentStep + 1} de {totalSteps}
                        </div>
                        {serverError && (
                            <div className="mt-4 text-red-600 font-medium">
                                {String(serverError)}
                            </div>
                        )}

                        {/* Botones de navegación */}
                        <div className="mt-8 flex justify-between">
                            {currentStep > 0 && (
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={prevStep}
                                    disabled={isLoading}
                                >
                                    Atrás
                                </Button>
                            )}

                            {currentStep < totalSteps - 1 ? (
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={nextStep}
                                    isLoading={isLoading}
                                    className="ml-auto"
                                >
                                    Siguiente
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={submitForm}
                                    isLoading={isLoading}
                                    className="ml-auto bg-green-600 hover:bg-green-700"
                                >
                                    Crear Cliente
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};
