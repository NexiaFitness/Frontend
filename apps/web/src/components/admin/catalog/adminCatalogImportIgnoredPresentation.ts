/**
 * adminCatalogImportIgnoredPresentation.ts — Copy del aviso de columnas ignoradas al importar.
 *
 * Contexto: SPEC_H8 §9.0 (H8-P) y §9.1 (H8-B). Un Excel anterior puede traer «Fuente»,
 * «Referencia de fuente» y «Notas». El servidor las lee solo para avisar
 * (`change_summary.ignored_columns`) y no las aplica: el origen del ejercicio es interno y una
 * nota guardada no se borra ni se cambia. El aviso no habla de origen ni de bases de datos.
 * Notas de mantenimiento: vive aparte porque `adminCatalogPresentation.ts` está en el límite
 * de 600 líneas (agent.md §7.1).
 *
 * @author Frontend Team
 * @since v1.2.0
 */

export const ADMIN_CATALOG_IMPORT_IGNORED_COPY = {
    title: "Columnas que ya no se usan",
    hintPrefix: "El archivo trae columnas que el Excel ya no lleva:",
    hintSuffix: "Se ignoran. El resto del archivo se importa con normalidad.",
} as const;

/** «El archivo trae columnas que el Excel ya no lleva: Fuente, Referencia de fuente. …» */
export function catalogImportIgnoredColumnsHint(columns: readonly string[]): string {
    const { hintPrefix, hintSuffix } = ADMIN_CATALOG_IMPORT_IGNORED_COPY;
    return `${hintPrefix} ${columns.join(", ")}. ${hintSuffix}`;
}
