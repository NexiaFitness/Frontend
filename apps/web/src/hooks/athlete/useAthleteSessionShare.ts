/**
 * useAthleteSessionShare.ts — Web Share / clipboard para V06 (F3b-FE-04).
 */

import { useCallback, useMemo, useState } from "react";
import { buildPostSessionSharePayload } from "@nexia/shared/utils/athlete/athleteSessionShareCopy";
import type { PostSessionReport } from "@nexia/shared/types/trainingSessions";
import { useToast } from "@/components/ui/feedback";

function canUseNativeShare(): boolean {
    return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export interface UseAthleteSessionShareResult {
    canShare: boolean;
    isSharing: boolean;
    share: () => Promise<void>;
}

export function useAthleteSessionShare(
    report: PostSessionReport | undefined
): UseAthleteSessionShareResult {
    const { showToast } = useToast();
    const [isSharing, setIsSharing] = useState(false);

    const payload = useMemo(
        () => (report ? buildPostSessionSharePayload(report) : null),
        [report]
    );

    const share = useCallback(async () => {
        if (!payload) return;

        setIsSharing(true);
        try {
            if (canUseNativeShare()) {
                await navigator.share({
                    title: payload.title,
                    text: payload.text,
                });
                return;
            }

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(payload.text);
                showToast("success", "Resumen copiado al portapapeles");
                return;
            }

            showToast("error", "No se pudo compartir en este dispositivo");
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }
            showToast("error", "No se pudo compartir el resumen");
        } finally {
            setIsSharing(false);
        }
    }, [payload, showToast]);

    return {
        canShare: payload != null,
        isSharing,
        share,
    };
}
