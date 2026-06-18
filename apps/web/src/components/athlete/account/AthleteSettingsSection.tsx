/**
 * AthleteSettingsSection.tsx — Bloque con título de sección (V13 atleta).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { ATHLETE_SETTINGS_CARD } from "./athleteSettingsPresentation";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";

export interface AthleteSettingsSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export const AthleteSettingsSection: React.FC<AthleteSettingsSectionProps> = ({
    title,
    description,
    children,
    className,
}) => {
    return (
        <section className={cn("space-y-3", className)} aria-label={title}>
            <AthleteSectionHeading title={title} as="h2" description={description} />
            <div className={ATHLETE_SETTINGS_CARD}>{children}</div>
        </section>
    );
};
