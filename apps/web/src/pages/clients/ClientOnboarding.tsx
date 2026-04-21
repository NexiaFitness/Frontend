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
 * - DashboardLayout + TrainerSideMenu + navbar (AppNavbar) desde DashboardShell (consistencia visual).
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

    const handleSuccess = (clientId: number) => {
        navigate(`/dashboard/clients/${clientId}`, { replace: true });
    };

    return (
        <ClientOnboardingForm
            initialData={initialFormData}
            onSubmitSuccess={handleSuccess}
            onBackToDashboard={() => navigate("/dashboard/trainer")}
        />
    );
};