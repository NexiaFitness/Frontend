/**
 * ClientNoActivePlanEmpty — Sin plan activo (premium compartido).
 *
 * Mismo shell que biblioteca/planificación: glass, glow, rim, copy OVERVIEW_ZONE_TITLES.
 */

import React from "react";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import {
    ATHLETE_EMPTY_STATE_ACTION,
    ATHLETE_EMPTY_STATE_ICON_WRAP,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import {
    TEMPLATE_LIBRARY_EMPTY_BODY,
    TEMPLATE_LIBRARY_EMPTY_GLOW,
    TEMPLATE_LIBRARY_EMPTY_SHELL,
    TEMPLATE_LIBRARY_EMPTY_TITLE,
    TEMPLATE_LIBRARY_PRIMARY_CTA,
} from "@/components/trainingPlans/templateLibraryPresentation";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import { OVERVIEW_ZONE_TITLES } from "./clientOverviewPresentation";

export interface ClientNoActivePlanEmptyProps {
    onPlanificar?: () => void;
    className?: string;
    /** data-testid del contenedor (p. ej. overview vs planning tab). */
    testId?: string;
}

export const ClientNoActivePlanEmpty: React.FC<ClientNoActivePlanEmptyProps> = ({
    onPlanificar,
    className,
    testId = "client-no-active-plan-empty",
}) => {
    return (
        <div
            className={cn(TEMPLATE_LIBRARY_EMPTY_SHELL, "relative py-10 sm:py-12", className)}
            data-testid={testId}
        >
            <NexiaGlassAccentRim />
            <div className={TEMPLATE_LIBRARY_EMPTY_GLOW} aria-hidden />
            <div className={ATHLETE_EMPTY_STATE_ICON_WRAP} aria-hidden>
                <CalendarRange className="size-7 shrink-0" />
            </div>
            <p className={cn(TEMPLATE_LIBRARY_EMPTY_TITLE, "relative z-[1]")}>
                {OVERVIEW_ZONE_TITLES.planEmpty}
            </p>
            <p className={cn(TEMPLATE_LIBRARY_EMPTY_BODY, "relative z-[1]")}>
                {OVERVIEW_ZONE_TITLES.planEmptyDetail}
            </p>
            {onPlanificar ? (
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className={cn(
                        ATHLETE_EMPTY_STATE_ACTION,
                        TEMPLATE_LIBRARY_PRIMARY_CTA,
                        "relative z-[1]",
                    )}
                    onClick={onPlanificar}
                    aria-label="Planificar entrenamiento"
                >
                    Planificar
                </Button>
            ) : null}
        </div>
    );
};
