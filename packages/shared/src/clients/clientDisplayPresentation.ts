/**
 * Etiquetas legibles para valores de perfil cliente — nunca exponer enums/snake_case en UI.
 */

import {
    EXPERIENCE_ENUM,
    SESSION_DURATION_ENUM,
    type Experience,
    type SessionDuration,
} from "../types/client";
import { TRAINING_PLAN_GOAL } from "../types/training";
import { SESSION_TYPE_LABELS } from "../types/trainingSessions";

export const TRAINING_GOAL_LABEL_ES: Record<string, string> = {
    [TRAINING_PLAN_GOAL.HYPERTROPHY]: "Hipertrofia",
    [TRAINING_PLAN_GOAL.STRENGTH]: "Fuerza",
    [TRAINING_PLAN_GOAL.POWER]: "Potencia",
    [TRAINING_PLAN_GOAL.ENDURANCE]: "Resistencia",
    [TRAINING_PLAN_GOAL.WEIGHT_LOSS]: "Pérdida de peso",
    [TRAINING_PLAN_GOAL.GENERAL_FITNESS]: "Fitness general",
    [TRAINING_PLAN_GOAL.REHABILITATION]: "Rehabilitación",
    [TRAINING_PLAN_GOAL.SPORT_PERFORMANCE]: "Rendimiento deportivo",
    muscle_gain: "Ganancia muscular",
    performance: "Rendimiento",
    health: "Salud general",
    "Muscle Gain": "Hipertrofia",
    Strength: "Fuerza",
    "Weight Loss": "Pérdida de peso",
    Endurance: "Resistencia",
    "General Fitness": "Fitness general",
    Rehabilitation: "Rehabilitación",
    Performance: "Rendimiento",
};

const SESSION_DURATION_LABEL_ES: Record<SessionDuration, string> = {
    [SESSION_DURATION_ENUM.SHORT_LT_1H]: "Menos de 1 h",
    [SESSION_DURATION_ENUM.MEDIUM_1H_TO_1H30]: "1 h – 1 h 30",
    [SESSION_DURATION_ENUM.LONG_GT_1H30]: "Más de 1 h 30",
};

const CLIENT_PROFILE_FIELD_LABELS: Record<string, string> = {
    session_duration: "Duración de sesión",
    experiencia: "Nivel de experiencia",
    objetivo_entrenamiento: "Objetivo de entrenamiento",
    training_days: "Días de entrenamiento",
    weekly_frequency: "Frecuencia semanal",
};

export function labelTrainingGoal(value?: string | null): string {
    const raw = value?.trim();
    if (!raw) return "No definido";
    return TRAINING_GOAL_LABEL_ES[raw] ?? TRAINING_GOAL_LABEL_ES[raw.toLowerCase()] ?? raw;
}

/** Roles de patrón / músculo en ficha y contexto de sesión (B-10). */
export const PATTERN_ROLE_LABEL_ES: Record<string, string> = {
    primary: "Primario",
    secondary: "Secundario",
};

/** Cualidades del catálogo (migración `physical_qualities`) si el GET no llega. */
export const PHYSICAL_QUALITY_SLUG_LABEL_ES: Record<string, string> = {
    fuerza_maxima: "Fuerza máxima",
    hipertrofia: "Hipertrofia",
    fuerza_resistencia: "Fuerza resistencia",
    potencia: "Potencia",
    resistencia_aerobica: "Resistencia aeróbica",
    resistencia_anaerobica: "Resistencia anaeróbica",
    cardio_extensivo: "Cardio extensivo",
    cardio_intensivo: "Cardio intensivo",
    movilidad: "Movilidad",
    velocidad: "Velocidad",
};

/**
 * Etiqueta ES para un slug de cualidad o rol cuando el catálogo no trae `name`.
 * No hace Title Case: eso convertía `primary` / `hypertrophy` en inglés.
 */
export function labelPhysicalQualitySlug(slug?: string | null): string {
    const raw = slug?.trim();
    if (!raw) return "";
    const key = raw.toLowerCase();
    const fromQuality = PHYSICAL_QUALITY_SLUG_LABEL_ES[raw] ?? PHYSICAL_QUALITY_SLUG_LABEL_ES[key];
    if (fromQuality) return fromQuality;
    const fromGoal = TRAINING_GOAL_LABEL_ES[raw] ?? TRAINING_GOAL_LABEL_ES[key];
    if (fromGoal) return fromGoal;
    const fromRole = PATTERN_ROLE_LABEL_ES[raw] ?? PATTERN_ROLE_LABEL_ES[key];
    if (fromRole) return fromRole;
    return raw.replace(/_/g, " ");
}

/** Nombre + apellidos + objetivo ya etiquetado (cabecera de revisión de sesión). */
export function formatClientIdentityLine(client: {
    nombre?: string | null;
    apellidos?: string | null;
    objetivo_entrenamiento?: string | null;
}): string {
    const goal = client.objetivo_entrenamiento?.trim()
        ? labelTrainingGoal(client.objetivo_entrenamiento)
        : null;
    return [client.nombre, client.apellidos, goal]
        .map((part) => (typeof part === "string" ? part.trim() : part))
        .filter(Boolean)
        .join(" · ");
}

export function labelClientExperience(value?: string | null): string {
    const raw = value?.trim();
    if (!raw) return "No especificada";
    const experienceValues = Object.values(EXPERIENCE_ENUM) as Experience[];
    if (experienceValues.includes(raw as Experience)) return raw;
    const legacy: Record<string, string> = {
        beginner: "Principiante",
        intermediate: "Intermedio",
        advanced: "Avanzado",
        Baja: "Baja",
        Media: "Media",
        Alta: "Alta",
    };
    return legacy[raw] ?? legacy[raw.toLowerCase()] ?? raw;
}

export function labelSessionDuration(value?: string | null): string {
    const raw = value?.trim();
    if (!raw) return "No especificada";
    const known = Object.values(SESSION_DURATION_ENUM) as SessionDuration[];
    if (known.includes(raw as SessionDuration)) {
        return SESSION_DURATION_LABEL_ES[raw as SessionDuration];
    }
    return raw;
}

/**
 * Tipos usados en listado/filtros/alta que no están en TrainingSessionType
 * (alembic normalizó flexibility→technique; endurance sigue en formularios).
 */
const SESSION_EXTRA_TYPE_LABEL_ES: Record<string, string> = {
    technique: "Técnica",
    assessment: "Evaluación",
    endurance: "Resistencia",
    consultation: "Consulta",
};

/** Badge de sesión sin plan (UI entrenador). */
export const STANDALONE_SESSION_KIND_LABEL_ES = "Sesión libre";

export function labelSessionType(value?: string | null): string {
    const raw = value?.trim();
    if (!raw) return "Sesión";
    const key = raw.toLowerCase();
    return (
        SESSION_TYPE_LABELS[key as keyof typeof SESSION_TYPE_LABELS] ??
        SESSION_EXTRA_TYPE_LABEL_ES[key] ??
        raw
    );
}

export function labelClientProfileField(field: string): string {
    return CLIENT_PROFILE_FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

export function labelClientProfileFields(fields: string[]): string {
    return fields
        .map((f) => f.trim())
        .filter(Boolean)
        .map(labelClientProfileField)
        .join(", ");
}

export function formatTemplateAssignEndDate(endDate: string, programWeekCount?: number | null): string {
    const formatted = new Date(`${endDate}T12:00:00`).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    if (programWeekCount != null && programWeekCount > 0) {
        const weeksLabel =
            programWeekCount === 1 ? "1 semana" : `${programWeekCount} semanas`;
        return `${formatted} · ${weeksLabel}`;
    }
    return formatted;
}
