/**
 * lazyWithRetry.test.tsx — Tests de la recuperación ante chunks obsoletos.
 * Contexto: cubre lib/lazyWithRetry.ts: detección del error, recarga única con protección
 * anti-bucle, listener de vite:preloadError y el comportamiento dentro de Suspense.
 * Notas de mantenimiento: la recarga se inyecta con un spy (jsdom no implementa
 * location.reload). Si cambia la ventana anti-bucle, ajustar los tests que dependen de ella.
 * @author Frontend Team
 * @since v5.x
 */

import { Component, Suspense, createElement, type ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  STALE_CHUNK_RELOAD_KEY,
  STALE_CHUNK_RELOAD_WINDOW_MS,
  isChunkLoadError,
  lazyWithRetry,
  registerPreloadErrorRecovery,
  reloadOnceForStaleChunk,
} from "../lazyWithRetry";

const CHUNK_MESSAGE = "Failed to fetch dynamically imported module: https://x/assets/Page-abc.js";

class TestBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render(): ReactNode {
    return this.state.hasError ? createElement("p", null, "boundary-error") : this.props.children;
  }
}

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isChunkLoadError", () => {
  it("reconoce los mensajes de Chromium, Firefox y Safari", () => {
    expect(isChunkLoadError(new Error(CHUNK_MESSAGE))).toBe(true);
    expect(isChunkLoadError(new Error("error loading dynamically imported module: x"))).toBe(true);
    expect(isChunkLoadError(new Error("Importing a module script failed."))).toBe(true);
    expect(isChunkLoadError(new Error("Unable to preload CSS for /assets/x.css"))).toBe(true);
  });

  it("reconoce ChunkLoadError por nombre", () => {
    const error = new Error("cualquier texto");
    error.name = "ChunkLoadError";
    expect(isChunkLoadError(error)).toBe(true);
  });

  it("descarta errores que no son de carga de chunks", () => {
    expect(isChunkLoadError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isChunkLoadError("Failed to fetch dynamically imported module")).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});

describe("reloadOnceForStaleChunk", () => {
  it("recarga y registra la marca cuando no hay recarga previa", () => {
    const reload = vi.fn();
    expect(reloadOnceForStaleChunk({ now: 1_000, reload })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY)).toBe("1000");
  });

  it("no vuelve a recargar dentro de la ventana anti-bucle", () => {
    const reload = vi.fn();
    reloadOnceForStaleChunk({ now: 1_000, reload });
    expect(reloadOnceForStaleChunk({ now: 1_000 + STALE_CHUNK_RELOAD_WINDOW_MS - 1, reload })).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("permite recargar de nuevo cuando la ventana ha pasado", () => {
    const reload = vi.fn();
    reloadOnceForStaleChunk({ now: 1_000, reload });
    expect(reloadOnceForStaleChunk({ now: 1_000 + STALE_CHUNK_RELOAD_WINDOW_MS, reload })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("no recarga si sessionStorage no esta disponible", () => {
    const reload = vi.fn();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage bloqueado");
    });
    expect(reloadOnceForStaleChunk({ now: 1_000, reload })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});

describe("registerPreloadErrorRecovery", () => {
  it("recarga una vez y cancela el evento; no repite dentro de la ventana", () => {
    const reload = vi.fn();
    const unregister = registerPreloadErrorRecovery({ reload });

    const first = new Event("vite:preloadError", { cancelable: true });
    window.dispatchEvent(first);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(first.defaultPrevented).toBe(true);

    const second = new Event("vite:preloadError", { cancelable: true });
    window.dispatchEvent(second);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(second.defaultPrevented).toBe(false);

    unregister();
  });

  it("deja de escuchar al desregistrar", () => {
    const reload = vi.fn();
    registerPreloadErrorRecovery({ reload })();
    window.dispatchEvent(new Event("vite:preloadError", { cancelable: true }));
    expect(reload).not.toHaveBeenCalled();
  });
});

describe("lazyWithRetry", () => {
  const renderLazy = (Lazy: ReturnType<typeof lazyWithRetry>): void => {
    render(
      createElement(
        TestBoundary,
        null,
        createElement(Suspense, { fallback: createElement("p", null, "cargando") }, createElement(Lazy)),
      ),
    );
  };

  it("renderiza el componente cuando el import funciona", async () => {
    const Lazy = lazyWithRetry(async () => ({ default: () => createElement("p", null, "ok") }));
    renderLazy(Lazy);
    expect(await screen.findByText("ok")).toBeInTheDocument();
  });

  it("recarga una vez ante un chunk obsoleto y mantiene el fallback de carga", async () => {
    const reload = vi.fn();
    const Lazy = lazyWithRetry(() => Promise.reject(new Error(CHUNK_MESSAGE)), { reload });
    renderLazy(Lazy);
    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    expect(screen.getByText("cargando")).toBeInTheDocument();
    expect(screen.queryByText("boundary-error")).not.toBeInTheDocument();
  });

  it("propaga al ErrorBoundary un chunk obsoleto si ya se recargo hace poco", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    window.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(Date.now()));
    const reload = vi.fn();
    const Lazy = lazyWithRetry(() => Promise.reject(new Error(CHUNK_MESSAGE)), { reload });
    renderLazy(Lazy);
    expect(await screen.findByText("boundary-error")).toBeInTheDocument();
    expect(reload).not.toHaveBeenCalled();
  });

  it("propaga al ErrorBoundary los errores que no son de chunks sin recargar", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reload = vi.fn();
    const Lazy = lazyWithRetry(() => Promise.reject(new Error("boom")), { reload });
    renderLazy(Lazy);
    expect(await screen.findByText("boundary-error")).toBeInTheDocument();
    expect(reload).not.toHaveBeenCalled();
  });
});
