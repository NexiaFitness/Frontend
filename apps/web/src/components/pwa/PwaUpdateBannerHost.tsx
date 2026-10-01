/**
 * PwaUpdateBannerHost.tsx — Monta el banner según ruta y estado PWA.
 * Contexto: oculto en `/dashboard/sessions/:id/run` (modo guiado atleta).
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { useLocation } from "react-router-dom";
import { usePwaUpdatePrompt } from "@/hooks/pwa/usePwaUpdatePrompt";
import { isAthleteSessionRunPath } from "@/lib/pwaSessionRunRoute";
import { PwaUpdateBanner } from "./PwaUpdateBanner";

export const PwaUpdateBannerHost: React.FC = () => {
  const { pathname } = useLocation();
  const { shouldOfferUpdate, dismissUntilNextCheck, applyUpdate } = usePwaUpdatePrompt();

  if (!shouldOfferUpdate || isAthleteSessionRunPath(pathname)) {
    return null;
  }

  return <PwaUpdateBanner onUpdate={applyUpdate} onDismiss={dismissUntilNextCheck} />;
};
