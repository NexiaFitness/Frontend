/**
 * API de gestión de clientes usando RTK Query
 * Define endpoints CRUD: getClients, createClient, updateClient, deleteClient
 * Integrado con sistema RBAC (trainers solo sus propios clientes)
 * 
 * @author Frontend Team
 * @since v2.1.0
 */

import { baseApi } from "./baseApi";
import type {
    Client,
    ClientsListResponse,
    CreateClientData,
    UpdateClientData,
    ClientFilters,
} from "../types/client";

export const clientsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Obtener lista de clientes con filtros y paginación
        getClients: builder.query<ClientsListResponse, { filters?: ClientFilters; page?: number; per_page?: number }>({
            query: ({ filters = {}, page = 1, per_page = 10 }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('per_page', per_page.toString());
                
                // Agregar filtros si existen
                if (filters.objetivo) params.append('objetivo', filters.objetivo);
                if (filters.nivel_experiencia) params.append('nivel_experiencia', filters.nivel_experiencia);
                if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
                if (filters.search) params.append('search', filters.search);

                return {
                    url: `/clients/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.clients
                    ? [
                        ...result.clients.map(({ id }) => ({ type: "Client" as const, id })),
                        { type: "Client", id: "LIST" },
                    ]
                    : [{ type: "Client", id: "LIST" }],
        }),

        // Obtener cliente específico por ID - devuelve Client directo
        getClient: builder.query<Client, number>({
            query: (id) => ({
                url: `/clients/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Client", id }],
        }),

        // Crear nuevo cliente - devuelve Client directo
        createClient: builder.mutation<Client, CreateClientData>({
            query: (clientData) => ({
                url: "/clients/",
                method: "POST",
                body: clientData,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [{ type: "Client", id: "LIST" }],
        }),

        // Actualizar cliente existente - devuelve Client directo
        updateClient: builder.mutation<Client, { id: number; data: UpdateClientData }>({
            query: ({ id, data }) => ({
                url: `/clients/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Client", id },
                { type: "Client", id: "LIST" },
            ],
        }),

        // Eliminar cliente - devuelve mensaje de confirmación
        deleteClient: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/clients/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Client", id },
                { type: "Client", id: "LIST" },
            ],
        }),

        // Obtener estadísticas de clientes (para dashboard)
        getClientStats: builder.query<{ total: number; active: number; inactive: number }, void>({
            query: () => ({
                url: "/clients/stats",
                method: "GET",
            }),
            providesTags: [{ type: "Client", id: "STATS" }],
        }),
    }),
    overrideExisting: false,
});

// Hooks auto-generados por RTK Query
export const {
    useGetClientsQuery,
    useGetClientQuery,
    useCreateClientMutation,
    useUpdateClientMutation,
    useDeleteClientMutation,
    useGetClientStatsQuery,
} = clientsApi;