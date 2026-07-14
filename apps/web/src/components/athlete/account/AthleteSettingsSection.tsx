/**
 * AthleteSettingsSection.tsx — Bloque con título de sección (V13 atleta).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { ATHLETE_SETTINGS_CARD } from "./athleteSettingsPresentation";
import { NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";

export interface AthleteSettingsSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    /** Rellena altura en columnas grid (dashboard admin). */
    stretch?: boolean;
}

export const AthleteSettingsSection: React.FC<AthleteSettingsSectionProps> = ({
    title,
    description,
    children,
    className,
    stretch = false,
}) => {
    return (
        <section
            className={cn(
                "flex flex-col space-y-3",
                stretch && "min-h-0 flex-1",
                className
            )}
            aria-label={title}
        >
            <AthleteSectionHeading
                title={title}
                as="h2"
                description={description}
                className="shrink-0"
            />
            <div
                className={cn(
                    ATHLETE_SETTINGS_CARD,
                    NEXIA_GLASS_CARD_DESKTOP,
                    stretch && "flex min-h-0 flex-1 flex-col"
                )}
            >
                {stretch ? (
                    <div className="flex flex-1 flex-col justify-between">{children}</div>
                ) : (
                    children
                )}
            </div>
        </section>
    );
};
