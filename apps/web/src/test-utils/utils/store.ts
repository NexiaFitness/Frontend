/**
 * Test Store Utility
 *
 * Crea un Redux store específico para testing.
 * Reutiliza los reducers reales del proyecto (auth, clients, baseApi),
 * y permite inyectar un preloadedState para casos de test.
 *
 * @since v1.0.0
 */

import { configureStore } from "@reduxjs/toolkit"
import { baseApi } from "@shared/api/baseApi"
import authReducer from "@shared/store/authSlice"
import clientsReducer from "@shared/store/clientsSlice"
import type { RootState, AppDispatch } from "@shared/store"

export const createTestStore = (preloadedState?: Partial<RootState>) =>
    configureStore({
        reducer: {
            auth: authReducer,
            clients: clientsReducer,
            [baseApi.reducerPath]: baseApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(baseApi.middleware),
        preloadedState: preloadedState as RootState, // tipado seguro
    })

export type TestStore = ReturnType<typeof createTestStore>
export type TestDispatch = AppDispatch
