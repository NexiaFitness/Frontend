/**
 * Handlers MSW — importación y exportación Excel del catálogo admin (13 §3.4).
 *
 * Contexto: extraído de `index.ts` cuando pasó de 400 líneas (agent.md §7.1, revisión de
 * Kimi de H8-P). Export, validate (con sus variantes) y confirm. `index.ts` los reexporta
 * y mete los de por defecto en `adminCatalogHandlers`.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { http, HttpResponse } from "msw";

export const exportAdminCatalogHandler = http.get(
    "*/admin/catalog/export",
    async () =>
        new HttpResponse(new Blob(["xlsx"]), {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        })
);

export const validateCatalogImportHandler = http.post(
    "*/admin/catalog/import/validate",
    async () =>
        HttpResponse.json(
            {
                ok_for_import: true,
                violations: [],
                change_summary: {
                    new: ["new_exercise"],
                    new_entries: [
                        {
                            exercise_id: "new_exercise",
                            exercise_name_es: "Ejercicio nuevo QA",
                        },
                    ],
                    updated: [
                        {
                            exercise_id: "squat_back",
                            exercise_name_es: "Sentadilla trasera",
                            fields: ["core.nombre"],
                            changes: [
                                {
                                    field: "core.nombre",
                                    before: "Antes",
                                    after: "Después",
                                },
                            ],
                            was_inactive: false,
                        },
                    ],
                    unchanged_count: 100,
                },
            },
            { status: 200 }
        )
);

export const validateCatalogImportBlockedHandler = http.post(
    "*/admin/catalog/import/validate",
    async () =>
        HttpResponse.json(
            {
                ok_for_import: false,
                violations: [
                    {
                        exercise_id: "squat_back",
                        sheet: "exercises",
                        row: 12,
                        rule: "NO_PM",
                        message: "El ejercicio no tiene prime mover",
                    },
                ],
                change_summary: { new: [], updated: [], unchanged_count: 0 },
            },
            { status: 200 }
        )
);

/** Validate OK sin actualizaciones — no debe mostrar aviso de sobrescritura. */
export const validateCatalogImportNoUpdatesHandler = http.post(
    "*/admin/catalog/import/validate",
    async () =>
        HttpResponse.json(
            {
                ok_for_import: true,
                violations: [],
                change_summary: {
                    new: ["brand_new"],
                    new_entries: [
                        {
                            exercise_id: "brand_new",
                            exercise_name_es: "Marca nueva",
                        },
                    ],
                    updated: [],
                    unchanged_count: 50,
                },
            },
            { status: 200 }
        )
);

/** Cambio de músculos y de un campo simple: como lo envía el backend desde H8-P (QA). */
export const validateCatalogImportMuscleItemsHandler = http.post(
    "*/admin/catalog/import/validate",
    async () =>
        HttpResponse.json(
            {
                ok_for_import: true,
                violations: [],
                change_summary: {
                    new: [],
                    updated: [
                        {
                            exercise_id: "98",
                            exercise_name_es: "Bird dog",
                            fields: ["core.laterality", "muscles"],
                            changes: [
                                {
                                    field: "core.laterality",
                                    before: "Bilateral",
                                    after: "Unilateral",
                                },
                                {
                                    field: "muscles",
                                    before: "",
                                    after: "",
                                    items: [
                                        {
                                            change: "changed",
                                            name: "Erectores espinales",
                                            role: "prime_mover",
                                            attributes: [
                                                { attribute: "priority", before: "0", after: "2" },
                                                { attribute: "evidence_note", before: null, after: null },
                                            ],
                                        },
                                        {
                                            change: "added",
                                            name: "Glúteo mayor",
                                            role: "synergist",
                                            attributes: [],
                                        },
                                    ],
                                },
                            ],
                            was_inactive: false,
                        },
                    ],
                    unchanged_count: 497,
                },
            },
            { status: 200 }
        )
);

/** Excel anterior a H8-P: trae Fuente y Referencia de fuente, que se ignoran. */
export const validateCatalogImportIgnoredColumnsHandler = http.post(
    "*/admin/catalog/import/validate",
    async () =>
        HttpResponse.json(
            {
                ok_for_import: true,
                violations: [],
                change_summary: {
                    new: [],
                    updated: [],
                    unchanged_count: 12,
                    ignored_columns: ["Fuente", "Referencia de fuente"],
                },
            },
            { status: 200 }
        )
);

/** Rechazo 413 FILE_TOO_LARGE (cuerpo upload guard). */
export const validateCatalogImportTooLargeHandler = http.post(
    "*/admin/catalog/import/validate",
    async () =>
        HttpResponse.json(
            {
                detail: {
                    detail: "FILE_TOO_LARGE",
                    errors: [
                        "El fichero supera el máximo permitido (25 MB).",
                    ],
                },
            },
            { status: 413 }
        )
);

/** Rechazo 415 UNSUPPORTED_FILE_TYPE. */
export const validateCatalogImportUnsupportedTypeHandler = http.post(
    "*/admin/catalog/import/validate",
    async () =>
        HttpResponse.json(
            {
                detail: {
                    detail: "UNSUPPORTED_FILE_TYPE",
                    errors: [
                        "El fichero debe ser un Excel .xlsx (exportación de catálogo v2).",
                    ],
                },
            },
            { status: 415 }
        )
);

export const confirmCatalogImportHandler = http.post(
    "*/admin/catalog/import/confirm",
    async () =>
        HttpResponse.json(
            {
                imported_count: 2,
                new_count: 1,
                updated_count: 1,
                exercise_ids: ["squat_back", "new_exercise"],
                change_summary: {
                    new: ["new_exercise"],
                    new_entries: [
                        {
                            exercise_id: "new_exercise",
                            exercise_name_es: "Ejercicio nuevo QA",
                        },
                    ],
                    updated: [
                        {
                            exercise_id: "squat_back",
                            exercise_name_es: "Sentadilla trasera",
                            fields: ["core.nombre"],
                            changes: [
                                {
                                    field: "core.nombre",
                                    before: "Antes",
                                    after: "Después",
                                },
                            ],
                            was_inactive: false,
                        },
                    ],
                    unchanged_count: 100,
                },
            },
            { status: 200 }
        )
);
