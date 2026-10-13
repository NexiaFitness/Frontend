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

import { API_CONFIG } from "../config/constants";

/** Mutaciones no idempotentes: sin timeout de cliente (evita reintento duplicado tras éxito lento). */
const NO_CLIENT_TIMEOUT_URL = [
    /\/replicate\b/i,
    /\/weekly-structure\/weeks\/\d+\/repeat\b/i,
    /\/sync-recurring\b/i,
    /\/period-blocks\b/i,
    /\/training-plans\/?(\?|$)/i,
    /\/training-sessions\/?(\?|$)/i,
];

const LONG_READ_TIMEOUT_MS = 60_000;

function requestUrl(args: string | FetchArgs): string {
    return typeof args === "string" ? args : args.url;
}

function requestMethod(args: string | FetchArgs): string {
    if (typeof args === "string") return "GET";
    return (args.method ?? "GET").toUpperCase();
}

export function resolveRequestTimeoutMs(
    args: string | FetchArgs,
    _endpointName?: string
): number | undefined {
    if (typeof args !== "string" && args.timeout !== undefined) {
        return args.timeout;
    }
    if (typeof FormData !== "undefined" && typeof args !== "string" && args.body instanceof FormData) {
        return undefined;
    }
    const url = requestUrl(args);
    const method = requestMethod(args);
    if (method !== "GET" && NO_CLIENT_TIMEOUT_URL.some((re) => re.test(url))) {
        return undefined;
    }
    if (method === "GET" && /reports|weekly-structure|training-plans/i.test(url)) {
        return LONG_READ_TIMEOUT_MS;
    }
    return API_CONFIG.TIMEOUT;
}

export function withRequestTimeout(
    args: string | FetchArgs,
    timeoutMs: number,
    endpointName?: string
): string | FetchArgs {
    const resolved = resolveRequestTimeoutMs(args, endpointName);
    if (resolved === undefined) {
        if (typeof args === "string") return args;
        const { timeout: _removed, ...rest } = args;
        return rest;
    }
    const ms = resolved ?? timeoutMs;
    if (typeof args === "string") return { url: args, timeout: ms };
    if (args.timeout !== undefined) return args;
    if (typeof FormData !== "undefined" && args.body instanceof FormData) return args;
    return { ...args, timeout: ms };
}
