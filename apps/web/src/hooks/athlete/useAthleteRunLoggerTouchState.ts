/**
 * useAthleteRunLoggerTouchState.ts — Marcas de campo tocado en logger guiado (D-LOG-TOUCH-01).
 *
 * Contexto: useAthleteSessionRun + efectos de defaults; no confundir con M9 persist skip.
 * Notas: se limpia al cambiar currentStepKey, no al entrar en logging_rest.
 *
 * @author Frontend Team
 * @since v8.5.0
 */

import { useCallback, useEffect, useRef } from "react";
import {
    buildRunLoggerFieldTouchKey,
    type RunLoggerTouchField,
} from "@nexia/shared/utils/athlete/runLoggerHydrationPolicy";

export function useAthleteRunLoggerTouchState(currentStepKey: string | undefined) {
    const touchedFieldsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        touchedFieldsRef.current = new Set();
    }, [currentStepKey]);

    const markSlotField = useCallback(
        (slotStepKey: string, field: Exclude<RunLoggerTouchField, "roundRpe">) => {
            touchedFieldsRef.current.add(
                buildRunLoggerFieldTouchKey("slot", slotStepKey, field)
            );
        },
        []
    );

    const markRoundRpe = useCallback((runStepKey: string) => {
        touchedFieldsRef.current.add(
            buildRunLoggerFieldTouchKey("round", runStepKey, "roundRpe")
        );
    }, []);

    const getTouchedSnapshot = useCallback((): ReadonlySet<string> => {
        return touchedFieldsRef.current;
    }, []);

    return {
        touchedFieldsRef,
        markSlotField,
        markRoundRpe,
        getTouchedSnapshot,
    };
}
