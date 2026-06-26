import type { AthleteOnboardingCompletePayload } from "../../../types/athleteOnboarding";
import type { ClientFormData, ClientFormErrors, SessionDuration, TrainingDayValue } from "../../../types/client";
import { SESSION_DURATION_ENUM } from "../../../types/client";

const VALID_SESSION_DURATIONS = Object.values(SESSION_DURATION_ENUM) as SessionDuration[];

export function validateAthleteOnboardingStep(
    step: number,
    formData: ClientFormData,
): { isValid: boolean; errors: ClientFormErrors } {
    const errors: ClientFormErrors = {};

    if (step === 0) {
        if (!formData.sexo) errors.sexo = "Selecciona tu sexo";
        if (!formData.birthdate?.trim()) errors.birthdate = "La fecha de nacimiento es obligatoria";
        if (formData.peso == null || Number.isNaN(formData.peso)) {
            errors.peso = "El peso es obligatorio";
        } else if (formData.peso < 20 || formData.peso > 300) {
            errors.peso = "El peso debe estar entre 20 y 300 kg";
        }
        if (formData.altura == null || Number.isNaN(formData.altura)) {
            errors.altura = "La altura es obligatoria";
        } else if (formData.altura < 100 || formData.altura > 250) {
            errors.altura = "La altura debe estar entre 100 y 250 cm";
        }
    }

    if (step === 1) {
        if (!formData.objetivo_entrenamiento) {
            errors.objetivo_entrenamiento = "Selecciona un objetivo";
        }
    }

    if (step === 2) {
        if (!formData.experiencia) {
            errors.experiencia = "Selecciona tu nivel de experiencia";
        }
        if (!formData.session_duration) {
            errors.session_duration = "Selecciona la duración de sesiones";
        } else if (!VALID_SESSION_DURATIONS.includes(formData.session_duration as SessionDuration)) {
            errors.session_duration = "Selecciona una duración válida";
        }
        if (!formData.training_days || formData.training_days.length === 0) {
            errors.training_days = "Selecciona al menos un día de entrenamiento";
        }
    }

    if (step === 3) {
        const step0 = validateAthleteOnboardingStep(0, formData);
        const step1 = validateAthleteOnboardingStep(1, formData);
        const step2 = validateAthleteOnboardingStep(2, formData);
        Object.assign(errors, step0.errors, step1.errors, step2.errors);
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

export function toAthleteOnboardingPayload(
    formData: ClientFormData,
): AthleteOnboardingCompletePayload {
    return {
        sexo: formData.sexo!,
        birthdate: formData.birthdate!,
        peso: formData.peso!,
        altura: formData.altura!,
        objetivo_entrenamiento: formData.objetivo_entrenamiento!,
        experiencia: formData.experiencia!,
        telefono: formData.telefono?.trim() || null,
        training_days: (formData.training_days ?? []) as TrainingDayValue[],
        session_duration: formData.session_duration as SessionDuration,
        lesiones_relevantes: formData.lesiones_relevantes?.trim() || null,
        descripcion_objetivos: formData.descripcion_objetivos?.trim() || null,
        id_passport: formData.id_passport?.trim() || null,
    };
}
