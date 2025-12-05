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

/**
 * ClientOnboarding.tsx — Página de wizard para alta de clientes
 *
 * Contexto:
 * - Página wrapper que usa ClientOnboardingForm
 * - Mantiene layout del dashboard (navbar, sidebar)
 * - Maneja navegación post-submit
 *
 * @author Frontend Team
 * @since v2.5.0
 * @updated v4.6.0 - Refactorizado para usar ClientOnboardingForm
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { ClientOnboardingForm } from "@/components/clients/onboarding/ClientOnboardingForm";
import type { ClientFormData } from "@nexia/shared/types/client";

// Datos iniciales vacíos
const initialFormData: ClientFormData = {
    nombre: "",
    apellidos: "",
    mail: "",
};

export const ClientOnboarding: React.FC = () => {
    const navigate = useNavigate();

    // Menu items para navbar
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    const handleSuccess = () => {
        navigate("/dashboard/clients", { replace: true });
    };

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />

            <DashboardLayout>
                {/* ClientOnboardingForm con wizard */}
                <ClientOnboardingForm
                    initialData={initialFormData}
                    onSubmitSuccess={handleSuccess}
                    onBackToDashboard={() => navigate("/dashboard/trainer")}
                />

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