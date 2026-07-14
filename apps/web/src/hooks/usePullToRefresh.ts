/**
 * usePullToRefresh.ts — Gestos pull-to-refresh móvil (UX-FE-04).
 * Contexto: V01/V02; usa #dashboard-main-scroll (AthleteMobileShell).
 * @author Frontend Team
 * @since v6.2.0
 */

import { useEffect, useRef, useState } from "react";
import { getDashboardMainScrollElement } from "@/lib/dashboardScroll";

const PULL_THRESHOLD_PX = 72;
const MAX_PULL_PX = 120;

export interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void>;
    disabled?: boolean;
}

export interface UsePullToRefreshResult {
    pullDistance: number;
    isRefreshing: boolean;
}

export function usePullToRefresh({
    onRefresh,
    disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
    const startYRef = useRef(0);
    const pullingRef = useRef(false);
    const pullDistanceRef = useRef(0);
    const isRefreshingRef = useRef(false);
    const onRefreshRef = useRef(onRefresh);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    onRefreshRef.current = onRefresh;
    pullDistanceRef.current = pullDistance;
    isRefreshingRef.current = isRefreshing;

    useEffect(() => {
        if (disabled) return;

        const scrollEl = getDashboardMainScrollElement();
        if (!scrollEl) return;

        const onTouchStart = (event: TouchEvent) => {
            if (isRefreshingRef.current) return;
            if (scrollEl.scrollTop > 0) return;
            startYRef.current = event.touches[0].clientY;
            pullingRef.current = true;
        };

        const onTouchMove = (event: TouchEvent) => {
            if (!pullingRef.current || isRefreshingRef.current) return;
            const delta = event.touches[0].clientY - startYRef.current;
            if (delta <= 0) {
                pullDistanceRef.current = 0;
                setPullDistance(0);
                return;
            }
            if (scrollEl.scrollTop > 0) {
                pullingRef.current = false;
                pullDistanceRef.current = 0;
                setPullDistance(0);
                return;
            }
            event.preventDefault();
            const next = Math.min(delta, MAX_PULL_PX);
            pullDistanceRef.current = next;
            setPullDistance(next);
        };

        const finishPull = () => {
            if (!pullingRef.current || isRefreshingRef.current) return;
            pullingRef.current = false;

            const current = pullDistanceRef.current;
            pullDistanceRef.current = 0;
            setPullDistance(0);

            if (current >= PULL_THRESHOLD_PX) {
                setIsRefreshing(true);
                void onRefreshRef.current().finally(() => setIsRefreshing(false));
            }
        };

        scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
        scrollEl.addEventListener("touchmove", onTouchMove, { passive: false });
        scrollEl.addEventListener("touchend", finishPull, { passive: true });
        scrollEl.addEventListener("touchcancel", finishPull, { passive: true });

        return () => {
            scrollEl.removeEventListener("touchstart", onTouchStart);
            scrollEl.removeEventListener("touchmove", onTouchMove);
            scrollEl.removeEventListener("touchend", finishPull);
            scrollEl.removeEventListener("touchcancel", finishPull);
        };
    }, [disabled]);

    return { pullDistance, isRefreshing };
}
