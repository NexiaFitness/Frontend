/**
 * Redux slice para el estado de autenticación.
 * Gestiona usuario, token, loading y errores de login.
 * Se integra con authApi (RTK Query) para comunicación con el backend.
 *
 * @author Frontend
 * @since v1.0.0
 */

import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { AuthState, User } from "@shared/types/auth";
import { AUTH_CONFIG } from "@shared/config/constants";

// Estado inicial tipado
const initialState: AuthState = {
    user: null,
    token: localStorage.getItem(AUTH_CONFIG.TOKEN_KEY),
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

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

        // Acción cuando logout
        logout: (state: AuthState) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;

            // Limpiar localStorage
            localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        },

        // Acción para limpiar errores
        clearError: (state) => {
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
});

// Exportar acciones
export const {
    loginSuccess,
    loginFailure,
    logout,
    clearError,
    setLoading,
    setCurrentUser,
} = authSlice.actions;

// Selectores tipados
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
    state.auth.isAuthenticated;

// Exportar reducer
export default authSlice.reducer;