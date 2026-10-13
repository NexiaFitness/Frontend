/**
 * useOnlineStatus.race.spec.tsx — Evento offline perdido entre render y suscripcion (DBG-E-05).
 *
 * Proposito: si la conectividad cambia despues de leer navigator.onLine en el render pero antes de
 * registrar los listeners, el hook debe reflejar el estado real y no quedarse "online".
 * Contexto: en el E2E de dos pestanas, una pestana seguia creyendose online sin red e intentaba
 * drenar la cola (POST fallidos con ERR_INTERNET_DISCONNECTED).
 * Notas: se simula el cambio con un getter de navigator.onLine sin despachar el evento.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useOnlineStatus } from "@nexia/shared/hooks/offline/useOnlineStatus";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("useOnlineStatus — cambio antes de suscribirse (DBG-E-05)", () => {
    it("refleja offline aunque el evento se emitiera antes de registrar el listener", () => {
        let reads = 0;
        vi.spyOn(window.navigator, "onLine", "get").mockImplementation(() => {
            reads += 1;
            return reads === 1;
        });

        const { result } = renderHook(() => useOnlineStatus());

        expect(result.current).toBe(false);
    });

    it("sigue reaccionando a los eventos online/offline", () => {
        vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
        const { result, rerender } = renderHook(() => useOnlineStatus());
        expect(result.current).toBe(true);

        vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
        window.dispatchEvent(new Event("offline"));
        rerender();
        expect(result.current).toBe(false);
    });
});
