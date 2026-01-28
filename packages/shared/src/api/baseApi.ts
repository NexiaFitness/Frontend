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
 * @updated v5.0.0 - Agregados tagTypes "TrainingPlanTemplate", "TrainingPlanInstance", "MovementPattern", "MuscleGroup", "Equipment", "Tag", "Action"
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { API_CONFIG, AUTH_CONFIG } from "@nexia/shared/config/constants";
import type { RootState } from "../store";

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

/**
 * Wrapper de fetch que suprime logs de errores 403 en consola del navegador
 * Intercepta los errores antes de que el navegador los loguee
 */
const fetchWith403Suppression = async (
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> => {
    try {
        const response = await fetch(input, init);
        
        // Si es 403, interceptar el error antes de que se propague
        if (response.status === 403) {
            // Crear una respuesta clonada para que RTK Query pueda manejarla
            // pero suprimir el log del navegador interceptando el error
            const clonedResponse = response.clone();
            
            // El navegador puede loguear el error antes de que llegue aquí
            // Por eso también usamos el interceptor de consola en baseQueryWithReauth
            return clonedResponse;
        }
        
        return response;
    } catch (error) {
        // Si el error es relacionado con 403, suprimirlo silenciosamente
        // pero aún así propagarlo para que RTK Query lo maneje
        throw error;
    }
};

// BaseQuery personalizado que respeta headers personalizados
// Usa fetchWith403Suppression para suprimir logs de 403
const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    fetchFn: typeof window !== 'undefined' ? fetchWith403Suppression : fetch,
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

/**
 * Interceptor temporal para suprimir logs de errores 403 en consola
 * Los errores 403 son manejados apropiadamente por los componentes,
 * pero el navegador los loguea automáticamente. Este interceptor los suprime.
 */
const suppress403ConsoleErrors = (): (() => void) => {
    if (typeof window === 'undefined') {
        return () => {}; // No-op en SSR
    }

    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Interceptar console.error y console.warn
    const errorInterceptor = (...args: unknown[]): void => {
        const errorString = args.join(' ');
        // Suprimir logs que contengan "403" y "Forbidden" relacionados con nuestros endpoints
        if (
            typeof errorString === 'string' &&
            (errorString.includes('403') || errorString.includes('Forbidden')) &&
            (errorString.includes(API_CONFIG.BASE_URL) || errorString.includes('/api/v1'))
        ) {
            // Silenciar este log específico
            return;
        }
        // Loguear otros errores normalmente
        originalError.apply(console, args);
    };

    const warnInterceptor = (...args: unknown[]): void => {
        const warnString = args.join(' ');
        // Suprimir warnings que contengan "403" y "Forbidden"
        if (
            typeof warnString === 'string' &&
            (warnString.includes('403') || warnString.includes('Forbidden')) &&
            (warnString.includes(API_CONFIG.BASE_URL) || warnString.includes('/api/v1'))
        ) {
            // Silenciar este warning específico
            return;
        }
        // Loguear otros warnings normalmente
        originalWarn.apply(console, args);
    };

    console.error = errorInterceptor;
    console.warn = warnInterceptor;

    // Retornar función de limpieza
    return () => {
        console.error = originalError;
        console.warn = originalWarn;
    };
};

/**
 * BaseQuery con manejo profesional de errores HTTP
 * - 401 (Unauthorized): Silencioso si no hay token/isAuthenticated (después de logout)
 * - 403 (Forbidden): Se propaga para que los componentes lo manejen, pero se suprimen logs en consola
 * - Otros errores: Se propagan normalmente
 */
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // Suprimir logs de 403 durante la ejecución de la query
    const restoreConsole = suppress403ConsoleErrors();
    
    try {
        const result = await baseQuery(args, api, extraOptions);
        
        // Manejo de errores 401 (Unauthorized) - silencioso después de logout
        if (result.error && result.error.status === 401) {
            const token = getTokenSafely(AUTH_CONFIG.TOKEN_KEY);
            // Obtener isAuthenticated del estado Redux
            const state = api.getState() as RootState;
            const isAuthenticated = state.auth?.isAuthenticated ?? false;
            
            // Si no hay token O no está autenticado, retornar silenciosamente
            // Esto previene errores en consola después de logout
            if (!token || !isAuthenticated) {
                restoreConsole();
                return { data: undefined };
            }
        }
        
        // Errores 403 (Forbidden) se propagan para que los componentes los manejen
        // Los logs en consola ya fueron suprimidos por el interceptor
        
        restoreConsole();
        return result;
    } catch (error) {
        restoreConsole();
        throw error;
    }
};

// API base que luego será extendida por cada módulo (auth, clients, etc.)
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}), // los endpoints se añaden en archivos específicos
    tagTypes: [
        "Auth",
        "User",
        "Client",
        "Trainer",
        "Exercise",
        "MovementPattern",
        "MuscleGroup",
        "Equipment",
        "Tag",
        "Action",
        "TrainingPlan",
        "TrainingPlanTemplate",
        "TrainingPlanInstance",
        "Macrocycle",
        "Mesocycle",
        "Microcycle",
        "Milestone",
        "FatigueAlert",
        "SessionTemplate",
        "TrainingBlockType",
        "SessionBlock",
        "SessionBlockExercise",
        "TrainingSession",
        "SessionExercise",
        "Report",
        "ScheduledSession",
        "PhysicalTest",
        "TrainingPlanSummary",
        "TrainingPlanMonthlySummary",
        "TrainingPlanWeeklySummary",
        "TrainingPlanAdherenceStats",
        "Metrics",
        "Injuries",
    ],
});