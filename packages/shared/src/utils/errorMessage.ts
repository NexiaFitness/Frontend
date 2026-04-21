/**
 * errorMessage.ts — Util para extraer mensaje de error de RTK Query (queries y mutaciones)
 *
 * Contexto: FetchBaseQueryError usa { status, data?: body JSON }. FastAPI suele devolver
 * { detail: string } o { detail: Array<{ loc, msg, type }> } en 422. Nunca usar String(data)
 * sobre un objeto: produce "[object Object]" en pantalla.
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 * @updated 2026-04 — detail en array (validación), message, fallback por status HTTP
 */

const FALLBACK = "Error desconocido";

/** Normaliza `detail` de respuestas FastAPI a texto único para la UI. */
function formatHttpDetail(detail: unknown): string | null {
    if (detail == null) return null;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        const parts = detail.map((item) => {
            if (item && typeof item === "object" && "msg" in item) {
                const rec = item as { msg?: unknown; loc?: unknown };
                const msg = typeof rec.msg === "string" ? rec.msg : String(rec.msg ?? "");
                if (Array.isArray(rec.loc) && rec.loc.length > 0) {
                    const path = rec.loc.map(String).filter(Boolean).join(".");
                    return path ? `${path}: ${msg}` : msg;
                }
                return msg;
            }
            if (typeof item === "string") return item;
            try {
                return JSON.stringify(item);
            } catch {
                return FALLBACK;
            }
        });
        const joined = parts.filter(Boolean).join("; ");
        return joined || null;
    }
    if (typeof detail === "number" || typeof detail === "boolean") {
        return String(detail);
    }
    if (typeof detail === "object") {
        try {
            return JSON.stringify(detail);
        } catch {
            return null;
        }
    }
    return String(detail);
}

/**
 * Mensaje legible desde el error devuelto por RTK Query (mutación o query).
 */
export function getMutationErrorMessage(error: unknown): string {
    if (error == null) return FALLBACK;
    if (typeof error === "string") return error;

    if (typeof error === "object" && "data" in error) {
        const data = (error as { data?: unknown }).data;
        if (typeof data === "string") return data;
        if (data != null && typeof data === "object") {
            const d = data as Record<string, unknown>;
            if ("detail" in d) {
                const line = formatHttpDetail(d.detail);
                if (line) return line;
            }
            if ("message" in d && typeof d.message === "string") {
                return d.message;
            }
        }
    }

    if (typeof error === "object" && error !== null && "status" in error) {
        const st = (error as { status?: unknown }).status;
        if (st === 404 || st === "404") {
            return (
                "No se encontró el recurso. Si usas la app en producción, puede que el servidor " +
                "aún no tenga desplegada la última versión de la API."
            );
        }
        if (typeof st === "number" && st >= 400) {
            return `Error del servidor (${st}).`;
        }
    }

    return FALLBACK;
}
