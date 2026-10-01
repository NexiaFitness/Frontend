/**
 * pwaRegisterReact.ts — Mock de virtual:pwa-register/react para Vitest.
 * Contexto: vitest.config.ts no carga vite-plugin-pwa; el hook real solo corre en build/dev.
 * @author Frontend Team
 * @since v5.x
 */

import { useState, type Dispatch, type SetStateAction } from "react";
import { vi } from "vitest";

export type UseRegisterSWMock = () => {
  needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
  offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
};

let useRegisterSWImpl: UseRegisterSWMock = () => {
  const needRefresh = useState(false);
  const offlineReady = useState(false);
  const updateServiceWorker = vi.fn(async () => undefined);
  return { needRefresh, offlineReady, updateServiceWorker };
};

export function setUseRegisterSWMock(impl: UseRegisterSWMock): void {
  useRegisterSWImpl = impl;
}

export function resetUseRegisterSWMock(): void {
  useRegisterSWImpl = () => {
    const needRefresh = useState(false);
    const offlineReady = useState(false);
    const updateServiceWorker = vi.fn(async () => undefined);
    return { needRefresh, offlineReady, updateServiceWorker };
  };
}

export function useRegisterSW(): ReturnType<UseRegisterSWMock> {
  return useRegisterSWImpl();
}
