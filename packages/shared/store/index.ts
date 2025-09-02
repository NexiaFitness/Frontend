/**
 * Store global de Redux para NEXIA
 * Configura Redux Toolkit + RTK Query + authSlice
 * Conecta los módulos de API (authApi, etc.) y estado local
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@shared/api/baseApi";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./authSlice";

export const store = configureStore({
    reducer: {
        // RTK Query API slice
        [baseApi.reducerPath]: baseApi.reducer,
        // Auth state slice
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

// Tipos de apoyo para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Habilita re-fetch automático en eventos como reconexión a red o cambio de pestaña
setupListeners(store.dispatch);