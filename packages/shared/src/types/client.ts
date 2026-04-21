/**
 * client.ts — Tipos TypeScript para sistema de gestión de clientes
 *
 * Contexto:
 * - ALINEADO 100% CON SWAGGER (backend FastAPI)
 * - Nombres de campos exactamente como los espera el backend
 * - Enums en español según TrainingGoalEnum, ExperienceEnum, etc.
 * - Métricas antropométricas con nomenclatura backend completa
 *
 * CAMBIOS CRÍTICOS v3.0.0:
 * - email → mail
 * - objetivo → objetivo_entrenamiento
 * - nivel_experiencia → experiencia
 * - Skinfolds con prefijo "skinfold_"
 * - Girths con nombres completos backend
 * - Diameters con nombres anatómicos completos
 *
 * @author Frontend Team
 * @since v2.1.0
 * @updated v3.0.0 - ALINEACIÓN TOTAL CON SWAGGER
 */

// ========================================
// ENUMS SEGÚN SWAGGER
// ========================================

export const GENDER_ENUM = {
    MASCULINO: "Masculino",
    FEMENINO: "Femenino",
} as const;

export type Gender = (typeof GENDER_ENUM)[keyof typeof GENDER_ENUM];

export const TRAINING_GOAL_ENUM = {
    HIPERTROFIA: "hypertrophy",
    FUERZA: "strength",
    POTENCIA: "power",
    RESISTENCIA: "endurance",
    PERDIDA_PESO: "weight_loss",
    REHABILITACION: "rehabilitation",
    FITNESS_GENERAL: "general_fitness",
    RENDIMIENTO_DEPORTIVO: "sport_performance",
} as const;

export type TrainingGoal = (typeof TRAINING_GOAL_ENUM)[keyof typeof TRAINING_GOAL_ENUM];

export const EXPERIENCE_ENUM = {
    BAJA: "Baja",
    MEDIA: "Media",
    ALTA: "Alta",
} as const;

export type Experience = (typeof EXPERIENCE_ENUM)[keyof typeof EXPERIENCE_ENUM];

export const WEEKLY_FREQUENCY_ENUM = {
    BAJA: "Baja",
    MEDIA: "Media",
    ALTA: "Alta",
} as const;

export type WeeklyFrequency = (typeof WEEKLY_FREQUENCY_ENUM)[keyof typeof WEEKLY_FREQUENCY_ENUM];

export const SESSION_DURATION_ENUM = {
    SHORT_LT_1H: "short_lt_1h",
    MEDIUM_1H_TO_1H30: "medium_1h_to_1h30",
    LONG_GT_1H30: "long_gt_1h30",
} as const;

export type SessionDuration = (typeof SESSION_DURATION_ENUM)[keyof typeof SESSION_DURATION_ENUM];

/** Días de la semana aceptados por el backend (training_days). Usar estos valores en formularios. */
export const TRAINING_DAY_VALUES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
] as const;
export type TrainingDayValue = (typeof TRAINING_DAY_VALUES)[number];

/** Etiquetas cortas para UI (L, M, X, J, V, S, D) */
export const TRAINING_DAY_LABELS: Record<TrainingDayValue, string> = {
    Monday: "L",
    Tuesday: "M",
    Wednesday: "X",
    Thursday: "J",
    Friday: "V",
    Saturday: "S",
    Sunday: "D",
};

// ========================================
// CLIENT ENTITY (Response de GET/POST/PUT)
// ========================================

export interface Client {
    // IDs y metadata
    id: number;
    trainer_id?: number;
    fecha_alta: string;  // Backend genera automáticamente
    
    // Datos personales OBLIGATORIOS
    nombre: string;
    apellidos: string;
    mail: string;  // ← Backend usa "mail", no "email"
    
    // Datos personales OPCIONALES
    telefono?: string | null;
    sexo?: Gender | null;
    observaciones?: string | null;
    id_passport?: string | null;
    birthdate?: string | null;  // ISO date
    
    // Métricas físicas
    edad?: number | null;
    peso?: number | null;  // kg
    altura?: number | null;  // cm (backend espera centímetros)
    imc?: number | null;  // Calculado por backend
    
    // Objetivos y experiencia
    objetivo_entrenamiento?: TrainingGoal | null;  // ← Era "objetivo"
    fecha_definicion_objetivo?: string | null;
    descripcion_objetivos?: string | null;
    experiencia?: Experience | null;  // ← Era "nivel_experiencia"
    lesiones_relevantes?: string | null;
    frecuencia_semanal?: WeeklyFrequency | null;
    
    // Campos adicionales del backend
    objective?: string | null;  // ¿Duplicado? Mantener por compatibilidad
    session_duration?: string | null;
    /** Número exacto de días de entrenamiento por semana (1-7). Backend: exact_training_frequency */
    exact_training_frequency?: number | null;
    /** Días concretos de la semana en que entrena (ej. ["Monday","Wednesday","Friday"]). Backend: training_days */
    training_days?: string[] | null;

    // ========================================
    // ANTROPOMETRÍA (nomenclatura backend exacta)
    // ========================================
    
    // Skinfolds (pliegues cutáneos, mm)
    skinfold_triceps?: number | null;
    skinfold_subscapular?: number | null;
    skinfold_biceps?: number | null;
    skinfold_iliac_crest?: number | null;
    skinfold_supraspinal?: number | null;
    skinfold_abdominal?: number | null;
    skinfold_thigh?: number | null;
    skinfold_calf?: number | null;
    
    // Girths (perímetros, cm)
    girth_relaxed_arm?: number | null;
    girth_flexed_contracted_arm?: number | null;
    girth_waist_minimum?: number | null;
    girth_hips_maximum?: number | null;
    girth_medial_thigh?: number | null;
    girth_maximum_calf?: number | null;
    
    // Diameters (diámetros óseos, cm/mm)
    diameter_humerus_biepicondylar?: number | null;
    diameter_femur_bicondylar?: number | null;
    diameter_bi_styloid_wrist?: number | null;
    
    // Somatotipo (valores 1.0-7.0 para cada componente)
    somatotype_endomorph?: number | null;
    somatotype_mesomorph?: number | null;
    somatotype_ectomorph?: number | null;
    
    // Notas
    notes_1?: string | null;
    notes_2?: string | null;
    notes_3?: string | null;
    
    // Campos legacy (mantener por compatibilidad transitoria)
    activo?: boolean;
    created_at?: string;
    updated_at?: string;
}

// ========================================
// REQUEST TYPES (POST /clients)
// ========================================

export interface CreateClientData {
    // OBLIGATORIOS
    nombre: string;
    apellidos: string;
    mail: string;  // ← "mail", no "email"
    
    // OPCIONALES
    telefono?: string | null;
    sexo?: Gender | null;
    observaciones?: string | null;
    edad?: number | null;
    peso?: number | null;
    altura?: number | null;  // cm
    objetivo_entrenamiento?: TrainingGoal | null;
    fecha_definicion_objetivo?: string | null;
    descripcion_objetivos?: string | null;
    experiencia?: Experience | null;
    lesiones_relevantes?: string | null;
    frecuencia_semanal?: WeeklyFrequency | null;
    id_passport?: string | null;
    birthdate?: string | null;
    objective?: string | null;
    session_duration?: string | null;
    exact_training_frequency?: number | null;
    training_days?: string[] | null;

    // Antropometría
    skinfold_triceps?: number | null;
    skinfold_subscapular?: number | null;
    skinfold_biceps?: number | null;
    skinfold_iliac_crest?: number | null;
    skinfold_supraspinal?: number | null;
    skinfold_abdominal?: number | null;
    skinfold_thigh?: number | null;
    skinfold_calf?: number | null;
    girth_relaxed_arm?: number | null;
    girth_flexed_contracted_arm?: number | null;
    girth_waist_minimum?: number | null;
    girth_hips_maximum?: number | null;
    girth_medial_thigh?: number | null;
    girth_maximum_calf?: number | null;
    diameter_humerus_biepicondylar?: number | null;
    diameter_femur_bicondylar?: number | null;
    diameter_bi_styloid_wrist?: number | null;
    somatotype_endomorph?: number | null;
    somatotype_mesomorph?: number | null;
    somatotype_ectomorph?: number | null;
    notes_1?: string | null;
    notes_2?: string | null;
    notes_3?: string | null;
}

// ========================================
// REQUEST TYPES (PUT /clients/{id})
// ========================================

export type UpdateClientData = Partial<CreateClientData>;

// ========================================
// FILTROS (GET /clients/search)
// ========================================

export interface ClientFilters {
    objetivo_entrenamiento?: TrainingGoal;
    experiencia?: Experience;
    activo?: boolean;
    search?: string;
    age_min?: number;
    age_max?: number;
    gender?: Gender;
    sort_by?: "apellidos" | "nombre" | "edad" | "fecha_alta";
    sort_order?: "asc" | "desc";
}

// ========================================
// API RESPONSES
// ========================================

/**
 * ClientsListResponse - Respuesta de GET /clients/search
 * Alineado 100% con backend FastAPI ClientListResponse schema
 */
export interface ClientsListResponse {
    items: Client[];        // ← Backend usa "items" (no "clients")
    total: number;
    page: number;
    page_size: number;     // ← Backend usa "page_size" (no "per_page")
    has_more: boolean;     // ← Backend usa "has_more" (no "total_pages")
}

export interface DeleteClientResponse {
    message: string;
    deleted_client_id: number;
}

// ========================================
// CLIENT PREVIEW RESPONSE (POST /clients/preview)
// ========================================

/**
 * ClientPreviewResponse - Respuesta de POST /clients/preview
 * Devuelve solo los valores calculados (BMI y somatotipo) sin persistir
 * Alineado 100% con backend FastAPI ClientPreviewResponse schema
 */
export interface ClientPreviewResponse {
    bmi: number | null;
    somatotype: {
        endomorph: number | null;
        mesomorph: number | null;
        ectomorph: number | null;
    };
}

// ========================================
// CLIENT LIST WITH METRICS (Dashboard view)
// ========================================

/**
 * Nivel de satisfacción derivado por el backend (GET /clients/with-metrics).
 * El frontend solo renderiza icono/color; no calcula.
 * Alineado con backend ClientListItem.satisfaction_level.
 */
export type SatisfactionLevel = "happy" | "neutral" | "unhappy";

/**
 * Estado del cliente (activo, pausado, baja).
 * Backend lo expondrá en GET /clients/with-metrics cuando esté implementado (VISTA_CLIENTES_SPEC §15).
 */
export type ClientStatus = "active" | "paused" | "inactive";

/**
 * Tendencia de satisfacción (backend: satisfaction_trend).
 * up = mejora, down = empeora, stable = estable.
 */
export type SatisfactionTrend = "up" | "down" | "stable";

/**
 * Tendencia de progreso del cliente (para icono en lista "Mis clientes").
 * up = ArrowUpRight (verde), down = ArrowDownRight (rojo), stable = Minus (muted).
 */
export type ClientProgressTrend = "up" | "down" | "stable";

/**
 * ClientListItem - Cliente con métricas de fatiga, adherencia y satisfacción.
 * Contrato: GET /clients/with-metrics (backend ClientListItem).
 * Campos de valoraciones: last_satisfaction, satisfaction_level, last_satisfaction_date,
 * avg_satisfaction_recent, satisfaction_trend. status cuando el backend lo añada.
 */
export interface ClientListItem {
    id: number;
    nombre: string;
    apellidos: string;
    mail: string;
    fatigue_level: string | null;
    fatigue_level_numeric: number | null;
    adherence_percentage: number | null;
    /** Última valoración 1-5 (session). Backend. */
    last_satisfaction: number | null;
    /** Nivel derivado: happy | neutral | unhappy. Backend; frontend solo renderiza. */
    satisfaction_level: SatisfactionLevel | null;
    /** Fecha de la última valoración. ISO datetime. */
    last_satisfaction_date: string | null;
    /** Media de las últimas valoraciones (ventana reciente). */
    avg_satisfaction_recent: number | null;
    /** Tendencia de satisfacción (up/down/stable). */
    satisfaction_trend: SatisfactionTrend | null;
    /** Estado del cliente cuando el backend lo exponga (VISTA_CLIENTES_SPEC §15). */
    status?: ClientStatus | null;
    /** Tendencia de progreso para icono; si el backend no lo envía, se muestra "stable". */
    progress_trend?: ClientProgressTrend | null;
}

export interface ClientListWithMetricsResponse {
    items: ClientListItem[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
}

/**
 * Parámetros de GET /clients/with-metrics.
 * status: cuando el backend soporte filtrado por estado (VISTA_CLIENTES_SPEC §12).
 */
export interface GetClientsWithMetricsParams {
    page?: number;
    page_size?: number;
    search?: string | null;
    trainer_id?: number | null;
    status?: ClientStatus | null;
}

// ========================================
// RECENT ACTIVITY
// ========================================

export interface RecentActivityItem {
    id: number;
    type: "session_completed" | "client_added" | "session_scheduled" | "goal_achieved" | "test_completed";
    actor_name: string;
    description: string;
    timestamp: string; // ISO date string
    client_id?: number;
    session_id?: number;
    icon?: string; // Icon identifier for UI
}

export interface RecentActivityResponse {
    items: RecentActivityItem[];
    total: number;
}

// ========================================
// FORMULARIOS (Frontend only)
// ========================================

export interface ClientFormData extends CreateClientData {
    confirmEmail?: string;  // Campo de validación frontend
}

export interface ClientFormErrors {
    nombre?: string;
    apellidos?: string;
    mail?: string;  // ← Cambiado de "email"
    confirmEmail?: string;
    telefono?: string;
    sexo?: string;
    observaciones?: string;
    edad?: string;
    peso?: string;
    altura?: string;
    objetivo_entrenamiento?: string;  // ← Cambiado de "objetivo"
    fecha_definicion_objetivo?: string;
    descripcion_objetivos?: string;
    experiencia?: string;  // ← Cambiado de "nivel_experiencia"
    lesiones_relevantes?: string;
    frecuencia_semanal?: string;
    id_passport?: string;
    birthdate?: string;
    objective?: string;
    session_duration?: string;
    exact_training_frequency?: string;
    training_days?: string;

    // Antropometría
    skinfold_triceps?: string;
    skinfold_subscapular?: string;
    skinfold_biceps?: string;
    skinfold_iliac_crest?: string;
    skinfold_supraspinal?: string;
    skinfold_abdominal?: string;
    skinfold_thigh?: string;
    skinfold_calf?: string;
    girth_relaxed_arm?: string;
    girth_flexed_contracted_arm?: string;
    girth_waist_minimum?: string;
    girth_hips_maximum?: string;
    girth_medial_thigh?: string;
    girth_maximum_calf?: string;
    diameter_humerus_biepicondylar?: string;
    diameter_femur_bicondylar?: string;
    diameter_bi_styloid_wrist?: string;
    somatotype_endomorph?: string;
    somatotype_mesomorph?: string;
    somatotype_ectomorph?: string;
    notes_1?: string;
    notes_2?: string;
    notes_3?: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export interface ClientCardData {
    id: number;
    nombre: string;
    apellidos: string;
    mail: string;
    objetivo_entrenamiento?: TrainingGoal;
    experiencia?: Experience;
    imc?: number;
    activo?: boolean;
    fecha_alta: string;
}

// ========================================
// REDUX STATE TYPES
// ========================================

/**
 * ClientState - Estado de Redux para gestión de clientes
 * Usado por clientsSlice.ts
 */
export interface ClientState {
    clients: Client[];
    selectedClient: Client | null;
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    filters: ClientFilters;
    pagination: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

// ========================================
// CLIENT RATINGS (satisfacción / valoraciones)
// Backend: POST/GET /clients/{id}/ratings, GET/PUT/DELETE /clients/ratings/{id}
// ========================================

export type ClientRatingType = "general" | "session" | "program" | "trainer";

export interface ClientRatingCreate {
    client_id: number;
    trainer_id?: number | null;
    rating: number; // 1-5
    comment?: string | null;
    rating_type?: ClientRatingType;
    session_id?: number | null;
}

export interface ClientRatingUpdate {
    rating?: number; // 1-5
    comment?: string | null;
}

export interface ClientRatingOut {
    id: number;
    client_id: number;
    trainer_id: number | null;
    rating: number;
    comment: string | null;
    rating_type: ClientRatingType;
    session_id: number | null;
    rating_date: string; // ISO datetime
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

// ========================================
// LEGACY EXPORTS (mantener compatibilidad transitoria)
// ========================================

/** @deprecated Use TRAINING_GOAL_ENUM */
export const CLIENT_GOALS = {
    HIPERTROFIA: "hypertrophy",
    FUERZA: "strength",
    POTENCIA: "power",
    RESISTENCIA: "endurance",
    PERDIDA_PESO: "weight_loss",
    REHABILITACION: "rehabilitation",
    FITNESS_GENERAL: "general_fitness",
    RENDIMIENTO_DEPORTIVO: "sport_performance",
} as const;

/** @deprecated Use Experience */
export type ClientExperienceLevel = Experience;

/** @deprecated Use TrainingGoal */
export type ClientGoal = TrainingGoal;