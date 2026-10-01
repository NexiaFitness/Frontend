/**
 * usePwaUpdatePrompt.ts — Estado del aviso de nueva versión PWA (registerType prompt).
 * Contexto: vite-plugin-pwa expone needRefresh; la UI vive en PwaUpdateBanner.
 * Comprueba actualizaciones al volver a la pestaña y cada 60 minutos.
 * @author Frontend Team
 * @since v5.x
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export const PWA_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export interface UsePwaUpdatePromptResult {
  /** Hay SW en espera y el usuario no ha pospuesto hasta la próxima comprobación. */
  shouldOfferUpdate: boolean;
  dismissUntilNextCheck: () => void;
  applyUpdate: () => void;
}

function scheduleServiceWorkerUpdate(
  registration: ServiceWorkerRegistration | undefined
): void {
  if (!registration) {
    return;
  }
  void registration.update();
}

export function usePwaUpdatePrompt(): UsePwaUpdatePromptResult {
  const [dismissedUntilNextCheck, setDismissedUntilNextCheck] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      registrationRef.current = registration;
    },
  });

  const runScheduledCheck = useCallback(() => {
    setDismissedUntilNextCheck(false);
    scheduleServiceWorkerUpdate(registrationRef.current);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(runScheduledCheck, PWA_UPDATE_CHECK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [runScheduledCheck]);

  useEffect(() => {
    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        runScheduledCheck();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [runScheduledCheck]);

  const dismissUntilNextCheck = useCallback(() => {
    setDismissedUntilNextCheck(true);
  }, []);

  const applyUpdate = useCallback(() => {
    void updateServiceWorker(true);
  }, [updateServiceWorker]);

  const shouldOfferUpdate = needRefresh && !dismissedUntilNextCheck;

  return {
    shouldOfferUpdate,
    dismissUntilNextCheck,
    applyUpdate,
  };
}
