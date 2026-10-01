/**
 * useAthleteRunWakeLock.ts — Activa Wake Lock mientras el run lo requiere (B6).
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import { useEffect } from "react";
import { setAthleteRunWakeLockActive } from "@/platform/wakeLock";

export function useAthleteRunWakeLock(active: boolean): void {
    useEffect(() => {
        setAthleteRunWakeLockActive(active);
        return () => {
            setAthleteRunWakeLockActive(false);
        };
    }, [active]);
}
