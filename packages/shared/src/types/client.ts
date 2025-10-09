/**
 * client.ts — Tipos TypeScript para sistema de gestión de clientes
 *
 * Contexto:
 * - Define entidades, request/response types y estado de Redux.
 * - Alineado con backend FastAPI (RBAC: trainers solo gestionan sus clientes).
 * - Compatible con formularios extendidos de Client Onboarding.
 * - Incluye campos antropométricos avanzados (skinfolds, girths, diameters).
 *
 * Arquitectura de respuestas:
 * - GET/POST/PUT /clients devuelven Client directo (no wrapper).
 * - GET /clients (lista) devuelve {clients, total, page...} (wrapper con paginación).
 * - DELETE /clients devuelve {message, deleted_client_id} (wrapper de confirmación).
 *
 * @author Frontend
 * @since v2.1.0
 * @updated v2.4.0 - Campos opcionales (telefono, sexo, observaciones, lesiones_relevantes, frecuencia_semanal)
 * @updated v2.5.0 - Campos antropométricos completos (skinfolds, girths, diameters, notes, objective, session_duration)
 */

// Client Experience Levels
export const CLIENT_EXPERIENCE_LEVELS = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
} as const;

export type ClientExperienceLevel =
    (typeof CLIENT_EXPERIENCE_LEVELS)[keyof typeof CLIENT_EXPERIENCE_LEVELS];

// Client Goals
export const CLIENT_GOALS = {
    WEIGHT_LOSS: "weight_loss",
    MUSCLE_GAIN: "muscle_gain",
    PERFORMANCE: "performance",
    HEALTH: "health",
} as const;

export type ClientGoal =
    (typeof CLIENT_GOALS)[keyof typeof CLIENT_GOALS];

// Session Duration (nuevo enum del backend)
export const SESSION_DURATION = {
    SHORT: "short",      // 30-45 min
    MEDIUM: "medium",    // 60 min
    LONG: "long",        // 90+ min
} as const;

export type SessionDuration =
    (typeof SESSION_DURATION)[keyof typeof SESSION_DURATION];

// Client Entity (siguiendo patrón backend FastAPI con campos español)
export interface Client {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    
    // Datos básicos opcionales
    edad?: number;
    peso?: number;  // kg
    altura?: number;  // cm (IMPORTANTE: backend ahora espera centímetros, no metros)
    bmi?: number;  // calculado automáticamente por backend
    
    // Objetivo y experiencia
    objetivo?: ClientGoal;
    nivel_experiencia?: ClientExperienceLevel;
    session_duration?: SessionDuration;

    // Contacto y observaciones
    telefono?: string;
    sexo?: string;
    observaciones?: string;
    lesiones_relevantes?: string;
    frecuencia_semanal?: string;

    // ========================================
    // CAMPOS ANTROPOMÉTRICOS AVANZADOS (v2.5.0)
    // ========================================
    
    // Skinfolds (pliegues cutáneos, mm) - Rango: 0-50mm
    triceps?: number;
    subscapular?: number;
    biceps?: number;
    iliac_crest?: number;
    supraspinal?: number;
    abdominal?: number;
    thigh?: number;
    calf?: number;

    // Girths (perímetros, cm) - Rango: 10-200cm
    arm_girth?: number;
    waist_girth?: number;
    hip_girth?: number;

    // Diameters (diámetros óseos, cm)
    wrist_diameter?: number;  // Rango: 3-15cm
    knee_diameter?: number;   // Rango: 5-20cm

    // Notas adicionales
    notes_1?: string;
    notes_2?: string;
    notes_3?: string;

    // Metadata
    trainer_id: number;
    fecha_registro: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

// Client Request Types
export interface CreateClientData {
    nombre: string;
    apellidos: string;
    email: string;

    // Datos básicos opcionales
    edad?: number;
    peso?: number;
    altura?: number;  // cm (backend espera centímetros)
    objetivo?: ClientGoal;
    nivel_experiencia?: ClientExperienceLevel;
    session_duration?: SessionDuration;

    // Contacto y observaciones
    telefono?: string;
    sexo?: string;
    observaciones?: string;
    lesiones_relevantes?: string;
    frecuencia_semanal?: string;

    // Skinfolds (pliegues cutáneos, mm)
    triceps?: number;
    subscapular?: number;
    biceps?: number;
    iliac_crest?: number;
    supraspinal?: number;
    abdominal?: number;
    thigh?: number;
    calf?: number;

    // Girths (perímetros, cm)
    arm_girth?: number;
    waist_girth?: number;
    hip_girth?: number;

    // Diameters (diámetros óseos, cm)
    wrist_diameter?: number;
    knee_diameter?: number;

    // Notas adicionales
    notes_1?: string;
    notes_2?: string;
    notes_3?: string;
}

export interface UpdateClientData {
    nombre?: string;
    apellidos?: string;
    email?: string;
    edad?: number;
    peso?: number;
    altura?: number;  // cm
    objetivo?: ClientGoal;
    nivel_experiencia?: ClientExperienceLevel;
    session_duration?: SessionDuration;
    activo?: boolean;

    telefono?: string;
    sexo?: string;
    observaciones?: string;
    lesiones_relevantes?: string;
    frecuencia_semanal?: string;

    // Antropométricos
    triceps?: number;
    subscapular?: number;
    biceps?: number;
    iliac_crest?: number;
    supraspinal?: number;
    abdominal?: number;
    thigh?: number;
    calf?: number;
    arm_girth?: number;
    waist_girth?: number;
    hip_girth?: number;
    wrist_diameter?: number;
    knee_diameter?: number;

    notes_1?: string;
    notes_2?: string;
    notes_3?: string;
}

export interface ClientFilters {
    objetivo?: ClientGoal;
    nivel_experiencia?: ClientExperienceLevel;
    activo?: boolean;
    search?: string;
}

// API Response Types
export interface ClientsListResponse {
    clients: Client[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface DeleteClientResponse {
    message: string;
    deleted_client_id: number;
}

// Client State - para Redux slice
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

// Client Actions - para Redux slice
export interface ClientActions {
    getClients: (filters?: ClientFilters, page?: number) => Promise<void>;
    getClient: (id: number) => Promise<void>;
    createClient: (data: CreateClientData) => Promise<void>;
    updateClient: (id: number, data: UpdateClientData) => Promise<void>;
    deleteClient: (id: number) => Promise<void>;
    setSelectedClient: (client: Client | null) => void;
    setFilters: (filters: ClientFilters) => void;
    clearError: () => void;
}

// Form Validation Types
export interface ClientFormData extends CreateClientData {
    confirmEmail?: string;
}

export interface ClientFormErrors {
    nombre?: string;
    apellidos?: string;
    email?: string;
    confirmEmail?: string;
    edad?: string;
    peso?: string;
    altura?: string;
    objetivo?: string;
    nivel_experiencia?: string;
    session_duration?: string;

    telefono?: string;
    sexo?: string;
    observaciones?: string;
    lesiones_relevantes?: string;
    frecuencia_semanal?: string;

    // Errores antropométricos
    triceps?: string;
    subscapular?: string;
    biceps?: string;
    iliac_crest?: string;
    supraspinal?: string;
    abdominal?: string;
    thigh?: string;
    calf?: string;
    arm_girth?: string;
    waist_girth?: string;
    hip_girth?: string;
    wrist_diameter?: string;
    knee_diameter?: string;

    notes_1?: string;
    notes_2?: string;
    notes_3?: string;
}

// Utility Types para componentes
export interface ClientCardData {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    objetivo?: ClientGoal;
    nivel_experiencia?: ClientExperienceLevel;
    bmi?: number;
    activo: boolean;
    fecha_registro: string;
}