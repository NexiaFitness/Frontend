/**
 * exerciseCatalogRead.ts — Tipos de las lecturas del catálogo sin tope (PERF-7).
 *
 * Contexto: filtros de GET /exercises/, fila ligera del selector (`view=picker`) y
 * GET /exercises/lookup (nombres por ids, estén o no activos). Copiados del OpenAPI del
 * backend (schemas ExercisePickerOut, ExercisePickerListResponse, ExerciseLookupOut,
 * ExerciseLookupResponse).
 * Notas de mantenimiento: lookup solo resuelve nombres de contenido ya guardado. Nunca
 * alimenta una lista para elegir ejercicios: esa usa el listado, que oculta los inactivos.
 *
 * @author Frontend Team
 * @since v6.2.0
 */

import type { ExerciseContractFilter } from "./exerciseContract";

/** `equipment_filter_applied` de GET /exercises/ (ambas vistas). */
export type EquipmentFilterApplied = "none" | "not_configured" | "active" | "no_matches";

/** Query params de filtro de GET /exercises/ (sin paginación ni `view`). */
export interface ExerciseListQueryFilters {
    tipo?: string;
    nivel?: string;
    equipo?: string;
    patron_movimiento?: string;
    tipo_carga?: string;
    search?: string;
    /** Filtro por IDs de grupo muscular (usa mapping tables, mas preciso que search) */
    muscle_group_ids?: number[];
    /** Filtro por IDs de equipamiento (usa mapping tables) */
    equipment_ids?: number[];
    /** Filtro por IDs de patrón de movimiento (Exercise Catalog) */
    movement_pattern_ids?: number[];
    /** Rol del patrón al filtrar: primary (default UI), secondary, any */
    movement_pattern_role?: "primary" | "secondary" | "any";
    /** Filtra ejercicios compatibles con el equipamiento del cliente */
    client_id?: number;
    /** Por defecto el backend usa `all`; el selector que añade ejercicios pide `complete`. */
    contract?: ExerciseContractFilter;
}

/** Fila de GET /exercises/?view=picker. */
export interface ExercisePickerOut {
    id: number;
    nombre: string;
    nombre_ingles?: string | null;
}

/** Respuesta de GET /exercises/?view=picker. */
export interface ExercisePickerListResponse {
    view?: "picker";
    exercises: ExercisePickerOut[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
    equipment_filter_applied?: EquipmentFilterApplied;
}

/** Ejercicio referenciado por id (GET /exercises/lookup), activo o no. */
export interface ExerciseLookupOut extends ExercisePickerOut {
    is_active: boolean;
}

/** Respuesta de GET /exercises/lookup: ids existentes, ordenados por id. */
export interface ExerciseLookupResponse {
    exercises: ExerciseLookupOut[];
}

/** Una página de GET /exercises/, en cualquier vista. */
export interface ExerciseCatalogPage<T> {
    exercises: T[];
    has_more: boolean;
    equipment_filter_applied?: EquipmentFilterApplied;
}

/** Catálogo completo: todas las páginas hasta `has_more=false`, sin duplicados. */
export interface ExerciseCatalogAll<T> {
    exercises: T[];
    equipment_filter_applied: EquipmentFilterApplied;
}
