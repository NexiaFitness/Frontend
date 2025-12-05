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

import React, { useState } from "react";
import type { ClientFormData } from "@nexia/shared/types/client";
import { useClientForm } from "@nexia/shared/hooks/clients/useClientForm";
import { useCompleteProfileModal } from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { CompleteProfileModal } from "@/components/dashboard/modals/CompleteProfileModal";
import { TYPOGRAPHY } from "@/utils/typography";
import { PersonalInfo } from "../shared/PersonalInfo";
import { PhysicalMetrics } from "../shared/PhysicalMetrics";
import { AnthropometricMetrics } from "../shared/AnthropometricMetrics";
import { TrainingGoals } from "../shared/TrainingGoals";
import { Experience } from "../shared/Experience";
import { HealthInfo } from "../shared/HealthInfo";
import { Review } from "../steps/Review";

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
    // ✅ Modal de perfil completo
    const { shouldBlock } = useCompleteProfileModal();
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
    const [showReview, setShowReview] = useState(false);

    // Usar useClientForm para lógica compartida
    const { formData, errors, updateField, handleSubmit, isSubmitting } = useClientForm({
        mode: "create",
        initialData,
    });

    // Props compartidos para todos los componentes
    const stepProps = { formData, errors, updateField };

    // Handler para mostrar Review
    const handleShowReview = () => {
        setShowReview(true);
    };

    // Handler para volver al formulario desde Review
    const handleBackToForm = () => {
        setShowReview(false);
    };

    // Handler para submit final
    const handleCreateProfile = async () => {
        // ✅ Verificar si el perfil está completo antes de permitir crear cliente
        if (shouldBlock) {
            setShowCompleteProfileModal(true);
            return;
        }
        
        const result = await handleSubmit();
        if (result.success && onSubmitSuccess) {
            onSubmitSuccess();
        }
    };

    // Si estamos en Review, mostrar solo Review
    if (showReview) {
        return (
            <>
                <Review
                    formData={formData}
                    onBack={handleBackToForm}
                    onCreateProfile={handleCreateProfile}
                    isSubmitting={isSubmitting}
                />
                <CompleteProfileModal
                    isOpen={showCompleteProfileModal}
                    onClose={() => setShowCompleteProfileModal(false)}
                />
            </>
        );
    }

    // Formulario normal (todos los pasos visibles)
    return (
        <>
            {/* Header - Solo en formulario, no en Review */}
            <div className="mb-6 lg:mb-8 text-center px-4 lg:px-8">
                <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                    Agregar Nuevo Cliente
                </h2>
                <p className="text-white/80 text-sm md:text-base">
                    Ingresa la información básica de tu cliente para comenzar a construir su plan de entrenamiento
                </p>
            </div>

            {/* Form - Una sola vista con scroll, sin contenedor blanco */}
            <div className="px-4 lg:px-8 mb-12">
                <div className="max-w-7xl mx-auto">
                    {/* Todo el formulario en una sola vista */}
                    <div className="space-y-8">
                        {/* Separador visual entre secciones */}
                        <div className="border-b border-gray-300"></div>
                        
                        {/* Información Personal */}
                        <PersonalInfo {...stepProps} isEditMode={false} />
                        
                        <div className="border-b border-gray-300"></div>
                        
                        {/* Datos Antropométricos */}
                        <PhysicalMetrics {...stepProps} />
                        
                        <div className="border-b border-gray-300"></div>
                        
                        {/* Antropometría (Pliegues, Perímetros, Diámetros) */}
                        <AnthropometricMetrics {...stepProps} />
                        
                        <div className="border-b border-gray-300"></div>
                        
                        {/* Parámetros de Entrenamiento */}
                        <TrainingGoals {...stepProps} />
                        
                        <div className="border-b border-gray-300"></div>
                        
                        {/* Experiencia y Frecuencia */}
                        <Experience {...stepProps} />
                        
                        <div className="border-b border-gray-300"></div>
                        
                        {/* Notas */}
                        <HealthInfo {...stepProps} />
                    </div>

                    {/* Navigation buttons - Solo botón Next al final */}
                    <div className="flex justify-end pt-6 mt-8">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleShowReview}
                            className="bg-primary-600 hover:bg-primary-700 text-white min-w-[120px]"
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* ✅ Modal de Complete Profile */}
            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </>
    );
};

