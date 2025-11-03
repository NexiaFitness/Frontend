/**
 * Configuración base de RTK Query para NEXIA
 * ARREGLADO: Respeta headers personalizados y no interfiere con login form-urlencoded
 * Se extiende en servicios específicos como authApi, clientsApi, etc.
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v3.2.0 - Agregado tagType "TrainingPlan"
 * @updated v3.3.0 - Agregados tagTypes "Macrocycle", "Mesocycle", "Microcycle"
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG, AUTH_CONFIG } from "@nexia/shared/config/constants";

// BaseQuery personalizado que respeta headers personalizados
const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
        // Solo añadir Authorization si NO es login (login no necesita token)
        if (endpoint !== 'login') {
            const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
        }
        
        // NO sobreescribir Content-Type si ya está establecido por el endpoint
        // Esto permite que authApi.ts establezca application/x-www-form-urlencoded
        return headers;
    },
});

// API base que luego será extendida por cada módulo (auth, clients, etc.)
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery,
    endpoints: () => ({}), // los endpoints se añaden en archivos específicos
    tagTypes: ["Auth", "User", "Client", "Trainer", "Exercise", "TrainingPlan", "Macrocycle", "Mesocycle", "Microcycle"],
});