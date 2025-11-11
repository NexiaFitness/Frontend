/**
 * exercise.ts — Tipos TypeScript para sistema de gestión de ejercicios
 *
 * Contexto:
 * - ALINEADO 100% CON SWAGGER (backend FastAPI)
 * - Nombres de campos exactamente como los espera el backend
 * - Enums según backend: MuscleGroup, Equipment, Level
 *
 * @author Frontend Team
 * @since v4.8.0
 */

// ========================================
// ENUMS SEGÚN SWAGGER
// ========================================

/**
 * MuscleGroup - Grupos musculares principales
 * Backend enum: ["chest", "back", "legs", "shoulders", "arms", "core", "full_body"]
 */
export const MUSCLE_GROUP_ENUM = {
    CHEST: "chest",
    BACK: "back",
    LEGS: "legs",
    SHOULDERS: "shoulders",
    ARMS: "arms",
    CORE: "core",
    FULL_BODY: "full_body",
} as const;

export type MuscleGroup = (typeof MUSCLE_GROUP_ENUM)[keyof typeof MUSCLE_GROUP_ENUM];

/**
 * Equipment - Equipamiento necesario para el ejercicio
 * Backend enum: ["barbell", "dumbbell", "kettlebell", "resistance_band", "bodyweight", "machine", "cable", "other"]
 */
export const EQUIPMENT_ENUM = {
    BARBELL: "barbell",
    DUMBBELL: "dumbbell",
    KETTLEBELL: "kettlebell",
    RESISTANCE_BAND: "resistance_band",
    BODYWEIGHT: "bodyweight",
    MACHINE: "machine",
    CABLE: "cable",
    OTHER: "other",
} as const;

export type Equipment = (typeof EQUIPMENT_ENUM)[keyof typeof EQUIPMENT_ENUM];

/**
 * Level - Nivel de dificultad del ejercicio
 * Backend enum: ["beginner", "intermediate", "advanced"]
 */
export const LEVEL_ENUM = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
} as const;

export type Level = (typeof LEVEL_ENUM)[keyof typeof LEVEL_ENUM];

// ========================================
// EXERCISE ENTITY (Response de GET/POST/PUT)
// ========================================

/**
 * Exercise - Ejercicio completo
 * Backend schema: ExerciseOut
 */
export interface Exercise {
    // IDs y metadata
    id: number;
    exercise_id: number;            // ID único del ejercicio (puede ser igual a id)
    
    // Información básica
    name: string;                    // Nombre del ejercicio
    description: string | null;      // Descripción general
    instructions: string | null;     // Instrucciones de ejecución
    
    // Clasificación
    primary_muscle: MuscleGroup;     // Músculo principal
    secondary_muscles: MuscleGroup[]; // Músculos secundarios (array)
    equipment: Equipment[];          // Equipamiento necesario (array)
    level: Level;                   // Nivel de dificultad
    
    // Multimedia
    video_url: string | null;       // URL del video
    image_url: string | null;        // URL de la imagen
    
    // Notas adicionales
    notes: string | null;            // Notas del ejercicio
    
    // Metadata
    created_at?: string;              // ISO datetime
    updated_at?: string;              // ISO datetime
}

// ========================================
// API RESPONSES
// ========================================

/**
 * ExerciseListResponse - Respuesta de GET /exercises/
 * Alineado 100% con backend FastAPI paginación
 */
export interface ExerciseListResponse {
    items: Exercise[];        // Array de ejercicios
    total: number;            // Total de ejercicios
}

// ========================================
// FILTROS (GET /exercises/)
// ========================================

/**
 * ExerciseFilters - Filtros para búsqueda de ejercicios
 * Backend query params: skip, limit, muscle_group?, equipment?, level?
 */
export interface ExerciseFilters {
    muscle_group?: MuscleGroup;      // Filtrar por grupo muscular
    equipment?: Equipment;           // Filtrar por equipamiento
    level?: Level;                   // Filtrar por nivel
    search?: string;                 // Búsqueda por texto (nombre, descripción)
}

// ========================================
// REQUEST TYPES (si se implementan POST/PUT en el futuro)
// ========================================

/**
 * CreateExerciseData - Payload para crear ejercicio
 * (Reservado para futuras implementaciones)
 */
export interface CreateExerciseData {
    name: string;
    description?: string | null;
    instructions?: string | null;
    primary_muscle: MuscleGroup;
    secondary_muscles?: MuscleGroup[];
    equipment: Equipment[];
    level: Level;
    video_url?: string | null;
    image_url?: string | null;
    notes?: string | null;
}

/**
 * UpdateExerciseData - Payload para actualizar ejercicio
 * (Reservado para futuras implementaciones)
 */
export type UpdateExerciseData = Partial<CreateExerciseData>;

// ========================================
// UTILITY TYPES
// ========================================

/**
 * ExerciseStats - Estadísticas de ejercicios
 * Backend: GET /exercises/stats/summary
 */
export interface ExerciseStats {
    total_exercises: number;
    by_muscle_group: Record<MuscleGroup, number>;
    by_equipment: Record<Equipment, number>;
    by_level: Record<Level, number>;
}

