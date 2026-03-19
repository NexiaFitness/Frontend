/**
 * catalogs.ts - Tipos para catálogos estáticos (países, ciudades, ocupaciones, etc.)
 *
 * Propósito: Tipar respuestas de GET /api/v1/catalogs/* para CompleteProfile y otros formularios.
 * Contexto: Backend devuelve listas estáticas; pueden migrarse a DB sin cambiar contrato.
 * Mantenimiento: Añadir campos solo si el backend los expone.
 *
 * @author Frontend Team
 * @since v6.2.0 - Ola 1 API Layer
 */

/** País: código ISO y nombre. Backend: GET /catalogs/countries */
export interface CatalogCountry {
    code: string;
    name: string;
}

/** Ciudades por país. Backend: GET /catalogs/cities?country= */
export interface CatalogCitiesResponse {
    country: string;
    cities: string[];
}
