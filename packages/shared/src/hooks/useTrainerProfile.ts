/**
 * Hook de negocio para gestión de perfil de trainer
 * Lógica pura reutilizable entre web y React Native
 * Maneja validaciones, estado del formulario y actualización de perfil
 * 
 * Workflow:
 * 1. Cargar datos actuales del trainer
 * 2. Validar campos obligatorios para Complete Profile
 * 3. Actualizar perfil con nuevos datos profesionales
 * 4. Verificar completitud del perfil
 * 
 * @author Frontend Team
 * @since v2.2.0
 */

import { useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
    Trainer,
    UpdateTrainerData,
    TrainerProfileFormData,
    TrainerProfileFormErrors,
    TrainerProfileStatus,
    checkTrainerProfileCompleteness,
} from "../types/trainer";
import { 
    TRAINING_MODALITY,
    OCCUPATION_TYPES,
} from "../types/trainer";

interface UseTrainerProfileProps {
    trainer: Trainer | null;
    isLoading?: boolean;
}

// Tipo para errores RTK Query
type RTKError = FetchBaseQueryError | {
    status: number;
    data?: { detail?: string; message?: string };
};

// Cross-platform event type (igual que useAuthForm)
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
    const dispatch = useDispatch<AppDispatch>();

    // Estado del formulario - inicializado con datos del trainer o vacío
    const initialFormData: TrainerProfileFormData = useMemo(() => ({
        nombre: trainer?.nombre || '',
        apellidos: trainer?.apellidos || '',
        mail: trainer?.mail || '',
        telefono: trainer?.telefono || '',
        occupation: trainer?.occupation || '',
        training_modality: (trainer?.training_modality as any) || TRAINING_MODALITY.IN_PERSON,
        location_country: trainer?.location_country || '',
        location_city: trainer?.location_city || '',
        billing_id: trainer?.billing_id || '',
        billing_address: trainer?.billing_address || '',
        billing_postal_code: trainer?.billing_postal_code || '',
        specialty: trainer?.specialty as any,
    }), [trainer]);

    const [formData, setFormData] = useState<TrainerProfileFormData>(initialFormData);
    const [errors, setErrors] = useState<TrainerProfileFormErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);

    // Sincronizar formData cuando cambia el trainer
    useMemo(() => {
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

    // Manejo de cambios de input (estable con useCallback)
    const handleInputChange = useCallback((field: keyof TrainerProfileFormData) => (
        e: CrossPlatformChangeEvent
    ) => {
        const value = extractValue(e);
        
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Limpiar error del campo
        setErrors(prev => ({
            ...prev,
            [field]: undefined,
        }));

        setServerError(null);
    }, []);

    // Validación del formulario
    const validateForm = useCallback((): boolean => {
        const newErrors: TrainerProfileFormErrors = {};

        // Validar campos obligatorios para Complete Profile
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

        if (!formData.billing_id.trim()) {
            newErrors.billing_id = "El ID de facturación es obligatorio";
        }

        if (!formData.billing_address.trim()) {
            newErrors.billing_address = "La dirección de facturación es obligatoria";
        }

        if (!formData.billing_postal_code.trim()) {
            newErrors.billing_postal_code = "El código postal es obligatorio";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Preparar datos para actualización (solo campos modificados)
    const prepareUpdateData = useCallback((): UpdateTrainerData => {
        const updateData: UpdateTrainerData = {};

        // Solo incluir campos que han cambiado
        if (trainer) {
            if (formData.nombre !== trainer.nombre) updateData.nombre = formData.nombre;
            if (formData.apellidos !== trainer.apellidos) updateData.apellidos = formData.apellidos;
            if (formData.mail !== trainer.mail) updateData.mail = formData.mail;
            if (formData.telefono !== trainer.telefono) updateData.telefono = formData.telefono;
            if (formData.occupation !== trainer.occupation) updateData.occupation = formData.occupation;
            if (formData.training_modality !== trainer.training_modality) updateData.training_modality = formData.training_modality;
            if (formData.location_country !== trainer.location_country) updateData.location_country = formData.location_country;
            if (formData.location_city !== trainer.location_city) updateData.location_city = formData.location_city;
            if (formData.billing_id !== trainer.billing_id) updateData.billing_id = formData.billing_id;
            if (formData.billing_address !== trainer.billing_address) updateData.billing_address = formData.billing_address;
            if (formData.billing_postal_code !== trainer.billing_postal_code) updateData.billing_postal_code = formData.billing_postal_code;
            if (formData.specialty !== trainer.specialty) updateData.specialty = formData.specialty;
        } else {
            // Si no hay trainer previo, enviar todos los campos
            return {
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                mail: formData.mail,
                telefono: formData.telefono,
                occupation: formData.occupation,
                training_modality: formData.training_modality,
                location_country: formData.location_country,
                location_city: formData.location_city,
                billing_id: formData.billing_id,
                billing_address: formData.billing_address,
                billing_postal_code: formData.billing_postal_code,
                specialty: formData.specialty,
            };
        }

        return updateData;
    }, [formData, trainer]);

    // Manejo de errores de servidor
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

    // Verificar completitud del perfil
    const profileStatus: TrainerProfileStatus | null = useMemo(() => {
        if (!trainer) return null;
        
        // Importar la función desde types (en uso real)
        // Por ahora implementación inline
        const requiredFields: (keyof Trainer)[] = [
            'nombre', 'apellidos', 'mail', 'telefono',
            'occupation', 'training_modality',
            'location_country', 'location_city',
            'billing_id', 'billing_address', 'billing_postal_code'
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

    // Limpiar errores
    const clearErrors = useCallback(() => {
        setErrors({});
        setServerError(null);
    }, []);

    // Reset del formulario
    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setErrors({});
        setServerError(null);
    }, [initialFormData]);

    return {
        // Estado del formulario
        formData,
        errors,
        serverError,
        
        // Estado del perfil
        profileStatus,
        isLoading,
        
        // Handlers
        handleInputChange,
        validateForm,
        prepareUpdateData,
        handleServerError,
        clearErrors,
        resetForm,
        
        // Setters estables
        setFormData,
        setServerError,
    };
}