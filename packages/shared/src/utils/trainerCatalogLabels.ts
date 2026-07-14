/**
 * Etiquetas en español para catálogos de perfil trainer.
 * Claves alineadas con GET /api/v1/catalogs/trainer/* (backend/app/api/catalogs.py).
 */

import { TRAINING_MODALITY_LABELS, type TrainingModality } from "../types/trainer";

/** Ocupaciones expuestas por GET /catalogs/trainer/occupations */
export const TRAINER_OCCUPATION_CATALOG_LABELS: Record<string, string> = {
    personal_trainer: "Entrenador personal",
    strength_conditioning_coach: "Preparador físico",
    physiotherapist: "Fisioterapeuta",
    nutrition_coach: "Coach de nutrición",
};

/** Especialidades expuestas por GET /catalogs/trainer/specialties */
export const TRAINER_SPECIALTY_CATALOG_LABELS: Record<string, string> = {
    weight_loss: "Pérdida de peso",
    muscle_gain: "Ganancia muscular",
    rehabilitation: "Rehabilitación",
    performance: "Rendimiento deportivo",
};

export function getTrainerOccupationLabel(value: string): string {
    return TRAINER_OCCUPATION_CATALOG_LABELS[value] ?? value;
}

export function getTrainerModalityLabel(value: string): string {
    return (
        TRAINING_MODALITY_LABELS[value as TrainingModality] ??
        value
    );
}

export function getTrainerSpecialtyLabel(value: string): string {
    return TRAINER_SPECIALTY_CATALOG_LABELS[value] ?? value;
}

export function toTrainerCatalogOptions(
    values: string[],
    getLabel: (value: string) => string,
    placeholder: string,
): { value: string; label: string }[] {
    return [
        { value: "", label: placeholder },
        ...values.map((val) => ({ value: val, label: getLabel(val) })),
    ];
}
