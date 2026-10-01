/**
 * PwaUpdateBanner.tsx — Presentational PWA update banner (legacy export; Host is primary).
 * Contexto: tokens en pwaUpdateBannerPresentation.ts.
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import {
    PWA_UPDATE_BANNER_COPY,
    pwaUpdateBannerBodyClass,
    pwaUpdateBannerShellClass,
    pwaUpdateBannerTitleClass,
} from "./pwaUpdateBannerPresentation";

export interface PwaUpdateBannerProps {
    onUpdate: () => void;
    onDismiss: () => void;
}

export const PwaUpdateBanner: React.FC<PwaUpdateBannerProps> = ({ onUpdate, onDismiss }) => (
    <aside
        className={pwaUpdateBannerShellClass}
        role="region"
        aria-label={PWA_UPDATE_BANNER_COPY.title}
    >
        <div className="min-w-0 text-left">
            <p className={pwaUpdateBannerTitleClass}>{PWA_UPDATE_BANNER_COPY.title}</p>
            <p className={pwaUpdateBannerBodyClass}>{PWA_UPDATE_BANNER_COPY.body}</p>
        </div>
        <div className="flex shrink-0 gap-2">
            <Button type="button" variant="ghost-primary" size="sm" onClick={onDismiss}>
                {PWA_UPDATE_BANNER_COPY.dismiss}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={onUpdate}>
                {PWA_UPDATE_BANNER_COPY.action}
            </Button>
        </div>
    </aside>
);
