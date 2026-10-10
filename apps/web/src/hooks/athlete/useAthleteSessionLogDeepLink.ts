/**
 * useAthleteSessionLogDeepLink.ts — ?mode=log (D-REG-CLOSED-01 D2).
 */

import { useEffect, useRef } from "react";
import type { SetURLSearchParams } from "react-router-dom";

export function useAthleteSessionLogDeepLink(options: {
    modeLog: boolean;
    registrationEditable: boolean;
    registrationKnown: boolean;
    wellbeingReady: boolean;
    setSearchParams: SetURLSearchParams;
    onOpenLogMode: () => void;
}): void {
    const {
        modeLog,
        registrationEditable,
        registrationKnown,
        wellbeingReady,
        setSearchParams,
        onOpenLogMode,
    } = options;
    const openedRef = useRef(false);

    useEffect(() => {
        if (!modeLog) {
            openedRef.current = false;
            return;
        }
        if (!registrationKnown || !wellbeingReady) {
            return;
        }
        if (!registrationEditable) {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete("mode");
                    return next;
                },
                { replace: true }
            );
            openedRef.current = false;
            return;
        }
        if (openedRef.current) return;
        openedRef.current = true;
        onOpenLogMode();
    }, [
        modeLog,
        registrationEditable,
        registrationKnown,
        wellbeingReady,
        onOpenLogMode,
        setSearchParams,
    ]);
}
