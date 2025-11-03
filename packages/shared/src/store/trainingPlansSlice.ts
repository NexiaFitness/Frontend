/**
 * trainingPlansSlice.ts — Redux slice para gestión de training plans
 *
 * Contexto:
 * - Gestiona lista de planes, plan seleccionado, filtros y estados de loading
 * - Se integra con trainingPlansApi (RTK Query) para comunicación con backend
 * - Implementa operaciones CRUD con estados loading separados
 * - Patrón idéntico a clientsSlice para consistencia
 *
 * NOTA: Backend devuelve array directo (no wrapper paginado)
 * La paginación se maneja con skip/limit en frontend
 *
 * @author Frontend Team
 * @since v3.2.0
 */

import { createSlice, PayloadAction, Slice, createAsyncThunk } from "@reduxjs/toolkit";
import { TrainingPlanState, TrainingPlan, TrainingPlanFilters } from "@nexia/shared/types/training";

// Estado inicial tipado
const initialState: TrainingPlanState = {
    plans: [],
    selectedPlan: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    filters: {},
};

// Async thunk para limpiar plan seleccionado (con delay UX profesional)
export const clearSelectedPlan = createAsyncThunk(
    'trainingPlans/clearSelectedPlan',
    async (_, { rejectWithValue }) => {
        try {
            // Simular delay para transición suave
            await new Promise(resolve => setTimeout(resolve, 100));
            return null;
        } catch (error) {
            return rejectWithValue('Error clearing selected plan');
        }
    }
);

// Async thunk para aplicar filtros con debounce
export const applyPlanFiltersWithDebounce = createAsyncThunk(
    'trainingPlans/applyFiltersWithDebounce',
    async (filters: TrainingPlanFilters, { rejectWithValue }) => {
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
export const trainingPlansSlice: Slice<TrainingPlanState> = createSlice({
    name: "trainingPlans",
    initialState,
    reducers: {
        // Acción para establecer lista de planes (desde RTK Query)
        setTrainingPlans: (
            state: TrainingPlanState,
            action: PayloadAction<TrainingPlan[]>
        ) => {
            state.plans = action.payload;
            state.isLoading = false;
            state.error = null;
        },

        // Acción para agregar plan a la lista (después de crear)
        addTrainingPlan: (state: TrainingPlanState, action: PayloadAction<TrainingPlan>) => {
            state.plans.unshift(action.payload); // Agregar al inicio
            state.isCreating = false;
            state.error = null;
        },

        // Acción para actualizar plan en la lista
        updateTrainingPlanInList: (state: TrainingPlanState, action: PayloadAction<TrainingPlan>) => {
            const index = state.plans.findIndex(plan => plan.id === action.payload.id);
            if (index !== -1) {
                state.plans[index] = action.payload;
            }
            // También actualizar selectedPlan si coincide
            if (state.selectedPlan?.id === action.payload.id) {
                state.selectedPlan = action.payload;
            }
            state.isUpdating = false;
            state.error = null;
        },

        // Acción para eliminar plan de la lista
        removeTrainingPlanFromList: (state: TrainingPlanState, action: PayloadAction<number>) => {
            state.plans = state.plans.filter(plan => plan.id !== action.payload);
            // Limpiar selectedPlan si coincide
            if (state.selectedPlan?.id === action.payload) {
                state.selectedPlan = null;
            }
            state.isDeleting = false;
            state.error = null;
        },

        // Acción para establecer plan seleccionado
        setSelectedPlan: (state: TrainingPlanState, action: PayloadAction<TrainingPlan | null>) => {
            state.selectedPlan = action.payload;
            state.error = null;
        },

        // Acción para establecer filtros
        setFilters: (state: TrainingPlanState, action: PayloadAction<TrainingPlanFilters>) => {
            state.filters = action.payload;
        },

        // Acciones para estados de loading específicos
        setLoading: (state: TrainingPlanState, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setCreating: (state: TrainingPlanState, action: PayloadAction<boolean>) => {
            state.isCreating = action.payload;
        },

        setUpdating: (state: TrainingPlanState, action: PayloadAction<boolean>) => {
            state.isUpdating = action.payload;
        },

        setDeleting: (state: TrainingPlanState, action: PayloadAction<boolean>) => {
            state.isDeleting = action.payload;
        },

        // Acción para establecer error
        setError: (state: TrainingPlanState, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
            state.isCreating = false;
            state.isUpdating = false;
            state.isDeleting = false;
        },

        // Acción para limpiar error
        clearError: (state: TrainingPlanState) => {
            state.error = null;
        },

        // Acción para reset completo del estado
        resetTrainingPlansState: (state: TrainingPlanState) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // clearSelectedPlan async thunk handlers
            .addCase(clearSelectedPlan.pending, (state) => {
                // No cambiar loading global, es operación local
            })
            .addCase(clearSelectedPlan.fulfilled, (state) => {
                state.selectedPlan = null;
                state.error = null;
            })
            .addCase(clearSelectedPlan.rejected, (state, action) => {
                state.error = action.payload as string || 'Error clearing selected plan';
            })
            
            // applyPlanFiltersWithDebounce async thunk handlers
            .addCase(applyPlanFiltersWithDebounce.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(applyPlanFiltersWithDebounce.fulfilled, (state, action) => {
                state.filters = action.payload;
                state.isLoading = false;
            })
            .addCase(applyPlanFiltersWithDebounce.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Error applying filters';
            });
    },
});

// Exportar acciones sincrónicas del slice
export const {
    setTrainingPlans,
    addTrainingPlan,
    updateTrainingPlanInList,
    removeTrainingPlanFromList,
    setSelectedPlan,
    setFilters,
    setLoading,
    setCreating,
    setUpdating,
    setDeleting,
    setError,
    clearError,
    resetTrainingPlansState,
} = trainingPlansSlice.actions;

// Selectores tipados
export const selectTrainingPlans = (state: { trainingPlans: TrainingPlanState }) => state.trainingPlans;
export const selectTrainingPlansList = (state: { trainingPlans: TrainingPlanState }) => state.trainingPlans.plans;
export const selectSelectedPlan = (state: { trainingPlans: TrainingPlanState }) => state.trainingPlans.selectedPlan;
export const selectTrainingPlansLoading = (state: { trainingPlans: TrainingPlanState }) => state.trainingPlans.isLoading;
export const selectTrainingPlansCreating = (state: { trainingPlans: TrainingPlanState }) => state.trainingPlans.isCreating;
export const selectTrainingPlansUpdating = (state: { trainingPlans: TrainingPlanState }) => state.trainingPlans.isUpdating;
export const selectTrainingPlansDeleting = (state: { trainingPlans: TrainingPlanState }) => state.trainingPlans.isDeleting;
export const selectTrainingPlansError = (state: { trainingPlans: TrainingPlanState }) => state.trainingPlans.error;
export const selectTrainingPlansFilters = (state: { trainingPlans: TrainingPlanState }) => state.trainingPlans.filters;

// Selector derivado para planes activos
export const selectActivePlansCount = (state: { trainingPlans: TrainingPlanState }) =>
    state.trainingPlans.plans.filter(plan => plan.is_active).length;

// Selector derivado para indicar si hay operación en progreso
export const selectTrainingPlansAnyLoading = (state: { trainingPlans: TrainingPlanState }) =>
    state.trainingPlans.isLoading || state.trainingPlans.isCreating || state.trainingPlans.isUpdating || state.trainingPlans.isDeleting;

// Exportar reducer
export default trainingPlansSlice.reducer;