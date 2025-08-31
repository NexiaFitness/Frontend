/**
 * Configuración base de RTK Query para NEXIA
 * Centraliza la configuración de API: baseUrl, headers y reintentos
 * Se extiende en servicios específicos como authApi, clientsApi, etc.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG, AUTH_CONFIG } from "@shared/config/constants";

// BaseQuery personalizado para añadir token automáticamente
const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers: Headers) => {
        const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

// API base que luego será extendida por cada módulo (auth, clients, etc.)
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery,
    endpoints: () => ({}), // los endpoints se añaden en archivos específicos
    tagTypes: ["Auth", "User", "Client", "Trainer", "Exercise"],
});
