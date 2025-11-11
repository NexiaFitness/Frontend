/**
 * Configuración base de RTK Query para NEXIA
 * ARREGLADO: Respeta headers personalizados y no interfiere con login form-urlencoded
 * Se extiende en servicios específicos como authApi, clientsApi, etc.
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v3.2.0 - Agregado tagType "TrainingPlan"
 * @updated v3.3.0 - Agregados tagTypes "Macrocycle", "Mesocycle", "Microcycle"
 * @updated v4.7.0 - Agregado tagType "Milestone"
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { API_CONFIG, AUTH_CONFIG } from "@nexia/shared/config/constants";

/**
 * Helper síncrono para leer token de localStorage de forma segura.
 * Compatible con SSR y entornos donde localStorage puede no estar disponible.
 * 
 * @param key - Clave del token en localStorage
 * @returns Token o null si no está disponible
 */
const getTokenSafely = (key: string): string | null => {
    // Verificar que estamos en entorno browser (no SSR)
    if (typeof window === 'undefined') {
        return null;
    }
    
    // Verificar que localStorage está disponible
    if (typeof window.localStorage === 'undefined') {
        return null;
    }
    
    try {
        return window.localStorage.getItem(key);
    } catch (error) {
        // localStorage puede fallar en modo privado, bloqueado por política, etc.
        // En producción, no loguear para evitar ruido en consola
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[baseApi] Failed to read token from localStorage:', error);
        }
        return null;
    }
};

// BaseQuery personalizado que respeta headers personalizados
const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
        // Solo añadir Authorization si NO es login (login no necesita token)
        if (endpoint !== 'login') {
            const token = getTokenSafely(AUTH_CONFIG.TOKEN_KEY);
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
        }
        
        // NO sobreescribir Content-Type si ya está establecido por el endpoint
        // Esto permite que authApi.ts establezca application/x-www-form-urlencoded
        return headers;
    },
});

// BaseQuery con manejo de errores 401 (silencioso después de logout)
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Si hay error 401 y no hay token, es probable que sea después de logout
    // En ese caso, retornar un resultado "silencioso" para evitar errores en consola
    if (result.error && result.error.status === 401) {
        const token = getTokenSafely(AUTH_CONFIG.TOKEN_KEY);
        if (!token) {
            // No hay token, probablemente después de logout - retornar resultado "silencioso"
            return { data: undefined };
        }
    }
    
    return result;
};

// API base que luego será extendida por cada módulo (auth, clients, etc.)
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}), // los endpoints se añaden en archivos específicos
    tagTypes: ["Auth", "User", "Client", "Trainer", "Exercise", "TrainingPlan", "Macrocycle", "Mesocycle", "Microcycle", "Milestone"],
});