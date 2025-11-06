/**
 * Redux slice para el estado de gestión de clientes.
 * Gestiona lista de clientes, cliente seleccionado, filtros y estados de loading.
 * Se integra con clientsApi (RTK Query) para comunicación con el backend.
 * Implementa operaciones CRUD con estados loading separados.
 *
 * @author Frontend Team
 * @since v2.1.0
 */

import { createSlice, PayloadAction, Slice, createAsyncThunk } from "@reduxjs/toolkit";
import { ClientState, Client, ClientFilters } from "@nexia/shared/types/client";

// Estado inicial tipado
const initialState: ClientState = {
    clients: [],
    selectedClient: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    filters: {},
    pagination: {
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0,
    },
};

// Async thunk para limpiar cliente seleccionado (con delay UX profesional)
export const clearSelectedClient = createAsyncThunk(
    'clients/clearSelectedClient',
    async (_, { rejectWithValue }) => {
        try {
            // Simular delay para transición suave
            await new Promise(resolve => setTimeout(resolve, 100));
            return null;
        } catch (error) {
            return rejectWithValue('Error clearing selected client');
        }
    }
);

// Async thunk para aplicar filtros con debounce
export const applyFiltersWithDebounce = createAsyncThunk(
    'clients/applyFiltersWithDebounce',
    async (filters: ClientFilters, { rejectWithValue }) => {
        try {
            // Simular debounce para búsquedas
            await new Promise(resolve => setTimeout(resolve, 300));
            return filters;
        } catch (error) {
            return rejectWithValue('Error applying filters');
        }
    }
);

// Slice de Redux tipado correctamente
export const clientsSlice: Slice<ClientState> = createSlice({
    name: "clients",
    initialState,
    reducers: {
        // Acción para establecer lista de clientes (desde RTK Query)
        setClients: (
            state: ClientState,
            action: PayloadAction<{ clients: Client[]; pagination: ClientState['pagination'] }>
        ) => {
            state.clients = action.payload.clients;
            state.pagination = action.payload.pagination;
            state.isLoading = false;
            state.error = null;
        },

        // Acción para agregar cliente a la lista (después de crear)
        addClient: (state: ClientState, action: PayloadAction<Client>) => {
            state.clients.unshift(action.payload); // Agregar al inicio
            state.pagination.total += 1;
            state.isCreating = false;
            state.error = null;
        },

        // Acción para actualizar cliente en la lista
        updateClientInList: (state: ClientState, action: PayloadAction<Client>) => {
            const index = state.clients.findIndex(client => client.id === action.payload.id);
            if (index !== -1) {
                state.clients[index] = action.payload;
            }
            // También actualizar selectedClient si coincide
            if (state.selectedClient?.id === action.payload.id) {
                state.selectedClient = action.payload;
            }
            state.isUpdating = false;
            state.error = null;
        },

        // Acción para eliminar cliente de la lista
        removeClientFromList: (state: ClientState, action: PayloadAction<number>) => {
            state.clients = state.clients.filter(client => client.id !== action.payload);
            state.pagination.total = Math.max(0, state.pagination.total - 1);
            // Limpiar selectedClient si coincide
            if (state.selectedClient?.id === action.payload) {
                state.selectedClient = null;
            }
            state.isDeleting = false;
            state.error = null;
        },

        // Acción para establecer cliente seleccionado
        setSelectedClient: (state: ClientState, action: PayloadAction<Client | null>) => {
            state.selectedClient = action.payload;
            state.error = null;
        },

        // Acción para establecer filtros
        setFilters: (state: ClientState, action: PayloadAction<ClientFilters>) => {
            state.filters = action.payload;
            state.pagination.page = 1; // Reset página al filtrar
        },

        // Acción para establecer página de paginación
        setPage: (state: ClientState, action: PayloadAction<number>) => {
            state.pagination.page = action.payload;
        },

        // Acciones para estados de loading específicos
        setLoading: (state: ClientState, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setCreating: (state: ClientState, action: PayloadAction<boolean>) => {
            state.isCreating = action.payload;
        },

        setUpdating: (state: ClientState, action: PayloadAction<boolean>) => {
            state.isUpdating = action.payload;
        },

        setDeleting: (state: ClientState, action: PayloadAction<boolean>) => {
            state.isDeleting = action.payload;
        },

        // Acción para establecer error
        setError: (state: ClientState, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
            state.isCreating = false;
            state.isUpdating = false;
            state.isDeleting = false;
        },

        // Acción para limpiar error
        clearError: (state: ClientState) => {
            state.error = null;
        },

        // Acción para reset completo del estado
        resetClientsState: (state: ClientState) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // clearSelectedClient async thunk handlers
            .addCase(clearSelectedClient.pending, (state) => {
                // No cambiar loading global, es operación local
            })
            .addCase(clearSelectedClient.fulfilled, (state) => {
                state.selectedClient = null;
                state.error = null;
            })
            .addCase(clearSelectedClient.rejected, (state, action) => {
                state.error = action.payload as string || 'Error clearing selected client';
            })
            
            // applyFiltersWithDebounce async thunk handlers
            .addCase(applyFiltersWithDebounce.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(applyFiltersWithDebounce.fulfilled, (state, action) => {
                state.filters = action.payload;
                state.pagination.page = 1; // Reset página
                state.isLoading = false;
            })
            .addCase(applyFiltersWithDebounce.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Error applying filters';
            });
    },
});

// Exportar acciones sincrónicas del slice
export const {
    setClients,
    addClient,
    updateClientInList,
    removeClientFromList,
    setSelectedClient,
    setFilters,
    setPage,
    setLoading,
    setCreating,
    setUpdating,
    setDeleting,
    setError,
    clearError,
    resetClientsState,
} = clientsSlice.actions;

// clearSelectedClient y applyFiltersWithDebounce se exportan por separado como async thunks (ya exportados arriba)

// Selectores tipados
export const selectClients = (state: { clients: ClientState }) => state.clients;
export const selectClientsList = (state: { clients: ClientState }) => state.clients.clients;
export const selectSelectedClient = (state: { clients: ClientState }) => state.clients.selectedClient;
export const selectClientsLoading = (state: { clients: ClientState }) => state.clients.isLoading;
export const selectClientsCreating = (state: { clients: ClientState }) => state.clients.isCreating;
export const selectClientsUpdating = (state: { clients: ClientState }) => state.clients.isUpdating;
export const selectClientsDeleting = (state: { clients: ClientState }) => state.clients.isDeleting;
export const selectClientsError = (state: { clients: ClientState }) => state.clients.error;
export const selectClientsFilters = (state: { clients: ClientState }) => state.clients.filters;
export const selectClientsPagination = (state: { clients: ClientState }) => state.clients.pagination;

// Selector derivado para total de clientes activos
export const selectActiveClientsCount = (state: { clients: ClientState }) =>
    state.clients.clients.filter(client => client.activo).length;

// Selector derivado para indicar si hay operación en progreso
export const selectClientsAnyLoading = (state: { clients: ClientState }) =>
    state.clients.isLoading || state.clients.isCreating || state.clients.isUpdating || state.clients.isDeleting;

// Exportar reducer
export default clientsSlice.reducer;