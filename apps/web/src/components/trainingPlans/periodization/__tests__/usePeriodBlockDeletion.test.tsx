/**
 * usePeriodBlockDeletion.test.tsx — Borrar / archivar bloque (D-BLQ-2, Hito 2).
 *
 * Contexto: previsualización → copy correcto → DELETE o archive; 409 por carrera
 * refresca la previsualización y no cierra en falso.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { TestProviders } from "@/test-utils/TestProviders";
import { server } from "@/test-utils/utils/msw";
import type { BlockDeletionPreview } from "@nexia/shared/types/planningCargas";

import { usePeriodBlockDeletion } from "../usePeriodBlockDeletion";

const BASE = "*/training-plans/10/period-blocks/42";

function wrapper({ children }: { children: React.ReactNode }) {
    return <TestProviders>{children}</TestProviders>;
}

function preview(overrides: Partial<BlockDeletionPreview>): BlockDeletionPreview {
    return {
        block_id: 42,
        total_sessions: 0,
        planned_sessions: 0,
        protected_sessions: 0,
        action: "delete",
        ...overrides,
    };
}

describe("usePeriodBlockDeletion", () => {
    it("solo planificadas: confirma borrado con recuento y llama a DELETE", async () => {
        let deleteCalls = 0;
        server.use(
            http.get(`${BASE}/deletion-preview`, () =>
                HttpResponse.json(
                    preview({ total_sessions: 3, planned_sessions: 3 }),
                ),
            ),
            http.delete(BASE, () => {
                deleteCalls += 1;
                return HttpResponse.json({ message: "ok", deleted_sessions: 3 });
            }),
        );

        const { result } = renderHook(() => usePeriodBlockDeletion(10), { wrapper });
        act(() => result.current.requestRemoval(42, "Fuerza base"));

        await waitFor(() => expect(result.current.isOpen).toBe(true));
        await waitFor(() =>
            expect(result.current.copy?.confirmVariant).toBe("destructive"),
        );
        expect(result.current.copy?.description).toContain(
            "Se borrarán 3 sesiones planificadas",
        );

        await act(async () => {
            await result.current.confirm();
        });

        expect(deleteCalls).toBe(1);
        expect(result.current.isOpen).toBe(false);
    });

    it("con entrenadas: ofrece archivar y llama a /archive, nunca a DELETE", async () => {
        let archiveCalls = 0;
        let deleteCalls = 0;
        server.use(
            http.get(`${BASE}/deletion-preview`, () =>
                HttpResponse.json(
                    preview({
                        total_sessions: 3,
                        planned_sessions: 2,
                        protected_sessions: 1,
                        action: "archive",
                    }),
                ),
            ),
            http.post(`${BASE}/archive`, () => {
                archiveCalls += 1;
                return HttpResponse.json({
                    block: { id: 42, is_active: false },
                    deleted_planned_sessions: 2,
                });
            }),
            http.delete(BASE, () => {
                deleteCalls += 1;
                return HttpResponse.json({ message: "ok", deleted_sessions: 0 });
            }),
        );

        const { result } = renderHook(() => usePeriodBlockDeletion(10), { wrapper });
        act(() => result.current.requestRemoval(42, "Fuerza base"));

        await waitFor(() => expect(result.current.isOpen).toBe(true));
        expect(result.current.copy?.title).toBe("Archivar bloque");
        expect(result.current.copy?.confirmVariant).toBe("primary");
        expect(result.current.copy?.description).toContain("1 sesión entrenada");
        expect(result.current.copy?.description).toContain(
            "Se borrarán 2 sesiones planificadas",
        );

        await act(async () => {
            await result.current.confirm();
        });

        expect(archiveCalls).toBe(1);
        expect(deleteCalls).toBe(0);
        expect(result.current.isOpen).toBe(false);
    });

    it("409 por carrera: no cierra y la previsualización pasa a archivar", async () => {
        let previewCalls = 0;
        server.use(
            http.get(`${BASE}/deletion-preview`, () => {
                previewCalls += 1;
                return HttpResponse.json(
                    previewCalls === 1
                        ? preview({ total_sessions: 1, planned_sessions: 1 })
                        : preview({
                              total_sessions: 1,
                              protected_sessions: 1,
                              action: "archive",
                          }),
                );
            }),
            http.delete(BASE, () =>
                HttpResponse.json(
                    {
                        detail: "Este bloque tiene sesiones entrenadas. Archívalo para conservar el historial.",
                    },
                    { status: 409 },
                ),
            ),
        );

        const { result } = renderHook(() => usePeriodBlockDeletion(10), { wrapper });
        act(() => result.current.requestRemoval(42, "Fuerza base"));
        await waitFor(() => expect(result.current.isOpen).toBe(true));

        await act(async () => {
            await result.current.confirm();
        });

        await waitFor(() => expect(result.current.copy?.title).toBe("Archivar bloque"));
        expect(result.current.isOpen).toBe(true);
    });
});
