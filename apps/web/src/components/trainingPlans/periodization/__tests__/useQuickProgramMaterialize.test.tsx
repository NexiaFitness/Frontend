/**
 * useQuickProgramMaterialize.test.tsx — O9 wiring fail-closed (F3 paso 5).
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi, beforeEach } from "vitest";

import {
    applyDerivedPhaseDates,
    draftToMaterializePayload,
} from "@nexia/shared";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";

import { TestProviders } from "@/test-utils/TestProviders";
import { server } from "@/test-utils/utils/msw";
import { AUTH_CONFIG } from "@nexia/shared/config/constants";

import { useQuickProgramMaterialize } from "../useQuickProgramMaterialize";
import {
    singlePhaseMaterializableDraft,
    twoPhaseMaterializableDraft,
} from "./quickProgramTestFixtures";

function wrapper({ children }: { children: React.ReactNode }) {
    return <TestProviders>{children}</TestProviders>;
}

function blockStub(id: number, start: string, end: string): PlanPeriodBlock {
    return {
        id,
        training_plan_id: 526,
        name: null,
        goal: null,
        start_date: start,
        end_date: end,
        volume_level: 5,
        intensity_level: 5,
        sort_order: null,
        qualities: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        is_active: true,
    };
}

function materializeJson(
    clientRequestId: string,
    blockIds: number[],
    phases: ReturnType<typeof draftToMaterializePayload>["phases"],
) {
    return {
        client_request_id: clientRequestId,
        total_blocks_created: blockIds.length,
        blocks: blockIds.map((id, index) => ({
            block: blockStub(
                id,
                phases[index]?.start_date ?? "2026-01-06",
                phases[index]?.end_date ?? "2026-01-25",
            ),
            template_week_ordinal: 1,
            applied_week_ordinals: [2, 3],
        })),
    };
}

describe("useQuickProgramMaterialize", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, "test-token");
    });

    it("happy path N fases → una única mutation O9 con payload exacto", async () => {
        const draft = applyDerivedPhaseDates(twoPhaseMaterializableDraft());
        const payload = draftToMaterializePayload(draft);
        const onSuccess = vi.fn();
        let materializeCalls = 0;
        let f2Calls = 0;

        server.use(
            http.post(
                "*/training-plans/:planId/quick-program/materialize",
                async ({ request }) => {
                    materializeCalls += 1;
                    const body = await request.json();
                    expect(body).toMatchObject({
                        client_request_id: payload.client_request_id,
                        program_start_date: payload.program_start_date,
                    });
                    expect((body as { phases: unknown[] }).phases).toHaveLength(2);
                    return HttpResponse.json(
                        materializeJson(
                            payload.client_request_id,
                            [201, 202],
                            payload.phases,
                        ),
                        { status: 201 },
                    );
                },
            ),
            http.get("*/training-plans/:planId/period-blocks", () =>
                HttpResponse.json([
                    blockStub(201, payload.phases[0].start_date, payload.phases[0].end_date),
                    blockStub(202, payload.phases[1].start_date, payload.phases[1].end_date),
                ]),
            ),
            http.post(
                "*/training-plans/:planId/period-blocks/with-recurring-structure",
                () => {
                    f2Calls += 1;
                    return HttpResponse.json({}, { status: 500 });
                },
            ),
        );

        const { result } = renderHook(
            () =>
                useQuickProgramMaterialize({
                    planId: 526,
                    draft,
                    phaseCount: 2,
                    canMaterialize: true,
                    onSuccess,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.materializeProgram();
        });

        await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
        expect(materializeCalls).toBe(1);
        expect(f2Calls).toBe(0);
        expect(result.current.materializeError).toBeNull();
    });

    it("201 success confirma bloques tras refetch", async () => {
        const draft = applyDerivedPhaseDates(singlePhaseMaterializableDraft());
        const payload = draftToMaterializePayload(draft);
        const onSuccess = vi.fn();

        server.use(
            http.post("*/training-plans/:planId/quick-program/materialize", () =>
                HttpResponse.json(
                    materializeJson(
                        payload.client_request_id,
                        [301],
                        payload.phases,
                    ),
                    { status: 201 },
                ),
            ),
            http.get("*/training-plans/:planId/period-blocks", () =>
                HttpResponse.json([
                    blockStub(301, payload.phases[0].start_date, payload.phases[0].end_date),
                ]),
            ),
        );

        const { result } = renderHook(
            () =>
                useQuickProgramMaterialize({
                    planId: 526,
                    draft,
                    phaseCount: 1,
                    canMaterialize: true,
                    onSuccess,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.materializeProgram();
        });

        expect(result.current.materializeError).toBeNull();
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("200 replay idempotente se trata como success", async () => {
        const draft = applyDerivedPhaseDates(singlePhaseMaterializableDraft());
        const payload = draftToMaterializePayload(draft);
        const onSuccess = vi.fn();

        server.use(
            http.post("*/training-plans/:planId/quick-program/materialize", () =>
                HttpResponse.json(
                    materializeJson(
                        payload.client_request_id,
                        [301],
                        payload.phases,
                    ),
                    { status: 200 },
                ),
            ),
            http.get("*/training-plans/:planId/period-blocks", () =>
                HttpResponse.json([
                    blockStub(301, payload.phases[0].start_date, payload.phases[0].end_date),
                ]),
            ),
        );

        const { result } = renderHook(
            () =>
                useQuickProgramMaterialize({
                    planId: 526,
                    draft,
                    phaseCount: 1,
                    canMaterialize: true,
                    onSuccess,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.materializeProgram();
        });

        expect(result.current.materializeError).toBeNull();
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("409 payload distinto → error y onSuccess no llamado", async () => {
        const draft = singlePhaseMaterializableDraft();
        const onSuccess = vi.fn();

        server.use(
            http.post("*/training-plans/:planId/quick-program/materialize", () =>
                HttpResponse.json(
                    {
                        detail:
                            "client_request_id already used with a different payload",
                    },
                    { status: 409 },
                ),
            ),
        );

        const { result } = renderHook(
            () =>
                useQuickProgramMaterialize({
                    planId: 526,
                    draft,
                    phaseCount: 1,
                    canMaterialize: true,
                    onSuccess,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.materializeProgram();
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.materializeError).toMatch(/different payload/i);
    });

    it("fallo de red → error y onSuccess no llamado", async () => {
        const draft = singlePhaseMaterializableDraft();
        const onSuccess = vi.fn();

        server.use(
            http.post("*/training-plans/:planId/quick-program/materialize", () =>
                HttpResponse.error(),
            ),
        );

        const { result } = renderHook(
            () =>
                useQuickProgramMaterialize({
                    planId: 526,
                    draft,
                    phaseCount: 1,
                    canMaterialize: true,
                    onSuccess,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.materializeProgram();
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.materializeError).toBeTruthy();
    });

    it("POST ok pero refetch sin bloques → fail-closed sin onSuccess", async () => {
        const draft = applyDerivedPhaseDates(singlePhaseMaterializableDraft());
        const payload = draftToMaterializePayload(draft);
        const onSuccess = vi.fn();

        server.use(
            http.post("*/training-plans/:planId/quick-program/materialize", () =>
                HttpResponse.json(
                    materializeJson(
                        payload.client_request_id,
                        [401],
                        payload.phases,
                    ),
                    { status: 201 },
                ),
            ),
            http.get("*/training-plans/:planId/period-blocks", () =>
                HttpResponse.json([]),
            ),
        );

        const { result } = renderHook(
            () =>
                useQuickProgramMaterialize({
                    planId: 526,
                    draft,
                    phaseCount: 1,
                    canMaterialize: true,
                    onSuccess,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.materializeProgram();
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.materializeError).toMatch(/no aparece en planificación/i);
    });

    it("pending evita doble submit", async () => {
        const draft = applyDerivedPhaseDates(singlePhaseMaterializableDraft());
        const payload = draftToMaterializePayload(draft);
        const onSuccess = vi.fn();
        let materializeCalls = 0;

        server.use(
            http.post("*/training-plans/:planId/quick-program/materialize", async () => {
                materializeCalls += 1;
                await new Promise((resolve) => setTimeout(resolve, 50));
                return HttpResponse.json(
                    materializeJson(
                        payload.client_request_id,
                        [501],
                        payload.phases,
                    ),
                    { status: 201 },
                );
            }),
            http.get("*/training-plans/:planId/period-blocks", () =>
                HttpResponse.json([
                    blockStub(501, payload.phases[0].start_date, payload.phases[0].end_date),
                ]),
            ),
        );

        const { result } = renderHook(
            () =>
                useQuickProgramMaterialize({
                    planId: 526,
                    draft,
                    phaseCount: 1,
                    canMaterialize: true,
                    onSuccess,
                }),
            { wrapper },
        );

        await act(async () => {
            const first = result.current.materializeProgram();
            const second = result.current.materializeProgram();
            await Promise.all([first, second]);
        });

        expect(materializeCalls).toBe(1);
    });
});
