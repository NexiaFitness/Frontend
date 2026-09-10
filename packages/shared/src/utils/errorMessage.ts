/**
 * errorMessage.ts — Util para extraer mensaje de error de RTK Query (queries y mutaciones)
 *
 * Contexto: FetchBaseQueryError usa { status, data?: body JSON }. FastAPI suele devolver
 * { detail: string } o { detail: Array<{ loc, msg, type }> } en 422. Nunca usar String(data)
 * sobre un objeto: produce "[object Object]" en pantalla.
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 * @updated 2026-09 — mensajes HTTP/Starlette en español; 405 despliegue API desincronizado
 */

const FALLBACK = "Ha ocurrido un error. Inténtalo de nuevo.";

const GENERIC_SERVER_ERROR_EN = "internal server error";

const API_DEPLOYMENT_MISMATCH_405 =
    "El servidor no admite crear o guardar bloques con esta versión de la app. " +
    "La API desplegada está desactualizada respecto al frontend: despliega la última versión " +
    "del backend (endpoints de periodización F2) e inténtalo de nuevo.";

/** Mensajes genéricos del backend / Starlette en inglés → español para la UI. */
function localizeHttpDetail(detail: string, status?: number): string {
    const normalized = detail.trim().toLowerCase();

    if (normalized === GENERIC_SERVER_ERROR_EN) {
        return (
            "Ha ocurrido un error inesperado en el servidor. " +
            "Inténtalo de nuevo en unos instantes."
        );
    }

    if (normalized === "method not allowed" || status === 405) {
        return API_DEPLOYMENT_MISMATCH_405;
    }

    if (normalized === "not authenticated" || normalized === "not authorized") {
        return "Tu sesión ha expirado o no tienes permiso. Vuelve a iniciar sesión.";
    }

    if (normalized === "forbidden") {
        return "No tienes permiso para realizar esta acción.";
    }

    if (normalized === "not found") {
        return (
            "No se encontró el recurso solicitado. Si usas la app en producción, " +
            "puede que el servidor aún no tenga desplegada la última versión de la API."
        );
    }

    return detail;
}

/** Normaliza `detail` de respuestas FastAPI a texto único para la UI. */
function formatHttpDetail(detail: unknown, status?: number): string | null {
    if (detail == null) return null;
    if (typeof detail === "string") return localizeHttpDetail(detail, status);
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

function resolveHttpStatus(error: object): number | undefined {
    if (!("status" in error)) return undefined;
    const st = (error as { status?: unknown }).status;
    return typeof st === "number" ? st : undefined;
}

/**
 * Mensaje legible desde el error devuelto por RTK Query (mutación o query).
 */
export function getMutationErrorMessage(error: unknown): string {
    if (error == null) return FALLBACK;
    if (typeof error === "string") return localizeHttpDetail(error);

    if (typeof error === "object" && error !== null) {
        const status = resolveHttpStatus(error);

        if (status === 405) {
            return API_DEPLOYMENT_MISMATCH_405;
        }

        if ("data" in error) {
            const data = (error as { data?: unknown }).data;
            if (typeof data === "string") {
                return localizeHttpDetail(data, status);
            }
            if (data != null && typeof data === "object") {
                const d = data as Record<string, unknown>;
                if ("detail" in d) {
                    const line = formatHttpDetail(d.detail, status);
                    if (line) return line;
                }
                if ("message" in d && typeof d.message === "string") {
                    return localizeHttpDetail(d.message, status);
                }
            }
        }

        if (status === 404) {
            return (
                "No se encontró el recurso. Si usas la app en producción, puede que el servidor " +
                "aún no tenga desplegada la última versión de la API."
            );
        }
        if (typeof status === "number" && status >= 500) {
            return (
                "No se pudo completar la operación por un error del servidor. " +
                "Inténtalo de nuevo en unos instantes."
            );
        }
        if (typeof status === "number" && status === 401) {
            return "Tu sesión ha expirado o no tienes permiso. Vuelve a iniciar sesión.";
        }
        if (typeof status === "number" && status === 403) {
            return "No tienes permiso para realizar esta acción.";
        }
        if (typeof status === "number" && status >= 400) {
            return `No se pudo completar la operación (código ${status}).`;
        }
    }

    return FALLBACK;
}
