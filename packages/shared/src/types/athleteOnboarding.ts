import type {
    Experience,
    Gender,
    SessionDuration,
    TrainingDayValue,
    TrainingGoal,
} from "./client";

/** Payload for PUT /clients/profile/onboarding (mirrors backend AthleteOnboardingComplete). */
export interface AthleteOnboardingCompletePayload {
    sexo: Gender;
    birthdate: string;
    peso: number;
    altura: number;
    objetivo_entrenamiento: TrainingGoal;
    experiencia: Experience;
    telefono?: string | null;
    training_days: TrainingDayValue[];
    session_duration: SessionDuration;
    lesiones_relevantes?: string | null;
    descripcion_objetivos?: string | null;
    id_passport?: string | null;
}

export const ATHLETE_ONBOARDING_STEP_COUNT = 4;

export const ATHLETE_ONBOARDING_STEP_LABELS = [
    "Datos físicos",
    "Objetivos",
    "Experiencia",
    "Salud y contacto",
] as const;
