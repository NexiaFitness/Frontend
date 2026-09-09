/**
 * baseApi401Contract.test.ts — Contrato 401: mutations rechazan; queries silenciosas en logout.
 */

import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { server } from "@/test-utils/utils/msw";
import authReducer from "@nexia/shared/store/authSlice";
import type { AuthState } from "@nexia/shared/types/auth";
import { baseApi } from "@nexia/shared/api/baseApi";

const infraApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        probeQuery401: builder.query<{ ok: boolean }, void>({
            query: () => "/__infra/probe-query",
        }),
        probeMutation401: builder.mutation<{ ok: boolean }, void>({
            query: () => ({
                url: "/__infra/probe-mutation",
                method: "PUT",
                body: {},
            }),
        }),
        probeMutation500: builder.mutation<{ ok: boolean }, void>({
            query: () => ({
                url: "/__infra/probe-mutation-500",
                method: "PUT",
                body: {},
            }),
        }),
    }),
    overrideExisting: true,
});

const defaultAuth: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

function createInfraStore(auth: Partial<AuthState> = {}) {
    return configureStore({
        reducer: {
            auth: authReducer,
            [baseApi.reducerPath]: baseApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(baseApi.middleware),
        preloadedState: {
            auth: { ...defaultAuth, ...auth },
        },
    });
}

describe("baseApi — contrato 401", () => {
    beforeEach(() => {
        server.use(
            http.get("*/__infra/probe-query", () =>
                HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
            ),
            http.put("*/__infra/probe-mutation", () =>
                HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
            ),
            http.put("*/__infra/probe-mutation-500", () =>
                HttpResponse.json({ detail: "Internal error" }, { status: 500 }),
            ),
        );
    });

    it("mutation + 401 sin sesión → rejected (unwrap debe fallar)", async () => {
        const store = createInfraStore({
            isAuthenticated: false,
            token: null,
        });

        const result = await store.dispatch(
            infraApi.endpoints.probeMutation401.initiate(undefined),
        );

        expect(result.error).toBeDefined();
        expect((result.error as { status: number }).status).toBe(401);
    });

    it("mutation + 500 con sesión → rejected", async () => {
        const store = createInfraStore({
            isAuthenticated: true,
            token: "valid-access-token",
        });

        const result = await store.dispatch(
            infraApi.endpoints.probeMutation500.initiate(undefined),
        );

        expect(result.error).toBeDefined();
        expect((result.error as { status: number }).status).toBe(500);
    });

    it("query + 401 sin sesión → fulfilled silencioso (logout UX)", async () => {
        const store = createInfraStore({
            isAuthenticated: false,
            token: null,
        });

        const result = await store.dispatch(
            infraApi.endpoints.probeQuery401.initiate(undefined),
        );

        expect(result.error).toBeUndefined();
        expect(result.data).toBeUndefined();
    });
});
