/**
 * usePwaUpdatePrompt.test.tsx — Comprobaciones programadas y posponer actualización.
 * @author Frontend Team
 * @since v5.x
 */

import { act, renderHook } from "@testing-library/react";
import type { Dispatch, SetStateAction } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetUseRegisterSWMock,
  setUseRegisterSWMock,
} from "@/test-utils/mocks/pwaRegisterReact";
import { PWA_UPDATE_CHECK_INTERVAL_MS, usePwaUpdatePrompt } from "../usePwaUpdatePrompt";

describe("usePwaUpdatePrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetUseRegisterSWMock();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetUseRegisterSWMock();
  });

  it("ofrece actualización cuando needRefresh es true", () => {
    setUseRegisterSWMock(() => {
      const needRefresh: [boolean, Dispatch<SetStateAction<boolean>>] = [true, vi.fn()];
      const offlineReady: [boolean, Dispatch<SetStateAction<boolean>>] = [false, vi.fn()];
      const updateServiceWorker = vi.fn(async () => undefined);
      return { needRefresh, offlineReady, updateServiceWorker };
    });

    const { result } = renderHook(() => usePwaUpdatePrompt());
    expect(result.current.shouldOfferUpdate).toBe(true);
  });

  it("oculta tras Más tarde hasta la próxima comprobación", () => {
    const updateMock = vi.fn(async () => undefined);
    setUseRegisterSWMock(() => {
      const needRefresh: [boolean, Dispatch<SetStateAction<boolean>>] = [true, vi.fn()];
      const offlineReady: [boolean, Dispatch<SetStateAction<boolean>>] = [false, vi.fn()];
      return { needRefresh, offlineReady, updateServiceWorker: updateMock };
    });

    const { result } = renderHook(() => usePwaUpdatePrompt());
    act(() => {
      result.current.dismissUntilNextCheck();
    });
    expect(result.current.shouldOfferUpdate).toBe(false);

    act(() => {
      vi.advanceTimersByTime(PWA_UPDATE_CHECK_INTERVAL_MS);
    });
    expect(result.current.shouldOfferUpdate).toBe(true);
  });

  it("applyUpdate delega en updateServiceWorker(true)", () => {
    const updateMock = vi.fn(async () => undefined);
    setUseRegisterSWMock(() => {
      const needRefresh: [boolean, Dispatch<SetStateAction<boolean>>] = [true, vi.fn()];
      const offlineReady: [boolean, Dispatch<SetStateAction<boolean>>] = [false, vi.fn()];
      return { needRefresh, offlineReady, updateServiceWorker: updateMock };
    });

    const { result } = renderHook(() => usePwaUpdatePrompt());
    act(() => {
      result.current.applyUpdate();
    });
    expect(updateMock).toHaveBeenCalledWith(true);
  });
});
