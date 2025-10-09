/**
 * Redux slice para el estado de autenticación.
 * Gestiona usuario, token, loading y errores de login.
 * Se integra con authApi (RTK Query) para comunicación con el backend.
 * Implementa logout profesional con createAsyncThunk.
 *
 * @author Frontend
 * @since v1.0.0
 */

import { createSlice, PayloadAction, Slice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthState, User } from "@nexia/shared/types/auth";
import { AUTH_CONFIG } from "@nexia/shared/config/constants";

// Estado inicial tipado
const initialState: AuthState = {
    user: null,
    token: localStorage.getItem(AUTH_CONFIG.TOKEN_KEY),
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async thunk para logout profesional
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            // Limpieza inmediata de localStorage
            localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
            
            // Simular delay para UX profesional (opcional)
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return null;
        } catch (error) {
            return rejectWithValue('Error during logout process');
        }
    }
);

// Slice de Redux tipado correctamente
export const authSlice: Slice<AuthState> = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Acción cuando login es exitoso
        loginSuccess: (
            state: AuthState,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;

            // Guardar token en localStorage
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, action.payload.token);
        },

        // Acción cuando registro es exitoso (autologin)
        registerSuccess: (
            state: AuthState,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;

            // Guardar token en localStorage
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, action.payload.token);
        },

        // Acción cuando login falla
        loginFailure: (state: AuthState, action: PayloadAction<string>) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = action.payload;

            // Limpiar localStorage
            localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        },

        // Acción cuando logout - removido, ahora manejado por createAsyncThunk
        // logout: ya no es un reducer, sino un async thunk

        // Acción para limpiar errores
        clearError: (state: AuthState) => {
            state.error = null;
        },

        // Acción para indicar loading
        setLoading: (state: AuthState, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Acción para establecer usuario actual (ej. al iniciar app con token existente)
        setCurrentUser: (state: AuthState, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Logout async thunk handlers
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                // Limpiar todo el estado de autenticación
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Logout failed';
                // Aún así, limpiar las credenciales por seguridad
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

// Exportar acciones sincrónicas del slice
export const {
    loginSuccess,
    loginFailure,
    clearError,
    setLoading,
    setCurrentUser,
} = authSlice.actions;

// logout se exporta por separado como async thunk (ya exportado arriba)

// Selectores tipados
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
    state.auth.isAuthenticated;

// Exportar reducer
export default authSlice.reducer;