/**
 * API de gestión de clientes usando RTK Query
 * Define endpoints CRUD: getClients, createClient, updateClient, deleteClient
 * Integrado con sistema RBAC (trainers solo sus propios clientes)
 * 
 * @author Frontend Team
 * @since v2.1.0
 * @updated v2.6.0 - Corregido schema de getClientStats según backend real
 */

import { baseApi } from "./baseApi";
import type {
    Client,
    ClientsListResponse,
    CreateClientData,
    UpdateClientData,
    ClientFilters,
} from "../types/client";
import type { ClientStatsResponse } from "../types/clientStats";

export const clientsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Obtener lista de clientes con filtros y paginación
        getClients: builder.query<ClientsListResponse, { filters?: ClientFilters; page?: number; per_page?: number }>({
            query: ({ filters = {}, page = 1, per_page = 10 }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('page_size', per_page.toString());
                
                // Agregar filtros existentes
                if (filters.objetivo) params.append('objetivo', filters.objetivo);
                if (filters.nivel_experiencia) params.append('nivel_experiencia', filters.nivel_experiencia);
                if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
                if (filters.search) params.append('search', filters.search);

                // Filtros avanzados
                if (filters.age_min !== undefined) params.append('age_min', filters.age_min.toString());
                if (filters.age_max !== undefined) params.append('age_max', filters.age_max.toString());
                if (filters.gender) params.append('gender', filters.gender);
                if (filters.sort_by) params.append('sort_by', filters.sort_by);
                if (filters.sort_order) params.append('sort_order', filters.sort_order);

                return {
                    url: `/clients/search?${params.toString()}`,
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

        // Obtener cliente específico por ID
        getClient: builder.query<Client, number>({
            query: (id) => ({
                url: `/clients/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Client", id }],
        }),

        // Crear nuevo cliente
        createClient: builder.mutation<Client, CreateClientData>({
            query: (clientData) => ({
                url: "/clients/",
                method: "POST",
                body: clientData,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [
                { type: "Client", id: "LIST" },
                { type: "Client", id: "STATS" }, // ← Invalidar stats al crear
            ],
        }),

        // Actualizar cliente existente
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
                { type: "Client", id: "STATS" }, // ← Invalidar stats al actualizar
            ],
        }),

        // Eliminar cliente
        deleteClient: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/clients/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Client", id },
                { type: "Client", id: "LIST" },
                { type: "Client", id: "STATS" }, // ← Invalidar stats al eliminar
            ],
        }),

        // Obtener estadísticas de clientes (schema corregido según backend real)
        getClientStats: builder.query<ClientStatsResponse, void>({
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