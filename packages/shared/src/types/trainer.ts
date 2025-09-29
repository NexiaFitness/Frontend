/**
 * Tipos TypeScript para sistema de gestión de trainers
 * Define interfaces para trainers, operaciones CRUD y respuestas API
 * Alineado con backend FastAPI schemas y modelo Trainer verificado
 * 
 * Campos profesionales MVP según especificaciones de Adrian:
 * - occupation, training_modality (obligatorios para profile complete)
 * - location_country, location_city (obligatorios)
 * - billing_id, billing_address, billing_postal_code (obligatorios)
 * - specialty (opcional)
 * 
 * @author Frontend Team
 * @since v2.2.0
 */

// Training Modality Types
export const TRAINING_MODALITY = {
  IN_PERSON: 'in_person',
  ONLINE: 'online',
  HYBRID: 'hybrid'
} as const;

export type TrainingModality = (typeof TRAINING_MODALITY)[keyof typeof TRAINING_MODALITY];

// Occupation Types (común en la industria fitness)
export const OCCUPATION_TYPES = {
  PERSONAL_TRAINER: 'personal_trainer',
  FITNESS_COACH: 'fitness_coach',
  STRENGTH_COACH: 'strength_coach',
  SPORTS_TRAINER: 'sports_trainer',
  WELLNESS_COACH: 'wellness_coach',
  NUTRITIONIST: 'nutritionist',
  PHYSIOTHERAPIST: 'physiotherapist',
  OTHER: 'other'
} as const;

export type OccupationType = (typeof OCCUPATION_TYPES)[keyof typeof OCCUPATION_TYPES];

// Specialty Types (opcional)
export const SPECIALTY_TYPES = {
  STRENGTH_TRAINING: 'strength_training',
  WEIGHT_LOSS: 'weight_loss',
  MUSCLE_GAIN: 'muscle_gain',
  ATHLETIC_PERFORMANCE: 'athletic_performance',
  FUNCTIONAL_TRAINING: 'functional_training',
  REHABILITATION: 'rehabilitation',
  SENIOR_FITNESS: 'senior_fitness',
  YOUTH_TRAINING: 'youth_training',
  BODYBUILDING: 'bodybuilding',
  CROSSFIT: 'crossfit',
  POWERLIFTING: 'powerlifting',
  OLYMPIC_LIFTING: 'olympic_lifting',
  CALISTHENICS: 'calisthenics',
  MOBILITY: 'mobility',
  NUTRITION: 'nutrition',
  OTHER: 'other'
} as const;

export type SpecialtyType = (typeof SPECIALTY_TYPES)[keyof typeof SPECIALTY_TYPES];

// Trainer Entity (siguiendo schema backend verificado)
export interface Trainer {
    id: number;
    user_id: number | null;
    nombre: string;
    apellidos: string;
    mail: string;
    telefono: string | null;
    
    // Professional profile fields (MVP)
    occupation: string | null;
    training_modality: string | null;  // in_person | online | hybrid
    location_country: string | null;
    location_city: string | null;
    billing_id: string | null;
    billing_address: string | null;
    billing_postal_code: string | null;
    
    // Optional
    specialty: string | null;
    
    // Audit fields
    created_at: string;  // ISO string
    updated_at: string;  // ISO string
    is_active: boolean;
}

// Trainer Profile Completeness Check
export interface TrainerProfileStatus {
    is_complete: boolean;
    missing_fields: string[];
    completion_percentage: number;
}

// Trainer Request Types
export interface CreateTrainerData {
    nombre: string;
    apellidos: string;
    mail: string;
    telefono?: string;
}

export interface UpdateTrainerData {
    nombre?: string;
    apellidos?: string;
    mail?: string;
    telefono?: string;
    
    // Professional profile updates
    occupation?: string;
    training_modality?: string;
    location_country?: string;
    location_city?: string;
    billing_id?: string;
    billing_address?: string;
    billing_postal_code?: string;
    specialty?: string;
}

// API Response Types
export interface TrainerResponse {
    trainer: Trainer;
    message?: string;
}

export interface TrainersListResponse {
    trainers: Trainer[];
    total: number;
    page?: number;
    per_page?: number;
}

export interface DeleteTrainerResponse {
    message: string;
    deleted_trainer_id: number;
}

// Trainer State - para Redux slice (si se implementa)
export interface TrainerState {
    currentTrainer: Trainer | null;
    trainers: Trainer[];
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
}

// Form Validation Types
export interface TrainerProfileFormData {
    // Basic info (already exists from registration)
    nombre: string;
    apellidos: string;
    mail: string;
    telefono: string;
    
    // Professional info (Complete Profile wizard)
    occupation: string;
    training_modality: TrainingModality;
    location_country: string;
    location_city: string;
    billing_id: string;
    billing_address: string;
    billing_postal_code: string;
    specialty?: SpecialtyType;
}

export interface TrainerProfileFormErrors {
    nombre?: string;
    apellidos?: string;
    mail?: string;
    telefono?: string;
    occupation?: string;
    training_modality?: string;
    location_country?: string;
    location_city?: string;
    billing_id?: string;
    billing_address?: string;
    billing_postal_code?: string;
    specialty?: string;
}

// Utility function para verificar completitud del perfil
export const checkTrainerProfileCompleteness = (trainer: Trainer): TrainerProfileStatus => {
    const requiredFields: (keyof Trainer)[] = [
        'nombre',
        'apellidos', 
        'mail',
        'telefono',
        'occupation',
        'training_modality',
        'location_country',
        'location_city',
        'billing_id',
        'billing_address',
        'billing_postal_code'
    ];
    
    const missingFields = requiredFields.filter(field => {
        const value = trainer[field];
        return value === null || value === undefined || value === '';
    });
    
    const totalFields = requiredFields.length;
    const completedFields = totalFields - missingFields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    
    return {
        is_complete: missingFields.length === 0,
        missing_fields: missingFields,
        completion_percentage: completionPercentage
    };
};

// Helper para labels UI de enums
export const TRAINING_MODALITY_LABELS: Record<TrainingModality, string> = {
    [TRAINING_MODALITY.IN_PERSON]: 'Presencial',
    [TRAINING_MODALITY.ONLINE]: 'Online',
    [TRAINING_MODALITY.HYBRID]: 'Híbrido'
};

export const OCCUPATION_TYPE_LABELS: Record<OccupationType, string> = {
    [OCCUPATION_TYPES.PERSONAL_TRAINER]: 'Entrenador Personal',
    [OCCUPATION_TYPES.FITNESS_COACH]: 'Coach de Fitness',
    [OCCUPATION_TYPES.STRENGTH_COACH]: 'Entrenador de Fuerza',
    [OCCUPATION_TYPES.SPORTS_TRAINER]: 'Entrenador Deportivo',
    [OCCUPATION_TYPES.WELLNESS_COACH]: 'Coach de Bienestar',
    [OCCUPATION_TYPES.NUTRITIONIST]: 'Nutricionista',
    [OCCUPATION_TYPES.PHYSIOTHERAPIST]: 'Fisioterapeuta',
    [OCCUPATION_TYPES.OTHER]: 'Otro'
};

export const SPECIALTY_TYPE_LABELS: Record<SpecialtyType, string> = {
    [SPECIALTY_TYPES.STRENGTH_TRAINING]: 'Entrenamiento de Fuerza',
    [SPECIALTY_TYPES.WEIGHT_LOSS]: 'Pérdida de Peso',
    [SPECIALTY_TYPES.MUSCLE_GAIN]: 'Ganancia Muscular',
    [SPECIALTY_TYPES.ATHLETIC_PERFORMANCE]: 'Rendimiento Atlético',
    [SPECIALTY_TYPES.FUNCTIONAL_TRAINING]: 'Entrenamiento Funcional',
    [SPECIALTY_TYPES.REHABILITATION]: 'Rehabilitación',
    [SPECIALTY_TYPES.SENIOR_FITNESS]: 'Fitness para Mayores',
    [SPECIALTY_TYPES.YOUTH_TRAINING]: 'Entrenamiento Juvenil',
    [SPECIALTY_TYPES.BODYBUILDING]: 'Culturismo',
    [SPECIALTY_TYPES.CROSSFIT]: 'CrossFit',
    [SPECIALTY_TYPES.POWERLIFTING]: 'Powerlifting',
    [SPECIALTY_TYPES.OLYMPIC_LIFTING]: 'Halterofilia Olímpica',
    [SPECIALTY_TYPES.CALISTHENICS]: 'Calistenia',
    [SPECIALTY_TYPES.MOBILITY]: 'Movilidad',
    [SPECIALTY_TYPES.NUTRITION]: 'Nutrición',
    [SPECIALTY_TYPES.OTHER]: 'Otra'
};