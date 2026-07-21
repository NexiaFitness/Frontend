/**
 * ClientOverviewRelationCollapsible.tsx — Zona D relación colapsada (UX-OVERVIEW v2 F3).
 */

import React, { useState } from "react";
import type { ClientRatingOut } from "@nexia/shared/types/client";
import type { HabitInsightsOut } from "@nexia/shared/types/habits";
import { CollapsibleFormGroup } from "@/components/ui/forms/CollapsibleFormGroup";
import { Button } from "@/components/ui/buttons";
import { ClientOverviewRatingModal } from "./ClientOverviewRatingModal";
import {
    OVERVIEW_SECTION_SHELL,
    OVERVIEW_ZONE_TITLES,
} from "./clientOverviewPresentation";
import { PLATFORM_FIELD_VALUE, PLATFORM_SPEC_GRID } from "@/components/ui/surface/platformPremiumPresentation";
import { TYPOGRAPHY } from "@/utils/typography";

export interface ClientOverviewRelationCollapsibleProps {
    clientId: number;
    habitInsights: HabitInsightsOut | null;
    lastRating: ClientRatingOut | null;
}

function formatRatingDate(iso: string): string {
    return new Date(iso).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export const ClientOverviewRelationCollapsible: React.FC<
    ClientOverviewRelationCollapsibleProps
> = ({ clientId, habitInsights, lastRating }) => {
    const [ratingOpen, setRatingOpen] = useState(false);
    const showHabits = (habitInsights?.active_habits ?? 0) > 0;

    return (
        <>
            <div className={OVERVIEW_SECTION_SHELL} data-testid="client-overview-relation">
                <CollapsibleFormGroup
                    title={OVERVIEW_ZONE_TITLES.relation}
                    defaultOpen={false}
                >
                    <div className="space-y-6 pt-2">
                        <div>
                            <p className={TYPOGRAPHY.labelSmall}>Satisfacción</p>
                            {lastRating ? (
                                <p className={PLATFORM_FIELD_VALUE}>
                                    {lastRating.rating}/5 · {formatRatingDate(lastRating.rating_date)}
                                    {lastRating.comment ? ` — ${lastRating.comment}` : ""}
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Sin valoraciones registradas.
                                </p>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => setRatingOpen(true)}
                            >
                                Registrar valoración
                            </Button>
                        </div>

                        {showHabits && habitInsights && (
                            <div>
                                <p className={TYPOGRAPHY.labelSmall}>Hábitos</p>
                                <div className={PLATFORM_SPEC_GRID}>
                                    <div>
                                        <p className={TYPOGRAPHY.labelSmall}>Activos</p>
                                        <p className={PLATFORM_FIELD_VALUE}>
                                            {habitInsights.active_habits}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={TYPOGRAPHY.labelSmall}>Cumplimiento</p>
                                        <p className={PLATFORM_FIELD_VALUE}>
                                            {habitInsights.average_completion.toFixed(0)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className={TYPOGRAPHY.labelSmall}>Mejor racha</p>
                                        <p className={PLATFORM_FIELD_VALUE}>
                                            {habitInsights.best_streak} días
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleFormGroup>
            </div>

            <ClientOverviewRatingModal
                isOpen={ratingOpen}
                onClose={() => setRatingOpen(false)}
                clientId={clientId}
            />
        </>
    );
};
