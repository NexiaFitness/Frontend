/**
 * Store global de Redux para NEXIA
 * Configura Redux Toolkit + RTK Query + authSlice + clientsSlice
 * ACTUALIZADO: Integrado clientsSlice para gestión de clientes
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v2.1.0 - Added clientsSlice integration
 */

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "@shared/api/baseApi";
import authReducer from "./authSlice";
import clientsReducer from "./clientsSlice";

// Configuración de store
export const store = configureStore({
    reducer: {
        auth: authReducer,
        clients: clientsReducer,
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