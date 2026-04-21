/**
 * Nombres de ejercicio — convención Tablas.xlsx
 *
 * - `nombre` (API) = hoja «8. Ejercicio base» columna `exercise_name_es`: texto mostrado en la app.
 *   Puede ser español, anglicismo o mezcla; no se traduce ni se reformatea en el front.
 * - `nombre_ingles` = columna `exercise_name_en`: identificador/nombre en inglés tal cual en Excel.
 */

/** Texto visible del ejercicio (como en Excel `exercise_name_es`). Sin traducción. */
export function exerciseDisplayName(ex: { nombre: string }): string {
    return (ex.nombre ?? "").trim();
}

/** Valor inglés del Excel (`exercise_name_en`), sin traducir. */
export function exerciseEnglishKey(ex: { nombre_ingles?: string | null }): string {
    return (ex.nombre_ingles ?? "").trim();
}
