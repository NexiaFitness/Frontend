import type {
    Experience,
    Gender,
    TrainingGoal,
    WeeklyFrequency,
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
    frecuencia_semanal?: WeeklyFrequency | null;
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
