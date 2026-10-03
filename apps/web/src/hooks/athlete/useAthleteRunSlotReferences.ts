/**
 * useAthleteRunSlotReferences.ts — N queries paralelas por slot (F3e group_round).
 *
 * Contexto: referencias A1/A2 en fase `doing` del guiado. La dependencia debe ser
 * estable por stepKey (no el objeto runStep entero) para no re-disparar carga
 * y dejar esqueletos en bucle / parpadeo.
 */

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { athleteApi } from "@nexia/shared/api/athleteApi";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import type { AppDispatch } from "@nexia/shared/store";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { buildAthleteRunReferenceQueryFromSlot } from "@nexia/shared/utils/athlete/runReferenceUtils";

export interface AthleteRunSlotReferencesResult {
    slotReferences: Record<string, AthleteRunReference>;
    isLoading: boolean;
}

export function useAthleteRunSlotReferences(
    sessionId: number | undefined,
    runStep: AthleteRunStep | undefined,
    enabled: boolean
): AthleteRunSlotReferencesResult {
    const dispatch = useDispatch<AppDispatch>();
    const [slotReferences, setSlotReferences] = useState<Record<string, AthleteRunReference>>(
        {}
    );
    const [isLoading, setIsLoading] = useState(false);
    const runStepKey = runStep?.stepKey ?? null;
    const slotCount = runStep?.slots?.length ?? 0;
    const slotsSignature =
        runStep?.slots?.map((slot) => `${slot.stepKey}:${slot.exerciseId}`).join("|") ?? "";
    const runStepRef = useRef(runStep);
    runStepRef.current = runStep;

    useEffect(() => {
        const step = runStepRef.current;
        if (
            !enabled ||
            !sessionId ||
            !runStepKey ||
            slotCount === 0 ||
            step?.kind !== "group_round" ||
            !step.slots?.length
        ) {
            setSlotReferences((prev) => (Object.keys(prev).length === 0 ? prev : {}));
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        const fetchAll = async () => {
            try {
                const results = await Promise.all(
                    step.slots!.map((slot) => {
                        const query = buildAthleteRunReferenceQueryFromSlot(
                            sessionId,
                            step,
                            slot
                        );
                        return dispatch(
                            athleteApi.endpoints.getAthleteRunReference.initiate(query)
                        ).unwrap();
                    })
                );

                if (cancelled) return;

                const next: Record<string, AthleteRunReference> = {};
                step.slots!.forEach((slot, index) => {
                    next[slot.stepKey] = results[index];
                });
                setSlotReferences(next);
            } catch {
                if (!cancelled) {
                    setSlotReferences((prev) => (Object.keys(prev).length === 0 ? prev : {}));
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void fetchAll();

        return () => {
            cancelled = true;
        };
    }, [dispatch, enabled, runStepKey, sessionId, slotCount, slotsSignature]);

    return { slotReferences, isLoading };
}
