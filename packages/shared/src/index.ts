// API
export * from "./api/authApi";
export * from "./api/baseApi";
export * from "./api/clientsApi";
export * from "./api/accountApi";
export * from "./api/trainerApi";
export * from "./api/trainingPlansApi";

// Store
export * from "./store/authSlice";
export * from "./store";

// Store - Clients (explicit exports to avoid naming conflicts)
export {
    // Actions
    setClients,
    addClient,
    updateClientInList,
    removeClientFromList,
    setSelectedClient,
    setFilters,
    setPage,
    resetClientsState,
    
    // Async thunks
    clearSelectedClient,
    applyFiltersWithDebounce,
    
    // Renamed actions to avoid conflicts
    setLoading as setClientsLoading,
    setCreating as setClientsCreating,
    setUpdating as setClientsUpdating,
    setDeleting as setClientsDeleting,
    setError as setClientsError,
    clearError as clearClientsError,
    
    // Selectors
    selectClients,
    selectClientsList,
    selectSelectedClient,
    selectClientsLoading,
    selectClientsCreating,
    selectClientsUpdating,
    selectClientsDeleting,
    selectClientsError,
    selectClientsFilters,
    selectClientsPagination,
    selectActiveClientsCount,
    selectClientsAnyLoading,
    
    // Default export
    default as clientsReducer,
} from "./store/clientsSlice";

// Store - Training Plans (explicit exports to avoid naming conflicts)
export {
    // Actions
    setTrainingPlans,
    addTrainingPlan,
    updateTrainingPlanInList,
    removeTrainingPlanFromList,
    setSelectedPlan,
    resetTrainingPlansState,
    
    // Async thunks
    clearSelectedPlan,
    applyPlanFiltersWithDebounce,
    
    // Renamed actions to avoid conflicts
    setFilters as setTrainingPlanFilters,
    setLoading as setTrainingPlansLoading,
    setCreating as setTrainingPlansCreating,
    setUpdating as setTrainingPlansUpdating,
    setDeleting as setTrainingPlansDeleting,
    setError as setTrainingPlansError,
    clearError as clearTrainingPlansError,
    
    // Selectors
    selectTrainingPlans,
    selectTrainingPlansList,
    selectSelectedPlan,
    selectTrainingPlansLoading,
    selectTrainingPlansCreating,
    selectTrainingPlansUpdating,
    selectTrainingPlansDeleting,
    selectTrainingPlansError,
    selectTrainingPlansFilters,
    selectActivePlansCount,
    selectTrainingPlansAnyLoading,
    
    // Default export
    default as trainingPlansReducer,
} from "./store/trainingPlansSlice";

// Tipos
export * from "./types/auth";
export * from "./types/client";
export * from "./types/clientOnboarding";
export * from "./types/clientStats";
export * from "./types/trainer";
export * from "./types/account";
export * from "./types/progress";
export * from "./types/training";
export type { ChartView, ChartDataPoint, ChartMetrics } from "./types/charts";

// Enums explícitos de client (para uso directo en componentes)
export {
    GENDER_ENUM,
    TRAINING_GOAL_ENUM,
    EXPERIENCE_ENUM,
    WEEKLY_FREQUENCY_ENUM,
    SESSION_DURATION_ENUM,
    type Gender,
    type TrainingGoal,
    type Experience,
    type WeeklyFrequency,
    type SessionDuration,
} from "./types/client";

// Enums explícitos de training (para uso directo en componentes)
export {
    TRAINING_PLAN_STATUS,
    TRAINING_PLAN_GOAL,
    type TrainingPlanStatus,
    type TrainingPlanGoal,
    type AllCyclesResponse,
} from "./types/training";

// Config
export * from "./config/constants";

// Hooks
export * from "./hooks/useAuthForm";
export * from "./hooks/useAuth";
export * from "./hooks/useLogout";
export * from "./hooks/useRoleGuard";
export * from "./hooks/useRoleNavigation";
export * from "./hooks/useCompleteProfile";
export * from "./hooks/useSmartRouting";
export * from "./hooks/useTrainerProfile";
export * from "./hooks/usePublicNavigation";

// Hooks - Clients (ordenados alfabéticamente)
export * from "./hooks/clients/useClientDetail";
export * from "./hooks/clients/useClientFatigue";
export * from "./hooks/clients/useClientForm";
export * from "./hooks/clients/useClientOnboarding";
export * from "./hooks/clients/useClientProgress";
export * from "./hooks/clients/useClientStats";
export * from "./hooks/clients/useCreateClientProgress";
export * from "./hooks/clients/useUpdateClient";
export * from "./hooks/clients/useUpdateClientProgress";

// Hooks - Modals
export { useCompleteProfileModal } from './hooks/modals/useCompleteProfileModal';
export { useEmailVerificationModal } from './hooks/modals/useEmailVerificationModal';
export { useBillingInfoModal } from './hooks/modals/useBillingInfoModal';
export { useEmailVerificationGuard } from './hooks/modals/useEmailVerificationGuard';

// Services
export * from "./services/authService";

// Storage
export { initStorage, storage } from './storage/IStorage';
export type { IStorage } from './storage/IStorage';

// Utils
export * from "./utils/charts/chartParsers";
export * from "./utils/charts/chartAggregators";

// Components
export * from "./components/SmartNavigation";
export * from "./utils/validations";
export * from "./utils/calculations";