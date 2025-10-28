// API
export * from "./api/authApi";
export * from "./api/baseApi";
export * from "./api/clientsApi";
export * from "./api/accountApi";
export * from "./api/trainerApi";

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

// Tipos
export * from "./types/auth";
export * from "./types/client";
export * from "./types/clientOnboarding";
export * from "./types/clientStats";
export * from "./types/trainer";
export * from "./types/account";

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
export * from "./hooks/clients/useClientOnboarding";
export * from "./hooks/usePublicNavigation";
export * from "./hooks/clients/useClientStats";

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

// Components
export * from "./components/SmartNavigation";
export * from "./utils/validations";
export * from "./utils/calculations";