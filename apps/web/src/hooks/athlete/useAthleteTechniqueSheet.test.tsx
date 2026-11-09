/**
 * useAthleteTechniqueSheet.test.tsx — Estado de «Ver técnica» con red, sin red y con caché.
 *
 * Contexto: SPEC_H8 §6 y §8 (H8-A). Con red guarda la respuesta en la caché de este atleta
 * y esta sesión; sin red lee de ella; un ejercicio que la caché no cubre da «Disponible con
 * conexión»; un fallo de la caché no rompe la hoja; al reabrir sin texto y con red se
 * reintenta. Red real del hook con MSW; la caché IndexedDB y el estado de red, simulados.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AthleteTechniqueCacheEntry } from "@nexia/shared/offline/athleteTechniqueDb";
import type { AthleteSessionExerciseContentOut } from "@nexia/shared/types/exerciseContent";
import { createTestStore } from "@/test-utils/utils/store";
import { server } from "@/test-utils/utils/msw";
import { useAthleteTechniqueSheet } from "./useAthleteTechniqueSheet";

const cache = vi.hoisted(() => ({
    load: vi.fn(),
    save: vi.fn(),
}));
const network = vi.hoisted(() => ({ online: true }));

vi.mock("@nexia/shared/offline/athleteTechniqueDb", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@nexia/shared/offline/athleteTechniqueDb")>();
    return { ...actual, loadSessionTechnique: cache.load, saveSessionTechnique: cache.save };
});

vi.mock("@nexia/shared/hooks/offline/useOnlineStatus", () => ({
    useOnlineStatus: () => network.online,
}));

const URL = "*/athlete/sessions/:sessionId/exercise-content";
const CLIENT = 7;
const SESSION = 41;

const response: AthleteSessionExerciseContentOut = {
    training_session_id: SESSION,
    items: [
        {
            exercise_id: 98,
            content: {
                locale: "es",
                in_english: false,
                description: "Bird dog",
                steps: ["Apoya manos y rodillas"],
                tips: [],
            },
        },
        {
            exercise_id: 5,
            content: { locale: null, in_english: false, description: null, steps: [], tips: [] },
        },
    ],
};

const cachedEntry: AthleteTechniqueCacheEntry = {
    key: `${CLIENT}:${SESSION}`,
    clientId: CLIENT,
    sessionId: SESSION,
    exerciseIds: [98],
    contents: { 98: response.items[0].content },
    savedAt: Date.now(),
};

function wrapper({ children }: PropsWithChildren) {
    return <Provider store={createTestStore()}>{children}</Provider>;
}

function target(exerciseId: number) {
    return { exerciseId, exerciseName: `Ejercicio ${exerciseId}` };
}

describe("useAthleteTechniqueSheet", () => {
    beforeEach(() => {
        network.online = true;
        cache.load.mockResolvedValue(null);
        cache.save.mockResolvedValue(true);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("con red enseña el texto y lo guarda para este atleta y esta sesión", async () => {
        server.use(http.get(URL, () => HttpResponse.json(response)));
        const { result } = renderHook(() => useAthleteTechniqueSheet(SESSION, CLIENT), { wrapper });

        await waitFor(() => expect(cache.save).toHaveBeenCalledTimes(1));
        const saved = cache.save.mock.calls[0][0] as AthleteTechniqueCacheEntry;
        expect(saved.key).toBe(`${CLIENT}:${SESSION}`);
        expect(saved.exerciseIds).toEqual([98, 5]);
        expect(cache.load).toHaveBeenCalledWith(CLIENT, SESSION);

        act(() => result.current.open(target(98)));
        expect(result.current.sheetProps.state).toEqual({
            kind: "content",
            content: response.items[0].content,
        });
        act(() => result.current.open(target(5)));
        expect(result.current.sheetProps.state).toEqual({ kind: "empty" });
    });

    it("sin red lee la caché; un ejercicio que no cubre dice «Disponible con conexión»", async () => {
        network.online = false;
        cache.load.mockResolvedValue(cachedEntry);
        server.use(http.get(URL, () => HttpResponse.error()));
        const { result } = renderHook(() => useAthleteTechniqueSheet(SESSION, CLIENT), { wrapper });

        await waitFor(() => expect(cache.load).toHaveBeenCalled());
        act(() => result.current.open(target(98)));
        await waitFor(() => expect(result.current.sheetProps.state.kind).toBe("content"));

        // Added by the trainer after the cache was saved: never another exercise's text.
        act(() => result.current.open(target(251)));
        await waitFor(() => expect(result.current.sheetProps.state).toEqual({ kind: "unavailable" }));
    });

    it("si la caché falla, la hoja dice «Disponible con conexión» y nada se rompe", async () => {
        network.online = false;
        cache.load.mockResolvedValue(null); // the cache never throws: a failure reads as absent
        server.use(http.get(URL, () => HttpResponse.error()));
        const { result } = renderHook(() => useAthleteTechniqueSheet(SESSION, CLIENT), { wrapper });

        act(() => result.current.open(target(98)));
        await waitFor(() => expect(result.current.sheetProps.state).toEqual({ kind: "unavailable" }));
        act(() => result.current.sheetProps.onClose());
        expect(result.current.sheetProps.target).toBeNull();
    });

    it("al reabrir sin texto y con red, reintenta la petición una vez", async () => {
        let calls = 0;
        server.use(
            http.get(URL, () => {
                calls += 1;
                return calls === 1
                    ? HttpResponse.json({ detail: "boom" }, { status: 500 })
                    : HttpResponse.json(response);
            })
        );
        const { result } = renderHook(() => useAthleteTechniqueSheet(SESSION, CLIENT), { wrapper });
        await waitFor(() => expect(calls).toBe(1));
        await waitFor(() => expect(result.current.sheetProps.target).toBeNull());

        act(() => result.current.open(target(98)));

        await waitFor(() => expect(calls).toBe(2));
        await waitFor(() => expect(result.current.sheetProps.state.kind).toBe("content"));
    });

    it("sin atleta resuelto no lee ni guarda caché", async () => {
        server.use(http.get(URL, () => HttpResponse.json(response)));
        renderHook(() => useAthleteTechniqueSheet(SESSION, null), { wrapper });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(cache.load).not.toHaveBeenCalled();
        expect(cache.save).not.toHaveBeenCalled();
    });
});
