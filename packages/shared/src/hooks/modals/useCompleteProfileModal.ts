/**
 * useCompleteProfileModal - Lógica para verificar si trainer puede crear clientes
 *
 * Contexto:
 * - Valida campos obligatorios del perfil del trainer
 * - Determina si debe bloquearse la creación de clientes
 * - Cross-platform ready (sin dependencias de navegación)
 *
 * Campos obligatorios:
 * - occupation
 * - training_modality
 * - location_country
 * - location_city
 * - telefono
 *
 * @author Frontend Team
 * @since v4.4.0
 */

import { useGetCurrentTrainerProfileQuery } from '../../api/trainerApi';

interface CompleteProfileModalResult {
    shouldBlock: boolean;
    isProfileComplete: boolean;
    missingFields: string[];
    missingFieldsLabels: string[];
    trainer: any | null;
    isLoading: boolean;
}

const FIELD_LABELS: Record<string, string> = {
    occupation: 'Ocupación',
    training_modality: 'Modalidad de entrenamiento',
    location_country: 'País',
    location_city: 'Ciudad',
    telefono: 'Teléfono de contacto',
};

export function useCompleteProfileModal(): CompleteProfileModalResult {
    const { data: trainer, isLoading } = useGetCurrentTrainerProfileQuery();

    // Campos obligatorios
    const requiredFields = [
        'occupation',
        'training_modality',
        'location_country',
        'location_city',
        'telefono',
    ] as const;

    // Detectar campos faltantes
    const missingFields = requiredFields.filter((field) => {
        const value = trainer?.[field];
        return !value || value === '';
    });

    // Labels legibles para UI
    const missingFieldsLabels = missingFields.map(
        (field) => FIELD_LABELS[field] || field
    );

    const isProfileComplete = missingFields.length === 0 && !!trainer;
    const shouldBlock = !isProfileComplete;

    return {
        shouldBlock,
        isProfileComplete,
        missingFields,
        missingFieldsLabels,
        trainer,
        isLoading,
    };
}