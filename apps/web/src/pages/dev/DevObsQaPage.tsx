/**
 * Dev-only helpers for QA-0A (OBS). Not included in production builds.
 */

import { useCallback } from "react";
import { Button } from "@/components/ui/buttons";
import { useLazyGetObsIntentional500Query } from "./devObsApi";

export function DevObs5xxProbePage(): JSX.Element {
    const [trigger, state] = useLazyGetObsIntentional500Query();

    const fire = useCallback(() => {
        void trigger(undefined, true);
    }, [trigger]);

    return (
        <div className="mx-auto max-w-md space-y-4 p-6">
            <h1 className="text-lg font-semibold">QA OBS — 5xx RTK</h1>
            <p className="text-sm text-muted-foreground">
                Dispara GET /dev/obs-intentional-500 vía RTK (reporter api_5xx).
            </p>
            <Button type="button" variant="primary" size="sm" onClick={fire} data-testid="dev-obs-5xx-trigger">
                Disparar 5xx
            </Button>
            {state.isError ? (
                <p className="text-xs text-muted-foreground" data-testid="dev-obs-5xx-error">
                    Error RTK recibido (esperado).
                </p>
            ) : null}
        </div>
    );
}

/** Throws on render to exercise ErrorBoundary + react_boundary reporter. */
export function DevReactBoundaryProbePage(): JSX.Element {
    throw new Error("QA-0A react_boundary probe");
}
