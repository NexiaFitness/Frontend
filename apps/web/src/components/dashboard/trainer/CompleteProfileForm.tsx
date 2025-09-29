/**
 * CompleteProfileForm - Formulario de datos profesionales del trainer
 * Usa hook useTrainerProfile para lógica de negocio
 * Integrado con trainerApi para actualización
 * 
 * Campos implementados:
 * - Occupation, Training Modality, Specialty (opcional)
 * - Location (Country + City)
 * - Phone
 * 
 * Billing: Implementado posteriormente en modal al crear cliente
 * 
 * @author Frontend Team
 * @since v2.2.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Input } from "@/components/ui/forms/Input";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { Button } from "@/components/ui/buttons/Button";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useTrainerProfile } from "@shared/hooks/useTrainerProfile";
import { useUpdateTrainerMutation, useGetTrainerQuery } from "@shared/api/trainerApi";
import { 
    TRAINING_MODALITY_LABELS, 
    OCCUPATION_TYPE_LABELS,
    SPECIALTY_TYPE_LABELS,
    TRAINING_MODALITY,
    OCCUPATION_TYPES,
    SPECIALTY_TYPES
} from "@shared/types/trainer";
import type { RootState } from "@shared/store";

// Tipo para errores RTK Query (igual que en useTrainerProfile)
type RTKError = FetchBaseQueryError | {
    status: number;
    data?: { detail?: string; message?: string };
};

export const CompleteProfileForm: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Obtener trainer actual
    const { data: trainerData, isLoading: isLoadingTrainer } = useGetTrainerQuery(
        user?.id || 0,
        { skip: !user?.id }
    );
    
    const [updateTrainer] = useUpdateTrainerMutation();
    
    const {
        formData,
        errors,
        serverError,
        handleInputChange,
        validateForm,
        prepareUpdateData,
        handleServerError,
    } = useTrainerProfile({
        trainer: trainerData?.trainer || null,
        isLoading: isLoadingTrainer,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);

        try {
            const updateData = prepareUpdateData();
            await updateTrainer({
                id: user?.id || 0,
                data: updateData,
            }).unwrap();

            // Success - redirect al dashboard
            navigate('/dashboard', { replace: true });
        } catch (error) {
            handleServerError(error as RTKError);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Options para selects
    const occupationOptions = [
        { value: '', label: 'Selecciona tu ocupación' },
        ...Object.entries(OCCUPATION_TYPES).map(([_, value]) => ({
            value,
            label: OCCUPATION_TYPE_LABELS[value as keyof typeof OCCUPATION_TYPE_LABELS],
        })),
    ];

    const modalityOptions = [
        { value: '', label: 'Selecciona modalidad' },
        ...Object.entries(TRAINING_MODALITY).map(([_, value]) => ({
            value,
            label: TRAINING_MODALITY_LABELS[value as keyof typeof TRAINING_MODALITY_LABELS],
        })),
    ];

    const specialtyOptions = [
        { value: '', label: 'Sin especialidad específica' },
        ...Object.entries(SPECIALTY_TYPES).map(([_, value]) => ({
            value,
            label: SPECIALTY_TYPE_LABELS[value as keyof typeof SPECIALTY_TYPE_LABELS],
        })),
    ];

    if (isLoadingTrainer) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-slate-600 mt-4 text-sm">Cargando tus datos...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Server Error Banner */}
            {serverError && (
                <ServerErrorBanner error={serverError} />
            )}

            {/* Sección 1: Información Profesional */}
            <div>
                <div className="mb-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">
                        Información profesional
                    </h3>
                    <p className="text-slate-600 text-sm lg:text-base">
                        Cuéntanos sobre tu experiencia y modalidad de trabajo
                    </p>
                </div>
                
                <div className="space-y-5">
                    <FormSelect
                        id="occupation"
                        label="Ocupación"
                        value={formData.occupation}
                        onChange={handleInputChange('occupation')}
                        options={occupationOptions}
                        error={errors.occupation}
                        required
                    />

                    <FormSelect
                        id="training_modality"
                        label="Modalidad de entrenamiento"
                        value={formData.training_modality}
                        onChange={handleInputChange('training_modality')}
                        options={modalityOptions}
                        error={errors.training_modality}
                        required
                        helperText="¿Trabajas presencial, online o ambas?"
                    />

                    <FormSelect
                        id="specialty"
                        label="Especialidad"
                        value={formData.specialty || ''}
                        onChange={handleInputChange('specialty')}
                        options={specialtyOptions}
                        error={errors.specialty}
                        helperText="Opcional - Ayuda a tus clientes a encontrarte"
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Sección 2: Ubicación */}
            <div>
                <div className="mb-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">
                        Ubicación
                    </h3>
                    <p className="text-slate-600 text-sm lg:text-base">
                        ¿Dónde ofreces tus servicios?
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                        id="location_country"
                        label="País"
                        type="text"
                        value={formData.location_country}
                        onChange={handleInputChange('location_country')}
                        error={errors.location_country}
                        placeholder="España"
                        required
                    />

                    <Input
                        id="location_city"
                        label="Ciudad"
                        type="text"
                        value={formData.location_city}
                        onChange={handleInputChange('location_city')}
                        error={errors.location_city}
                        placeholder="Madrid"
                        required
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Sección 3: Contacto */}
            <div>
                <div className="mb-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">
                        Contacto
                    </h3>
                    <p className="text-slate-600 text-sm lg:text-base">
                        Para que tus clientes puedan comunicarse contigo
                    </p>
                </div>
                
                <Input
                    id="telefono"
                    label="Teléfono"
                    type="text"
                    value={formData.telefono}
                    onChange={handleInputChange('telefono')}
                    error={errors.telefono}
                    placeholder="+34 600 123 456"
                    required
                    helperText="Formato internacional recomendado"
                />
            </div>

            {/* Submit Button */}
            <div className="pt-6 space-y-4">
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full text-base lg:text-lg font-semibold py-4"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                        </span>
                    ) : (
                        'Completar perfil y acceder al dashboard'
                    )}
                </Button>

                <p className="text-sm text-slate-500 text-center">
                    Podrás modificar estos datos más tarde en tu cuenta
                </p>
            </div>
        </form>
    );
};