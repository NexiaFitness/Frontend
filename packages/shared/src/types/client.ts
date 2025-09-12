/**
 * Tipos TypeScript para sistema de gestión de clientes
 * Define interfaces para clientes, operaciones CRUD y respuestas API
 * Alineado con backend FastAPI y sistema RBAC (trainers own clients only)
 * 
 * @author Frontend Team
 * @since v2.1.0
 */

// Client Experience Levels
export const CLIENT_EXPERIENCE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
} as const;

export type ClientExperienceLevel = (typeof CLIENT_EXPERIENCE_LEVELS)[keyof typeof CLIENT_EXPERIENCE_LEVELS];

// Client Goals
export const CLIENT_GOALS = {
  WEIGHT_LOSS: 'weight_loss',
  MUSCLE_GAIN: 'muscle_gain', 
  PERFORMANCE: 'performance',
  HEALTH: 'health'
} as const;

export type ClientGoal = (typeof CLIENT_GOALS)[keyof typeof CLIENT_GOALS];

// Client Entity (siguiendo patrón backend FastAPI con campos español)
export interface Client {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    edad: number;
    peso: number;                    // en kg
    altura: number;                  // en cm
    bmi: number;                     // calculado automáticamente por backend
    objetivo: ClientGoal;
    nivel_experiencia: ClientExperienceLevel;
    trainer_id: number;              // ID del trainer propietario
    fecha_registro: string;          // ISO string
    activo: boolean;
    created_at: string;              // ISO string
    updated_at: string;              // ISO string
}

// Client Request Types
export interface CreateClientData {
    nombre: string;
    apellidos: string;
    email: string;
    edad: number;
    peso: number;
    altura: number;
    objetivo: ClientGoal;
    nivel_experiencia: ClientExperienceLevel;
    // trainer_id se obtiene del token JWT automáticamente
}

export interface UpdateClientData {
    nombre?: string;
    apellidos?: string;
    email?: string;
    edad?: number;
    peso?: number;
    altura?: number;
    objetivo?: ClientGoal;
    nivel_experiencia?: ClientExperienceLevel;
    activo?: boolean;
}

export interface ClientFilters {
    objetivo?: ClientGoal;
    nivel_experiencia?: ClientExperienceLevel;
    activo?: boolean;
    search?: string;                 // búsqueda por nombre/email
}

// API Response Types
export interface ClientResponse {
    client: Client;
    message?: string;
}

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
    // Campos adicionales para el formulario
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
}

// Utility Types para componentes
export interface ClientCardData {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    objetivo: ClientGoal;
    nivel_experiencia: ClientExperienceLevel;
    bmi: number;
    activo: boolean;
    fecha_registro: string;
}