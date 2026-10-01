/**
 * PWA update prompt (B1) — banner when a new service worker is waiting.
 */

import { useRegisterSW } from "virtual:pwa-register/react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import {
    PWA_UPDATE_BANNER_COPY,
    pwaUpdateBannerBodyClass,
    pwaUpdateBannerShellClass,
    pwaUpdateBannerTitleClass,
} from "./pwaUpdateBannerPresentation";
import { shouldShowPwaUpdateBanner } from "./pwaUpdateBannerVisibility";

export function PwaUpdateBannerHost(): JSX.Element | null {
    const location = useLocation();
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        immediate: true,
    });

    if (!shouldShowPwaUpdateBanner(location.pathname, needRefresh)) {
        return null;
    }

    const applyUpdate = (): void => {
        void updateServiceWorker(true);
    };

    return (
        <aside
            className={pwaUpdateBannerShellClass}
            role="region"
            aria-label={PWA_UPDATE_BANNER_COPY.title}
            data-testid="pwa-update-banner"
        >
            <div className="min-w-0 text-left">
                <p className={pwaUpdateBannerTitleClass}>{PWA_UPDATE_BANNER_COPY.title}</p>
                <p className={pwaUpdateBannerBodyClass}>{PWA_UPDATE_BANNER_COPY.body}</p>
            </div>
            <div className="flex shrink-0 gap-2">
                <Button type="button" variant="ghost-primary" size="sm" onClick={() => setNeedRefresh(false)}>
                    {PWA_UPDATE_BANNER_COPY.dismiss}
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={applyUpdate}>
                    {PWA_UPDATE_BANNER_COPY.action}
                </Button>
            </div>
        </aside>
    );
}
