/**
 * usePwaInstallPrompt.ts — Orquestación DOM del funnel PWA (sheet + chip).
 * @see docs/atleta/pwa/IMPLEMENTACION.md FASE 5
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
    buildPWAInstallState,
    getInstallUiPlatform,
    isPwaInstallPending,
    recordInstallAccepted,
    recordSheetShown,
    shouldShowInstallChip,
    shouldShowInstallSheet,
    SHEET_RESHOW_INTERVAL_MS,
    type PWAInstallState,
} from "@nexia/shared";
import type { InstallPromptPlatform } from "@/components/athlete/pwa";
import { pwaSyncStorage } from "@/lib/pwaSyncStorage";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface UsePwaInstallPromptOptions {
    /** Otro sheet/drawer/modal abierto — bloquea el install sheet. */
    isBlockingOverlayOpen?: boolean;
}

export interface UsePwaInstallPromptResult {
    /** Funnel activo (móvil, no standalone, no instalado). */
    isActive: boolean;
    isSheetOpen: boolean;
    closeSheet: () => void;
    openSheet: () => void;
    platform: InstallPromptPlatform;
    promptInstall: () => Promise<void>;
    showChip: boolean;
}

export function usePwaInstallPrompt(
    options: UsePwaInstallPromptOptions = {}
): UsePwaInstallPromptResult {
    const { isBlockingOverlayOpen = false } = options;
    const isDesktop = useIsAthleteDesktopLayout();

    const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
    const pendingOpenRef = useRef(false);
    const hasOpenedOnMountRef = useRef(false);

    const [installState, setInstallState] = useState<PWAInstallState>(() =>
        buildPWAInstallState(false)
    );
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const refreshInstallState = useCallback(() => {
        setInstallState(buildPWAInstallState(deferredPromptRef.current != null));
    }, []);

    const isActive = !isDesktop && isPwaInstallPending(installState, pwaSyncStorage);

    const tryOpenSheet = useCallback(
        (trigger: "mount" | "interval") => {
            if (!isPwaInstallPending(installState, pwaSyncStorage)) return;
            if (isBlockingOverlayOpen) {
                pendingOpenRef.current = true;
                return;
            }
            if (
                !shouldShowInstallSheet(installState, pwaSyncStorage, { trigger })
            ) {
                return;
            }
            pendingOpenRef.current = false;
            setIsSheetOpen(true);
            recordSheetShown(pwaSyncStorage);
        },
        [installState, isBlockingOverlayOpen]
    );

    useEffect(() => {
        const onBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            deferredPromptRef.current = event as BeforeInstallPromptEvent;
            setInstallState(buildPWAInstallState(true));
        };

        const onAppInstalled = () => {
            recordInstallAccepted(pwaSyncStorage);
            deferredPromptRef.current = null;
            setIsSheetOpen(false);
            refreshInstallState();
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onAppInstalled);
        document.addEventListener("visibilitychange", refreshInstallState);

        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
            window.removeEventListener("appinstalled", onAppInstalled);
            document.removeEventListener("visibilitychange", refreshInstallState);
        };
    }, [refreshInstallState]);

    useEffect(() => {
        if (!isActive || hasOpenedOnMountRef.current) return;
        hasOpenedOnMountRef.current = true;
        tryOpenSheet("mount");
    }, [isActive, tryOpenSheet]);

    useEffect(() => {
        if (!isActive || isBlockingOverlayOpen) return;
        if (!pendingOpenRef.current) return;
        tryOpenSheet("mount");
    }, [isActive, isBlockingOverlayOpen, tryOpenSheet]);

    useEffect(() => {
        if (!isActive) return;

        const intervalId = window.setInterval(() => {
            if (isSheetOpen || isBlockingOverlayOpen) return;
            tryOpenSheet("interval");
        }, SHEET_RESHOW_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [isActive, isSheetOpen, isBlockingOverlayOpen, tryOpenSheet]);

    const closeSheet = useCallback(() => {
        setIsSheetOpen(false);
    }, []);

    const openSheet = useCallback(() => {
        if (isBlockingOverlayOpen) return;
        if (!isPwaInstallPending(installState, pwaSyncStorage)) return;
        setIsSheetOpen(true);
        recordSheetShown(pwaSyncStorage);
    }, [installState, isBlockingOverlayOpen]);

    const promptInstall = useCallback(async () => {
        const deferred = deferredPromptRef.current;
        if (!deferred) return;

        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        deferredPromptRef.current = null;
        setInstallState(buildPWAInstallState(false));

        if (outcome === "accepted") {
            recordInstallAccepted(pwaSyncStorage);
            setIsSheetOpen(false);
        }
    }, []);

    const showChip =
        isActive &&
        shouldShowInstallChip(installState, pwaSyncStorage, isSheetOpen);

    const platform = getInstallUiPlatform(installState) as InstallPromptPlatform;

    return {
        isActive,
        isSheetOpen,
        closeSheet,
        openSheet,
        platform,
        promptInstall,
        showChip,
    };
}
