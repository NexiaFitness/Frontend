/**
 * Redux slice para estado de autenticación
 * Maneja usuario logueado, tokens y errores
 * Trabaja junto con authApi (RTK Query) para llamadas a servidor
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@shared/types/auth";
import { AUTH_CONFIG } from "@shared/config/constants";

// Estado inicial
const initialState: AuthState = {
    user: null,
    token: localStorage.getItem(AUTH_CONFIG.TOKEN_KEY),
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Slice de Redux
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Acción cuando login es exitoso
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
            
            // Guardar token en localStorage
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, action.payload.token);
        },

        // Acción cuando login falla
        loginFailure: (state, action: PayloadAction<string>) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = action.payload;
            
            // Limpiar localStorage
            localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        },

        // Acción cuando logout
        logout: (state) => {
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
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Acción para establecer usuario actual (cuando app inicia y hay token)
        setCurrentUser: (state, action: PayloadAction<User>) => {
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

// Selector helpers
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

// Exportar reducer
export default authSlice.reducer;