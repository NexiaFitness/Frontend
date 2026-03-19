/**
 * errorMessage.ts — Util para extraer mensaje de error de mutaciones RTK Query
 *
 * Contexto: Las mutaciones devuelven error con forma { data?: unknown } o SerializedError.
 * Centraliza la lógica para no repetir type assertions en la UI.
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

/**
 * Extrae un mensaje legible desde el error devuelto por una mutación RTK Query.
 * Evita type assertions inline en componentes.
 */
export function getMutationErrorMessage(error: unknown): string {
    if (error == null) return "Error desconocido";
    if (typeof error === "string") return error;
    if (typeof error === "object" && "data" in error) {
        const data = (error as { data?: unknown }).data;
        if (data != null && typeof data === "object" && "detail" in data) {
            const detail = (data as { detail?: unknown }).detail;
            if (typeof detail === "string") return detail;
        }
        if (data != null) return String(data);
    }
    return "Error desconocido";
}
