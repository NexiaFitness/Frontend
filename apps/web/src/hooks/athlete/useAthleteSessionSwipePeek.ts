/**
 * useAthleteSessionSwipePeek.ts — Swipe izquierda → peek sheet (UX-FE-06).
 * Contexto: V02 lista sesiones, solo móvil.
 * @author Frontend Team
 * @since v6.2.0
 */

import { useCallback, useRef } from "react";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";

const SWIPE_THRESHOLD_PX = 48;

export interface SessionSwipeHandlers {
    onTouchStart: (event: React.TouchEvent) => void;
    onTouchEnd: (event: React.TouchEvent) => void;
}

export function useAthleteSessionSwipePeek(
    onPeek: (session: TrainingSession) => void
): (session: TrainingSession) => SessionSwipeHandlers {
    return useCallback(
        (session: TrainingSession) => {
            const start = { x: 0, y: 0 };

            return {
                onTouchStart: (event: React.TouchEvent) => {
                    start.x = event.touches[0].clientX;
                    start.y = event.touches[0].clientY;
                },
                onTouchEnd: (event: React.TouchEvent) => {
                    const dx = event.changedTouches[0].clientX - start.x;
                    const dy = event.changedTouches[0].clientY - start.y;
                    if (
                        Math.abs(dx) > Math.abs(dy) &&
                        Math.abs(dx) >= SWIPE_THRESHOLD_PX &&
                        dx < 0
                    ) {
                        onPeek(session);
                    }
                },
            };
        },
        [onPeek]
    );
}

/** Evita doble disparo swipe + tap inmediato. */
export function useSwipePeekGuard() {
    const blockedUntilRef = useRef(0);

    const blockTapBriefly = useCallback(() => {
        blockedUntilRef.current = Date.now() + 350;
    }, []);

    const shouldBlockTap = useCallback(() => Date.now() < blockedUntilRef.current, []);

    return { blockTapBriefly, shouldBlockTap };
}
