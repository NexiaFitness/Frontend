/**
 * AthleteSessionPlannedLoadBars — VOL/INT compact (Plan colors, optional sheet).
 */

import React, { useCallback, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { AthletePlanLoadBar } from "@/components/athlete/plan/AthletePlanLoadBar";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import {
    ATHLETE_LOAD_EXPLAINER_SHEET_BODY,
    ATHLETE_LOAD_EXPLAINER_SHEET_TITLE,
    ATHLETE_SESSION_PLANNED_LOAD_ROW,
    ATHLETE_SESSION_PLANNED_LOAD_TOUCH,
} from "@/components/athlete/athleteAgendaPresentation";
import {
    athletePlannedLoadAriaLabel,
    hasAthleteSessionPlannedLoad,
    normalizePlannedLoad1to10,
    readSessionPlannedLoad,
    type AthleteSessionPlannedLoad,
} from "@nexia/shared/utils/athlete/athleteSessionPlannedLoad";

export interface AthleteSessionPlannedLoadBarsProps {
    session: AthleteSessionPlannedLoad;
    className?: string;
    /** Agenda row: bars are decorative; preview/home: open explainer sheet. */
    interactive?: boolean;
}

export const AthleteSessionPlannedLoadBars: React.FC<AthleteSessionPlannedLoadBarsProps> = ({
    session,
    className,
    interactive = false,
}) => {
    const [open, setOpen] = useState(false);
    const triggerId = useId();

    const load = readSessionPlannedLoad(session);
    const volume = normalizePlannedLoad1to10(load.plannedVolume);
    const intensity = normalizePlannedLoad1to10(load.plannedIntensity);

    const handleOpen = useCallback(() => {
        if (!interactive) return;
        setOpen(true);
    }, [interactive]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    if (!hasAthleteSessionPlannedLoad(session)) return null;

    const bars = (
        <div className={cn(ATHLETE_SESSION_PLANNED_LOAD_ROW, className)} aria-hidden={!interactive}>
            {volume != null ? (
                <AthletePlanLoadBar label="VOL" level={volume} variant="compact" showValue={false} />
            ) : null}
            {intensity != null ? (
                <AthletePlanLoadBar
                    label="INT"
                    level={intensity}
                    tone="warning"
                    variant="compact"
                    showValue={false}
                />
            ) : null}
        </div>
    );

    const aria = athletePlannedLoadAriaLabel(session);

    if (!interactive) {
        return bars;
    }

    return (
        <>
            <button
                id={triggerId}
                type="button"
                onClick={handleOpen}
                className={ATHLETE_SESSION_PLANNED_LOAD_TOUCH}
                aria-label={aria ?? "Carga de la sesión"}
            >
                {bars}
            </button>
            <BottomSheet
                isOpen={open}
                onClose={handleClose}
                title={ATHLETE_LOAD_EXPLAINER_SHEET_TITLE}
            >
                <div className="space-y-4 text-sm text-muted-foreground">
                    {ATHLETE_LOAD_EXPLAINER_SHEET_BODY.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </BottomSheet>
        </>
    );
};
