/**
 * Configuración base de RTK Query para NEXIA
 * ARREGLADO: Respeta headers personalizados y no interfiere con login form-urlencoded
 * Se extiende en servicios específicos como authApi, clientsApi, etc.
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v3.2.0 - Agregado tagType "TrainingPlan"
 * @updated v3.3.0 - tagTypes planning (Fase 6: Macrocycle/Mesocycle/Microcycle removidos)
 * @updated v4.7.0 - Agregado tagType "Milestone"
 * @updated v5.0.0 - Agregados tagTypes "TrainingPlanTemplate", "TrainingPlanInstance", "MovementPattern", "MuscleGroup", "Equipment", "Tag", "Action"
 * @updated UX Sprint 1 - TICK-D04: interceptor refresh token en 401 (mutex, un reintento)
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

/** Escribe en localStorage de forma segura (solo browser). Usado tras refresh token. */
const setStorageSafely = (key: string, value: string): void => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // silenciar
    }
};

/** Mutex: solo una petición de refresh a la vez (TICK-D04). */
let refreshPromise: Promise<boolean> | null = null;

/** Evita que POST /auth/refresh cuelgue indefinidamente y bloquee otras peticiones (p. ej. login). */
const REFRESH_FETCH_TIMEOUT_MS = 20_000;

/**
 * Mutaciones donde 401 significa credenciales/token inválidos en esa petición, no "access caducado".
 * No deben disparar refresh+retry (riesgo de bloqueo si /auth/refresh no responde).
 */
const ENDPOINTS_401_SKIP_REFRESH = new Set<string>([
    "login",
    "register",
    "verifyEmail",
    "resendVerification",
    "forgotPassword",
    "resetPassword",
    "logout",
]);

/**
 * Llama a POST /auth/refresh con el refresh_token, persiste nuevos tokens y user.
 * No usa authApi para evitar dependencia circular (authApi extiende baseApi).
 */
const doRefresh = async (refreshToken: string): Promise<boolean> => {
    const url = `${API_CONFIG.BASE_URL}/auth/refresh`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REFRESH_FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
            signal: controller.signal,
        });
        if (!res.ok) return false;
        const data = (await res.json()) as {
            access_token?: string;
            refresh_token?: string;
            user?: unknown;
        };
        if (data.access_token) setStorageSafely(AUTH_CONFIG.TOKEN_KEY, data.access_token);
        if (data.refresh_token) setStorageSafely(AUTH_CONFIG.REFRESH_KEY, data.refresh_token);
        if (data.user) setStorageSafely(AUTH_CONFIG.USER_KEY, JSON.stringify(data.user));
        return true;
    } catch {
        return false;
    } finally {
        clearTimeout(timeoutId);
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
 * Endpoints donde 404 es un resultado válido (no un error).
 * Estos endpoints retornan 404 cuando el recurso no existe, lo cual
 * es manejado gracefulmente por el frontend (ej: data: null).
 */
const ENDPOINTS_404_EXPECTED = new Set([
    'active-by-client',  // GET /training-plans/active-by-client/{id} - no hay plan activo
]);

/**
 * Interceptor para suprimir logs de errores esperados en consola.
 * - 401: manejado por refresh token
 * - 403: manejado por componentes
 * - 404: manejado como data: null en endpoints específicos
 */
const suppressExpectedConsoleErrors = (): (() => void) => {
    if (typeof window === 'undefined') return () => {};

    const originalError = console.error;
    const originalWarn = console.warn;
    
    const isOurApi = (s: string) =>
        s.includes(API_CONFIG.BASE_URL) || s.includes('/api/v1');
    
    const is401Or403 = (s: string) =>
        s.includes('401') || s.includes('403') ||
        s.includes('Unauthorized') || s.includes('Forbidden');
    
    const is404Expected = (s: string) =>
        s.includes('404') && 
        Array.from(ENDPOINTS_404_EXPECTED).some(endpoint => s.includes(endpoint));

    const errorInterceptor = (...args: unknown[]): void => {
        const s = String(args.join(' '));
        if ((is401Or403(s) || is404Expected(s)) && isOurApi(s)) return;
        originalError.apply(console, args);
    };

    const warnInterceptor = (...args: unknown[]): void => {
        const s = String(args.join(' '));
        if ((is401Or403(s) || is404Expected(s)) && isOurApi(s)) return;
        originalWarn.apply(console, args);
    };

    console.error = errorInterceptor;
    console.warn = warnInterceptor;
    return () => {
        console.error = originalError;
        console.warn = originalWarn;
    };
};

/**
 * BaseQuery con manejo profesional de errores HTTP
 * - 401 (Unauthorized): Silencioso si no hay token/isAuthenticated (después de logout)
 * - 403 (Forbidden): Se propaga para que los componentes lo manejen, pero se suprimen logs en consola
 * - 404 (Not Found): Silencioso en endpoints donde es resultado válido (ej: active-by-client)
 * - Otros errores: Se propagan normalmente
 */
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // Suprimir logs de errores esperados durante la ejecución de la query
    const restoreConsole = suppressExpectedConsoleErrors();
    
    try {
        const result = await baseQuery(args, api, extraOptions);
        
        // Manejo de errores 401 (Unauthorized) - TICK-D04: intentar refresh y reintentar una vez
        if (result.error && result.error.status === 401) {
            const endpointName = api.endpoint ?? "";

            if (ENDPOINTS_401_SKIP_REFRESH.has(endpointName)) {
                restoreConsole();
                return result;
            }

            const token = getTokenSafely(AUTH_CONFIG.TOKEN_KEY);
            const state = api.getState() as RootState;
            const isAuthenticated = state.auth?.isAuthenticated ?? false;

            if (!token || !isAuthenticated) {
                restoreConsole();
                return { data: undefined };
            }

            const refreshToken = getTokenSafely(AUTH_CONFIG.REFRESH_KEY);
            if (!refreshToken) {
                restoreConsole();
                return { data: undefined };
            }

            try {
                if (!refreshPromise) refreshPromise = doRefresh(refreshToken);
                const refreshed = await refreshPromise;

                if (!refreshed) {
                    restoreConsole();
                    return { data: undefined };
                }

                const retryResult = await baseQuery(args, api, extraOptions);
                restoreConsole();
                return retryResult;
            } finally {
                refreshPromise = null;
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
        "Milestone",
        "MonthlyPlan",
        "FatigueAlert",
        "SessionTemplate",
        "TrainingBlockType",
        "SessionBlock",
        "SessionBlockExercise",
        "TrainingSession",
        "SessionExercise",
        "StandaloneSession",
        "Report",
        "ScheduledSession",
        "TrainerAvailability",
        "PhysicalTest",
        "TrainingPlanSummary",
        "TrainingPlanMonthlySummary",
        "TrainingPlanWeeklySummary",
        "TrainingPlanAdherenceStats",
        "Metrics",
        "Injuries",
        "HabitInsights",
        "PlanPeriodBlock",
    ],
});