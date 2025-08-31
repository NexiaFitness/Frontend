/**
 * Store global de Redux para NEXIA
 * Configura Redux Toolkit + RTK Query
 * Conecta los módulos de API (authApi, etc.)
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@shared/api/baseApi";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
    reducer: {
        // Solo un reducer de RTK Query (baseApi)
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

// Tipos de apoyo para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Habilita re-fetch automático en eventos como reconexión a red o cambio de pestaña
setupListeners(store.dispatch);
