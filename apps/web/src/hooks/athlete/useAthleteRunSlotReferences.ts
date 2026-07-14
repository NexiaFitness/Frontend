/**
 * useAthleteRunSlotReferences — N queries paralelas por slot (F3e group_round).
 */

import { useEffect, useState } from "react";
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
    const runStepKey = runStep?.stepKey;
    const slotCount = runStep?.slots?.length ?? 0;

    useEffect(() => {
        if (
            !enabled ||
            !sessionId ||
            !runStepKey ||
            slotCount === 0 ||
            runStep?.kind !== "group_round"
        ) {
            setSlotReferences((prev) => (Object.keys(prev).length === 0 ? prev : {}));
            setIsLoading((prev) => (prev ? false : prev));
            return;
        }

        let cancelled = false;
        setIsLoading((prev) => (prev ? prev : true));

        const fetchAll = async () => {
            try {
                const results = await Promise.all(
                    runStep!.slots!.map((slot) => {
                        const query = buildAthleteRunReferenceQueryFromSlot(
                            sessionId,
                            runStep!,
                            slot
                        );
                        return dispatch(
                            athleteApi.endpoints.getAthleteRunReference.initiate(query)
                        ).unwrap();
                    })
                );

                if (cancelled) return;

                const next: Record<string, AthleteRunReference> = {};
                runStep!.slots!.forEach((slot, index) => {
                    next[slot.stepKey] = results[index];
                });
                setSlotReferences(next);
            } catch {
                if (!cancelled) {
                    setSlotReferences((prev) => (Object.keys(prev).length === 0 ? prev : {}));
                }
            } finally {
                if (!cancelled) setIsLoading((prev) => (prev ? false : prev));
            }
        };

        void fetchAll();

        return () => {
            cancelled = true;
        };
    }, [dispatch, enabled, runStep, runStepKey, sessionId, slotCount]);

    return { slotReferences, isLoading };
}
