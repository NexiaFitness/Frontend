// API
export * from "./api/authApi";
export * from "./api/baseApi";
export * from "./api/clientsApi";
export * from "./api/accountApi";

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
export * from "./types/account";

// Config
export * from "./config/constants";

// Hooks
export * from "./hooks/useAuthForm";
export * from "./hooks/useLogout";

// Utils
export * from "./utils/validation";