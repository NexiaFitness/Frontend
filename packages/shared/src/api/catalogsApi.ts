/**
 * catalogsApi.ts - RTK Query para catálogos estáticos del backend
 *
 * Propósito: Endpoints GET de países, ciudades, ocupaciones, modalidades y especialidades de entrenador.
 * Contexto: Backend /api/v1/catalogs/* (require auth). Usado por CompleteProfile y formularios trainer.
 * Mantenimiento: Añadir endpoints aquí cuando el backend exponga nuevos catálogos.
 *
 * @author Frontend Team
 * @since v6.2.0 - Ola 1 API Layer
 */

import { baseApi } from "./baseApi";
import type { CatalogCountry, CatalogCitiesResponse } from "../types/catalogs";
import type { PhysicalQuality } from "../types/planningCargas";

export const catalogsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPhysicalQualities: builder.query<PhysicalQuality[], void>({
            query: () => ({
                url: "/catalogs/physical-qualities",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        getCountries: builder.query<CatalogCountry[], void>({
            query: () => ({
                url: "/catalogs/countries",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        getCities: builder.query<CatalogCitiesResponse, string>({
            query: (country) => ({
                url: `/catalogs/cities?country=${encodeURIComponent(country)}`,
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        getTrainerOccupations: builder.query<string[], void>({
            query: () => ({
                url: "/catalogs/trainer/occupations",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        getTrainingModalities: builder.query<string[], void>({
            query: () => ({
                url: "/catalogs/trainer/modalities",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        getTrainerSpecialties: builder.query<string[], void>({
            query: () => ({
                url: "/catalogs/trainer/specialties",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetPhysicalQualitiesQuery,
    useGetCountriesQuery,
    useGetCitiesQuery,
    useGetTrainerOccupationsQuery,
    useGetTrainingModalitiesQuery,
    useGetTrainerSpecialtiesQuery,
} = catalogsApi;
