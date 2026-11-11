/**
 * index.ts — Lógica pura del catálogo admin (validación, técnica, cola, revisión masiva,
 * vista previa y errores de la API), reexportada desde el índice de @nexia/shared.
 *
 * Contexto: H10. El índice general supera 600 líneas y no puede crecer (agent.md §7.1);
 * agrupar aquí el dominio del catálogo lo deja más corto que antes.
 *
 * @author Frontend Team
 * @since v6.1.0
 */

export * from "./validateCatalogBundle";
export * from "./catalogTechnique";
export * from "./catalogQueue";
export * from "./catalogBulkReview";
export * from "./catalogPreview";
export * from "./parseCatalogApiError";
