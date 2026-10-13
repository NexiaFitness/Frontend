/**
 * baseApiTimeout.test.ts — Timeout de la capa de API (DBG-TO-01).
 *
 * Proposito: una peticion colgada termina en error TIMEOUT_ERROR tras API_CONFIG.TIMEOUT, para que
 * las pantallas puedan salir del estado de carga; las subidas de archivos (FormData) no se cortan.
 * Contexto: auditoria debug/claude-code-2026-10-13; antes solo el refresh de token tenia timeout.
 * Notas: MSW + store real con baseApi; temporizadores falsos para no esperar el timeout real.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { configureStore } from "@reduxjs/toolkit";
import { delay, http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test-utils/utils/msw";
import { baseApi } from "@nexia/shared/api/baseApi";
import { API_CONFIG } from "@nexia/shared/config/constants";
import authReducer from "@nexia/shared/store/authSlice";

const probeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        probeHangingQuery: builder.query<{ ok: boolean }, void>({
            query: () => "/__infra/probe-hanging",
        }),
        probeSlowUpload: builder.mutation<{ ok: boolean }, void>({
            query: () => {
                const body = new FormData();
                body.append("file", new Blob(["x"]), "x.xlsx");
                return { url: "/__infra/probe-upload", method: "POST", body };
            },
        }),
    }),
});

function makeStore() {
    return configureStore({
        reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
        middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    });
}

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
    vi.useRealTimers();
});

describe("baseApi — timeout de peticion (DBG-TO-01)", () => {
    it("una query sin respuesta acaba en TIMEOUT_ERROR tras API_CONFIG.TIMEOUT", async () => {
        server.use(
            http.get("*/__infra/probe-hanging", async () => {
                await delay("infinite");
                return HttpResponse.json({ ok: true });
            })
        );
        const store = makeStore();
        const pending = store.dispatch(probeApi.endpoints.probeHangingQuery.initiate());

        await vi.advanceTimersByTimeAsync(API_CONFIG.TIMEOUT + 50);
        const result = await pending;

        expect(result.isError).toBe(true);
        expect(result.error).toMatchObject({ status: "TIMEOUT_ERROR" });
        pending.unsubscribe();
    });

    it("una subida FormData mas lenta que el timeout no se corta", async () => {
        server.use(
            http.post("*/__infra/probe-upload", async () => {
                await delay(API_CONFIG.TIMEOUT + 1_000);
                return HttpResponse.json({ ok: true });
            })
        );
        const store = makeStore();
        const pending = store.dispatch(probeApi.endpoints.probeSlowUpload.initiate());

        await vi.advanceTimersByTimeAsync(API_CONFIG.TIMEOUT + 1_500);
        const result = await pending;

        expect("data" in result ? result.data : result.error).toEqual({ ok: true });
    });
});
