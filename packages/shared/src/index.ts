// API
export * from "./api/authApi";
export * from "./api/baseApi";
export * from "./api/clientsApi";
export * from "./api/accountApi";
export * from "./api/trainerApi";
export * from "./api/trainingPlansApi";
export {
    useGetSessionsQuery,
} from "./api/sessionsApi";
// Training Sessions API - exported separately to avoid conflicts
export {
    useGetTrainingSessionsQuery,
    useGetTrainingSessionQuery,
    useGetSessionCoherenceQuery,
    useGetSessionExercisesQuery,
    useCreateTrainingSessionMutation,
    useUpdateTrainingSessionMutation,
    useDeleteTrainingSessionMutation,
    useCreateSessionExerciseMutation,
} from "./api/trainingSessionsApi";
export {
    useGetDayExceptionsQuery,
    useCreateDayExceptionMutation,
    useDeleteDayExceptionMutation,
} from "./api/dayExceptionsApi";
export {
    useGetStandaloneSessionsByClientQuery,
    useGetStandaloneSessionQuery,
    useGetStandaloneSessionExercisesQuery,
    useCreateStandaloneSessionMutation,
    useCreateStandaloneSessionExerciseMutation,
} from "./api/standaloneSessionsApi";
export * from "./api/exercisesApi";
export * from "./api/fatigueApi";
export * from "./api/injuriesApi";
export * from "./api";

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
export * from "./types/exercise";
export * from "./types/account";
export * from "./types/progress";
export * from "./types/training";
export * from "./training/trainingPlanEditor";
export * from "./training/activePeriodBlock";
export * from "./types/trainingAnalytics";
export * from "./types/trainingRecommendations";
export * from "./types/sessionRecommendations";
export * from "./types/sessions";
// Training Sessions Types - exported separately to avoid conflicts with training.ts
export type {
    TrainingSession as PlanTrainingSession,
    TrainingSessionCreate as PlanTrainingSessionCreate,
    TrainingSessionUpdate as PlanTrainingSessionUpdate,
    TrainingSessionType,
    IntensityLevel,
    TrainingSessionStatus,
    SessionExercise,
    SessionExerciseCreate,
} from "./types/trainingSessions";
export {
    SESSION_TYPE_LABELS,
    INTENSITY_LABELS,
    TRAINING_SESSION_STATUS_LABELS,
} from "./types/trainingSessions";
export * from "./types/sessionProgramming";
export type { SessionListItem, StandaloneSessionOut, StandaloneSessionCreate } from "./types/standaloneSessions";
export type { DayException, DayExceptionCreate } from "./types/dayExceptions";
export * from "./types/coherence";
export * from "./types/dashboard";
export * from "./types/testing";
export * from "./types/reports";
export * from "./types/metrics";
export * from "./types/injuries";
// V2 Types (Fase 1: Preparación - no interfiere con legacy)
export * from "./types/metricsV2";
export * from "./types/navigation";
// Export scheduling types explicitly to avoid SessionType conflict with training.ts
export type {
    ScheduledSessionType,
    SessionStatus,
    SessionLocation,
    ScheduledSession,
    ScheduledSessionCreate,
    ScheduledSessionUpdate,
    ConflictCheckRequest,
    ConflictCheckResponse,
    ConflictCheckState,
    FormFieldErrors,
    AvailableSlotsRequest,
    AvailableSlot,
    AvailableSlotsResponse,
    ScheduleSessionFormData,
    ScheduledSessionsFilters,
} from "./types/scheduling";
export {
    SCHEDULED_SESSION_TYPE,
    SESSION_STATUS,
    SESSION_LOCATION,
} from "./types/scheduling";
export type {
    ChartView,
    ChartDataPoint,
    ChartMetrics,
    AdherenceChartData,
    IntensityScatterData,
    MonotonyWeekData,
    StrainWeekData,
} from "./types/charts";

// Enums explícitos de client (para uso directo en componentes)
export {
    GENDER_ENUM,
    TRAINING_GOAL_ENUM,
    EXPERIENCE_ENUM,
    WEEKLY_FREQUENCY_ENUM,
    SESSION_DURATION_ENUM,
    TRAINING_DAY_VALUES,
    TRAINING_DAY_LABELS,
    type Gender,
    type TrainingGoal,
    type Experience,
    type WeeklyFrequency,
    type SessionDuration,
    type TrainingDayValue,
} from "./types/client";

// Exercise Catalog types
export {
    // Reference Tables
    type MovementPattern,
    type MuscleGroup,
    type Equipment,
    type Tag,
    type Action,
    type Variant,
    // Mapping Tables
    type ExerciseMovementPattern,
    type ExerciseMuscle,
    type ExerciseEquipment,
    type ExerciseTag,
    // Variant Mappings
    type VariantMovementPattern,
    type VariantMuscle,
    type VariantEquipment,
    type VariantTag,
    type VariantJointAction,
    // Role Enums
    type MovementPatternRole,
    type MuscleRole,
    type EquipmentRole,
    // Query Params
    type CatalogQueryParams,
    type MappingQueryParams,
} from "./types/exercise";

// Enums explícitos de training (para uso directo en componentes)
export {
    TRAINING_PLAN_STATUS,
    TRAINING_PLAN_GOAL,
    type TrainingPlanStatus,
    type TrainingPlanGoal,
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
export * from "./hooks/clients/useClientsListWithMetrics";
export * from "./hooks/clients/useFatigueAlerts";
export * from "./hooks/clients/useClientForm";
export * from "./hooks/clients/useClientOnboarding";
export * from "./hooks/clients/useClientPreview";
export * from "./hooks/clients/useClientProgress";
export * from "./hooks/clients/useClientStats";
export * from "./hooks/clients/useCreateClientProgress";
export * from "./hooks/clients/useUpdateClient";
export * from "./hooks/clients/useUpdateClientProgress";
export * from "./hooks/clients/useCoherence";
export * from "./hooks/clients/useClientTests";
export * from "./hooks/clients/useCreateTestResult";

// Hooks - Exercises
export * from "./hooks/exercises";

// Hooks - Training
export * from "./hooks/training";
export { useTrainingSessions } from "./hooks/training/useTrainingSessions";

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
export * from "./utils/exerciseNames";
export * from "./utils/charts/chartParsers";
export * from "./utils/charts/chartAggregators";
export * from "./utils/validations";
export * from "./utils/calculations";
export * from "./utils/sessionProgramming";
export { getMutationErrorMessage } from "./utils/errorMessage";
export {
    getClientAvatarColor,
    getClientInitials,
    type ClientAvatarColor,
} from "./utils/clientAvatar";
export {
    getFatigueAlertContextualAction,
    type FatigueAlertContextualAction,
} from "./utils/fatigueAlertActions";
export { parseQualities, qualitiesToDisplayString } from "./utils/qualityUtils";
export { getPhysicalQualityColor, resetFallbackCache, type PhysicalQualityColor } from "./utils/physicalQualityColors";
export { hasOverlap, isDateInRange, countPlannedDays, toLocalISO, type DateRange } from "./utils/periodBlockOverlap";

// Components
export * from "./components/SmartNavigation";

// Dashboard hooks
export * from "./hooks/dashboard";

// Hooks - Reports
export * from "./hooks/reports";

// Hooks - Scheduling
export * from "./hooks/scheduling";

// Hooks - Session Programming
export * from "./hooks/sessionProgramming";

// Hooks - Injuries
export * from "./hooks/injuries";

// Hooks - Metrics
export * from "./hooks/metrics";

// Mocks (temporal - mientras backend implementa endpoints)