/**
 * resourceQueryStateContract.ts — Contrato puro: HTTP → estado de recurso.
 *
 * Sin React/CSS. Diferimiento packages/ui-primitives (agent.md §6).
 *
 * @author Frontend Team
 * @since v9.2.2
 */

export type ResourceQueryKind = "not_found" | "forbidden" | "load_failed";

export type ResourceQueryResource =
    | "plan"
    | "client"
    | "session"
    | "block"
    | "generic";

/** Clasifica el fallo de consulta por status HTTP. */
export function resolveResourceQueryKind(
    status: number | undefined | null,
): ResourceQueryKind {
    if (status === 404) return "not_found";
    if (status === 403) return "forbidden";
    return "load_failed";
}

/** Extrae status numérico de errores RTK / FetchBaseQueryError. */
export function extractHttpStatus(error: unknown): number | undefined {
    if (error == null || typeof error !== "object") return undefined;
    if (!("status" in error)) return undefined;
    const status = (error as { status: unknown }).status;
    return typeof status === "number" ? status : undefined;
}
