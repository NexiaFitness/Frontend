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
import { storage } from '@nexia/shared/storage/IStorage';
import { authApi } from '@nexia/shared/api/authApi';
import { baseApi } from '@nexia/shared/api/baseApi';

/**
 * Carga estado inicial desde storage de forma async.
 * NOTA: Como esto se ejecuta síncronamente al importar el módulo,
 * usamos valores por defecto y luego hidratamos via middleware.
 */
const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // True hasta que hidratación complete
    error: null,
};

/**
 * Async thunk para hidratar estado desde storage al iniciar app.
 */
export const hydrateAuth = createAsyncThunk(
    'auth/hydrate',
    async (_, { rejectWithValue }) => {
        try {
            const token = await storage.getItem(AUTH_CONFIG.TOKEN_KEY);
            const userStr = await storage.getItem(AUTH_CONFIG.USER_KEY);
            
            
            let user: User | null = null;
            if (userStr) {
                try {
                    user = JSON.parse(userStr);
                } catch (parseError) {
                    if (process.env.NODE_ENV !== 'production') {
                        console.error("❌ [hydrateAuth] Parse error:", parseError);
                    }
                    await storage.removeItem(AUTH_CONFIG.USER_KEY);
                }
            }
            
            
            return { user, token };
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error("❌ [hydrateAuth] Hydration failed:", error);
            }
            return rejectWithValue('Hydration failed');
        }
    }
);

// Async thunk para logout profesional
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch, rejectWithValue }) => {
        // Intentar obtener refresh_token del storage
        let refreshToken: string | null = null;
        try {
            refreshToken = await storage.getItem(AUTH_CONFIG.REFRESH_KEY);
        } catch (storageError) {
            // Si falla obtener del storage, continuar con limpieza local
            if (process.env.NODE_ENV !== 'production') {
                console.warn('[logout] Failed to read refresh_token from storage:', storageError);
            }
        }
        
        // ✅ NOTA: resetApiState() ya se ejecutó en useLogout ANTES de disparar este thunk
        // No es necesario ejecutarlo aquí de nuevo
        
        // Si hay refresh_token, intentar llamar al backend para revocarlo
        // El backend requiere refresh_token obligatorio según schema RefreshRequest
        if (refreshToken && typeof refreshToken === 'string' && refreshToken.trim() !== '') {
            try {
                // RTK Query initiate devuelve una promesa directamente
                await dispatch(authApi.endpoints.logout.initiate({ refresh_token: refreshToken }));
            } catch (apiError) {
                // Si falla el logout del backend, continuar con limpieza local por seguridad
                // Esto puede pasar si el token ya está revocado o es inválido
                // No es un error crítico, continuamos con limpieza local
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('[logout] Backend logout failed, proceeding with local cleanup:', apiError);
                }
            }
        }
        
        // Limpieza async de storage (siempre ejecutar, incluso si falla el backend)
        // Esto es lo más importante - garantizar que las credenciales se eliminen localmente
        try {
            await storage.removeItem(AUTH_CONFIG.TOKEN_KEY);
            await storage.removeItem(AUTH_CONFIG.REFRESH_KEY);
            await storage.removeItem(AUTH_CONFIG.USER_KEY);
        } catch (cleanupError) {
            // Si falla la limpieza, esto SÍ es un error crítico
            if (process.env.NODE_ENV !== 'production') {
                console.error('[logout] Critical: Failed to clean storage:', cleanupError);
            }
            return rejectWithValue('Error during storage cleanup');
        }
        
        // Logout exitoso (limpieza local completada)
        return null;
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

            // Persistencia async
            storage.setItem(AUTH_CONFIG.TOKEN_KEY, action.payload.token);
            storage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(action.payload.user));
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

            // Persistencia async
            storage.setItem(AUTH_CONFIG.TOKEN_KEY, action.payload.token);
            storage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(action.payload.user));
        },

        // Acción cuando login falla
        loginFailure: (state: AuthState, action: PayloadAction<string>) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = action.payload;

            // Limpiar storage async
            storage.removeItem(AUTH_CONFIG.TOKEN_KEY);
            storage.removeItem(AUTH_CONFIG.USER_KEY);
        },

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
            // Hydration handlers
                .addCase(hydrateAuth.pending, (state) => {
                    state.isLoading = true;
                })
            .addCase(hydrateAuth.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = !!(action.payload.token && action.payload.user);
                state.isLoading = false;
            })
            .addCase(hydrateAuth.rejected, (state, action) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error("❌ [hydrateAuth.rejected] Hydration rejected:", action.payload);
                }
                state.isLoading = false;
                state.error = 'Failed to restore session';
            })
            // Logout async thunk handlers
            .addCase(logout.pending, (state) => {
                // ✅ CRÍTICO: Actualizar estado SINCÓNICAMENTE para que hooks vean isAuthenticated = false inmediatamente
                // Esto previene que queries se ejecuten durante el logout
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                // Estado ya está limpio en pending, solo actualizar loading
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
    registerSuccess,
    loginFailure,
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