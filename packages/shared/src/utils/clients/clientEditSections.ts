/**
 * Secciones del formulario editar cliente — validación y payload parcial al guardar.
 */

import type { ClientFormData, ClientFormErrors, UpdateClientData } from "../../types/client";
import { validateClientForm } from "../validations/clients/clientValidation";
import { applyTrainerNotesToClientPayload } from "./trainerNotes";

export type ClientEditSectionId = "personal" | "anthropometric" | "training" | "trainerNotes";

const ANTHROPOMETRIC_FIELD_KEYS: (keyof ClientFormData)[] = [
    "edad",
    "peso",
    "altura",
    "skinfold_triceps",
    "skinfold_subscapular",
    "skinfold_biceps",
    "skinfold_iliac_crest",
    "skinfold_supraspinal",
    "skinfold_abdominal",
    "skinfold_thigh",
    "skinfold_calf",
    "girth_relaxed_arm",
    "girth_flexed_contracted_arm",
    "girth_waist_minimum",
    "girth_hips_maximum",
    "girth_medial_thigh",
    "girth_maximum_calf",
    "diameter_bi_styloid_wrist",
    "diameter_humerus_biepicondylar",
    "diameter_femur_bicondylar",
    "somatotype_endomorph",
    "somatotype_mesomorph",
    "somatotype_ectomorph",
];

const PERSONAL_KEYS: (keyof ClientFormData)[] = [
    "nombre",
    "apellidos",
    "mail",
    "telefono",
    "sexo",
    "birthdate",
    "id_passport",
];

const TRAINING_KEYS: (keyof ClientFormData)[] = [
    "objetivo_entrenamiento",
    "fecha_definicion_objetivo",
    "descripcion_objetivos",
    "experiencia",
    "session_duration",
    "training_days",
];

const TRAINER_NOTES_KEYS: (keyof ClientFormData)[] = [
    "notes_1",
    "notes_2",
    "notes_3",
    "observaciones",
    "lesiones_relevantes",
];

function pickFields(data: ClientFormData, keys: (keyof ClientFormData)[]): UpdateClientData {
    const out: UpdateClientData = {};
    for (const key of keys) {
        if (key in data) {
            (out as Record<string, unknown>)[key] = data[key] ?? null;
        }
    }
    return out;
}

function mergeStepValidations(
    data: ClientFormData,
    steps: number[],
): { isValid: boolean; stepErrors: ClientFormErrors } {
    const stepErrors: ClientFormErrors = {};
    for (const step of steps) {
        const result = validateClientForm(data, step);
        Object.assign(stepErrors, result.stepErrors);
    }
    return {
        isValid: Object.keys(stepErrors).length === 0,
        stepErrors,
    };
}

function filterErrorsForKeys(
    allErrors: ClientFormErrors,
    keys: (keyof ClientFormErrors)[],
): ClientFormErrors {
    const stepErrors: ClientFormErrors = {};
    for (const key of keys) {
        if (allErrors[key]) {
            stepErrors[key] = allErrors[key];
        }
    }
    return stepErrors;
}

export function validateClientEditSection(
    data: ClientFormData,
    section: ClientEditSectionId,
): { isValid: boolean; stepErrors: ClientFormErrors } {
    switch (section) {
        case "personal":
            return mergeStepValidations(data, [0]);
        case "anthropometric": {
            const required = mergeStepValidations(data, [1]);
            const full = validateClientForm(data);
            const rangeErrors = filterErrorsForKeys(
                full.stepErrors,
                ANTHROPOMETRIC_FIELD_KEYS as (keyof ClientFormErrors)[],
            );
            const stepErrors = { ...required.stepErrors, ...rangeErrors };
            return {
                isValid: Object.keys(stepErrors).length === 0,
                stepErrors,
            };
        }
        case "training":
            return mergeStepValidations(data, [3, 4]);
        case "trainerNotes":
            return mergeStepValidations(data, [5]);
        default:
            return { isValid: true, stepErrors: {} };
    }
}

export function buildClientEditSectionPayload(
    formData: ClientFormData,
    section: ClientEditSectionId,
): UpdateClientData {
    switch (section) {
        case "personal":
            return pickFields(formData, PERSONAL_KEYS);
        case "anthropometric":
            return pickFields(formData, ANTHROPOMETRIC_FIELD_KEYS);
        case "training": {
            const picked = pickFields(formData, TRAINING_KEYS);
            return {
                ...picked,
                objective: formData.objetivo_entrenamiento ?? null,
            };
        }
        case "trainerNotes": {
            const normalized = applyTrainerNotesToClientPayload(formData);
            return pickFields(normalized, TRAINER_NOTES_KEYS);
        }
        default:
            return {};
    }
}
