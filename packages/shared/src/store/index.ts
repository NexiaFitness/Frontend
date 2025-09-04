/**
 * Store global de Redux para NEXIA
 * Configura Redux Toolkit + RTK Query + authSlice
 * 
 * @author Frontend
 * @since v1.0.0
 */

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "@shared/api/baseApi";
import authReducer from "./authSlice";

// Configuración de store
export const store = configureStore({
    reducer: {
        auth: authReducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

// Tipos de apoyo para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Listeners de RTK Query (re-fetch automático)
setupListeners(store.dispatch);
