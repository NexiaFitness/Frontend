/**
 * requestTimeout.ts — Timeout por defecto de las peticiones de baseApi.
 * Contexto: sin timeout, una peticion colgada dejaba pantallas (p. ej. registro del atleta) en carga
 * indefinida; fetchBaseQuery convierte el corte en un error TIMEOUT_ERROR que la UI ya sabe mostrar.
 * Notas de mantenimiento: valor en API_CONFIG.TIMEOUT; un endpoint puede fijar su propio `timeout`
 * en FetchArgs. Las subidas (cuerpo FormData) quedan fuera porque pueden tardar legitimamente mas.
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import type { FetchArgs } from "@reduxjs/toolkit/query";

export function withRequestTimeout(args: string | FetchArgs, timeoutMs: number): string | FetchArgs {
    if (typeof args === "string") return { url: args, timeout: timeoutMs };
    if (args.timeout !== undefined) return args;
    if (typeof FormData !== "undefined" && args.body instanceof FormData) return args;
    return { ...args, timeout: timeoutMs };
}
