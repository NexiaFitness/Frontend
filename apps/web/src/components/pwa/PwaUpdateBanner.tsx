/**
 * PwaUpdateBanner.tsx — Aviso no bloqueante de nueva versión PWA.
 * Contexto: registerType prompt; acciones delegadas desde usePwaUpdatePrompt.
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import {
  PWA_UPDATE_BANNER_ACTIONS,
  PWA_UPDATE_BANNER_ARIA_LABEL,
  PWA_UPDATE_BANNER_LATER_LABEL,
  PWA_UPDATE_BANNER_MESSAGE,
  PWA_UPDATE_BANNER_PANEL,
  PWA_UPDATE_BANNER_PRIMARY,
  PWA_UPDATE_BANNER_REGION,
  PWA_UPDATE_BANNER_SECONDARY,
  PWA_UPDATE_BANNER_TEXT,
  PWA_UPDATE_BANNER_UPDATE_LABEL,
} from "./pwaUpdateBannerPresentation";

export interface PwaUpdateBannerProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export const PwaUpdateBanner: React.FC<PwaUpdateBannerProps> = ({ onUpdate, onDismiss }) => (
  <div
    className={PWA_UPDATE_BANNER_REGION}
    role="region"
    aria-label={PWA_UPDATE_BANNER_ARIA_LABEL}
    aria-live="polite"
  >
    <div className={PWA_UPDATE_BANNER_PANEL}>
      <p className={PWA_UPDATE_BANNER_TEXT}>{PWA_UPDATE_BANNER_MESSAGE}</p>
      <div className={PWA_UPDATE_BANNER_ACTIONS}>
        <button type="button" className={PWA_UPDATE_BANNER_SECONDARY} onClick={onDismiss}>
          {PWA_UPDATE_BANNER_LATER_LABEL}
        </button>
        <Button type="button" variant="primary" className={PWA_UPDATE_BANNER_PRIMARY} onClick={onUpdate}>
          {PWA_UPDATE_BANNER_UPDATE_LABEL}
        </Button>
      </div>
    </div>
  </div>
);
