/**
 * Test Store Utility
 * 
 * Crea Redux stores específicos para testing con configuración limpia.
 * Reutiliza reducers reales pero con middleware optimizado para tests.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@nexia/shared/api/baseApi";
import authReducer from "@nexia/shared/store/authSlice";
import clientsReducer from "@nexia/shared/store/clientsSlice";
import type { RootState, AppDispatch } from "@nexia/shared/store";

export const createTestStore = (preloadedState?: Partial<RootState>) =>
    configureStore({
        reducer: {
            auth: authReducer,
            clients: clientsReducer,
            [baseApi.reducerPath]: baseApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [baseApi.util.resetApiState.type],
                },
            }).concat(baseApi.middleware),
        preloadedState: preloadedState as RootState,
        devTools: false, // Deshabilitado en tests
    });

// Helper para limpiar estado API entre tests
export const resetApiState = (store: TestStore) => {
    store.dispatch(baseApi.util.resetApiState());
};

export type TestStore = ReturnType<typeof createTestStore>;
export type TestDispatch = AppDispatch;