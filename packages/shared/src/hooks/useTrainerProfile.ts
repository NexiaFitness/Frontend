/**
 * Hook de negocio para gestión de perfil de trainer
 * Encapsula TODA la lógica: validación, estado, actualización
 * Caso de uso completo - UI solo renderiza
 * 
 * Arquitectura DDD/Hexagonal:
 * - Application Layer: Este hook (caso de uso)
 * - Infrastructure: trainerApi (comunicación con backend)
 * - UI Layer: Componentes solo renderizan
 * 
 * @author Frontend Team
 * @since v2.2.0
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useUpdateTrainerProfileMutation } from "../api/trainerApi";
import type {
    Trainer,
    UpdateTrainerData,
    TrainerProfileFormData,
    TrainerProfileFormErrors,
    TrainerProfileStatus,
} from "../types/trainer";
import { 
    TRAINING_MODALITY,
} from "../types/trainer";

interface UseTrainerProfileProps {
    trainer: Trainer | null;
    isLoading?: boolean;
}

type RTKError = FetchBaseQueryError | {
    status: number;
    data?: { detail?: string; message?: string };
};

type CrossPlatformChangeEvent = {
    target: { value: string };
} | {
    nativeEvent: { text: string };
} | string;

const extractValue = (e: CrossPlatformChangeEvent): string => {
    if (typeof e === 'string') return e;
    if ('target' in e && e.target) return e.target.value;
    if ('nativeEvent' in e && e.nativeEvent) return e.nativeEvent.text;
    return '';
};

export function useTrainerProfile({ trainer, isLoading = false }: UseTrainerProfileProps) {
    const [updateTrainerProfile, { isLoading: isUpdating }] = useUpdateTrainerProfileMutation();

    // Estado inicial simple y predecible
    const [formData, setFormData] = useState<TrainerProfileFormData>({
        nombre: '',
        apellidos: '',
        mail: '',
        telefono: '',
        occupation: '',
        training_modality: TRAINING_MODALITY.IN_PERSON,
        location_country: '',
        location_city: '',
        billing_id: '',
        billing_address: '',
        billing_postal_code: '',
        specialty: undefined,
    });

    const [errors, setErrors] = useState<TrainerProfileFormErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);

    // ÚNICA fuente de sincronización - ejecuta cuando llegan datos del backend
    useEffect(() => {
        if (trainer) {
            setFormData({
                nombre: trainer.nombre || '',
                apellidos: trainer.apellidos || '',
                mail: trainer.mail || '',
                telefono: trainer.telefono || '',
                occupation: trainer.occupation || '',
                training_modality: (trainer.training_modality as any) || TRAINING_MODALITY.IN_PERSON,
                location_country: trainer.location_country || '',
                location_city: trainer.location_city || '',
                billing_id: trainer.billing_id || '',
                billing_address: trainer.billing_address || '',
                billing_postal_code: trainer.billing_postal_code || '',
                specialty: trainer.specialty as any,
            });
        }
    }, [trainer]);

    const handleInputChange = useCallback((field: keyof TrainerProfileFormData) => (
        e: CrossPlatformChangeEvent
    ) => {
        const value = extractValue(e);
        
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        setErrors(prev => ({
            ...prev,
            [field]: undefined,
        }));

        setServerError(null);
    }, []);

    const validateForm = useCallback((): boolean => {
        // Guardia: prevenir validación si no hay datos del trainer
        if (!trainer) {
            return false;
        }

        const newErrors: TrainerProfileFormErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio";
        }

        if (!formData.apellidos.trim()) {
            newErrors.apellidos = "Los apellidos son obligatorios";
        }

        if (!formData.mail.trim()) {
            newErrors.mail = "El email es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
            newErrors.mail = "Email inválido";
        }

        if (!formData.telefono?.trim()) {
            newErrors.telefono = "El teléfono es obligatorio";
        } else if (!/^\+?[\d\s-]{7,15}$/.test(formData.telefono)) {
            newErrors.telefono = "Teléfono inválido (7-15 dígitos)";
        }

        if (!formData.occupation.trim()) {
            newErrors.occupation = "La ocupación es obligatoria";
        }

        if (!formData.training_modality) {
            newErrors.training_modality = "La modalidad de entrenamiento es obligatoria";
        }

        if (!formData.location_country.trim()) {
            newErrors.location_country = "El país es obligatorio";
        }

        if (!formData.location_city.trim()) {
            newErrors.location_city = "La ciudad es obligatoria";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, trainer]);

    const prepareUpdateData = useCallback((): UpdateTrainerData => {
        const updateData: UpdateTrainerData = {};

        if (trainer) {
            if (formData.nombre !== trainer.nombre) updateData.nombre = formData.nombre;
            if (formData.apellidos !== trainer.apellidos) updateData.apellidos = formData.apellidos;
            if (formData.mail !== trainer.mail) updateData.mail = formData.mail;
            if (formData.telefono !== trainer.telefono) updateData.telefono = formData.telefono;
            if (formData.occupation !== trainer.occupation) updateData.occupation = formData.occupation;
            if (formData.training_modality !== trainer.training_modality) updateData.training_modality = formData.training_modality;
            if (formData.location_country !== trainer.location_country) updateData.location_country = formData.location_country;
            if (formData.location_city !== trainer.location_city) updateData.location_city = formData.location_city;
            if (formData.specialty !== trainer.specialty) updateData.specialty = formData.specialty;
        } else {
            return {
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                mail: formData.mail,
                telefono: formData.telefono,
                occupation: formData.occupation,
                training_modality: formData.training_modality,
                location_country: formData.location_country,
                location_city: formData.location_city,
                specialty: formData.specialty,
            };
        }

        return updateData;
    }, [formData, trainer]);

    const handleServerError = useCallback((error: RTKError): string => {
        let errorMessage = "Error de conexión. Intenta de nuevo.";

        if ("status" in error) {
            if ("data" in error && error.data) {
                const data = error.data as { detail?: string; message?: string };
                if (data.detail) errorMessage = data.detail;
                else if (data.message) errorMessage = data.message;
            }

            if (errorMessage === "Error de conexión. Intenta de nuevo.") {
                if (error.status === 400) errorMessage = "Datos inválidos. Verifica la información";
                else if (error.status === 409) errorMessage = "Este email ya está en uso";
                else if (error.status === 404) errorMessage = "Trainer no encontrado";
                else if (error.status === 403) errorMessage = "No tienes permisos para esta acción";
            }
        }

        setServerError(errorMessage);
        return errorMessage;
    }, []);

    const handleSubmit = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        // Guardia: prevenir submit si no hay datos del trainer
        if (!trainer) {
            return { success: false, error: "Cargando datos del perfil..." };
        }

        if (!validateForm()) {
            return { success: false, error: "Formulario inválido" };
        }

        try {
            const updateData = prepareUpdateData();
            await updateTrainerProfile(updateData).unwrap();
            
            return { success: true };
        } catch (error) {
            const errorMsg = handleServerError(error as RTKError);
            return { success: false, error: errorMsg };
        }
    }, [validateForm, prepareUpdateData, updateTrainerProfile, handleServerError, trainer]);

    const profileStatus: TrainerProfileStatus | null = useMemo(() => {
        if (!trainer) return null;
        
        const requiredFields: (keyof Trainer)[] = [
            'nombre', 'apellidos', 'mail', 'telefono',
            'occupation', 'training_modality',
            'location_country', 'location_city',
        ];
        
        const missingFields = requiredFields.filter(field => {
            const value = trainer[field];
            return value === null || value === undefined || value === '';
        });
        
        const totalFields = requiredFields.length;
        const completedFields = totalFields - missingFields.length;
        const completionPercentage = Math.round((completedFields / totalFields) * 100);
        
        return {
            is_complete: missingFields.length === 0,
            missing_fields: missingFields,
            completion_percentage: completionPercentage
        };
    }, [trainer]);

    const clearErrors = useCallback(() => {
        setErrors({});
        setServerError(null);
    }, []);

    const resetForm = useCallback(() => {
        if (trainer) {
            setFormData({
                nombre: trainer.nombre || '',
                apellidos: trainer.apellidos || '',
                mail: trainer.mail || '',
                telefono: trainer.telefono || '',
                occupation: trainer.occupation || '',
                training_modality: (trainer.training_modality as any) || TRAINING_MODALITY.IN_PERSON,
                location_country: trainer.location_country || '',
                location_city: trainer.location_city || '',
                billing_id: trainer.billing_id || '',
                billing_address: trainer.billing_address || '',
                billing_postal_code: trainer.billing_postal_code || '',
                specialty: trainer.specialty as any,
            });
        }
        setErrors({});
        setServerError(null);
    }, [trainer]);

    return {
        formData,
        errors,
        serverError,
        profileStatus,
        isLoading: isLoading || isUpdating,
        isSubmitting: isUpdating,
        handleInputChange,
        handleSubmit,
        clearErrors,
        resetForm,
    };
}