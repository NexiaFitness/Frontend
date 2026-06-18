/**
 * AthleteSessionFilterChips.tsx — Filtros premium V02.
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_SESSION_FILTER_ROW,
    ATHLETE_SESSION_FILTER_CHIP,
    ATHLETE_SESSION_FILTER_CHIP_IDLE,
    ATHLETE_SESSION_FILTER_CHIP_SELECTED,
} from "./athleteSessionsPresentation";
import type { AthleteSessionFilter } from "@nexia/shared/utils/athlete/athleteSessionUtils";

const FILTER_OPTIONS: { id: AthleteSessionFilter; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "upcoming", label: "Próximas" },
    { id: "completed", label: "Completadas" },
    { id: "month", label: "Este mes" },
];

export interface AthleteSessionFilterChipsProps {
    value: AthleteSessionFilter;
    onChange: (filter: AthleteSessionFilter) => void;
}

export const AthleteSessionFilterChips: React.FC<AthleteSessionFilterChipsProps> = ({
    value,
    onChange,
}) => {
    return (
        <div className={ATHLETE_SESSION_FILTER_ROW}>
            {FILTER_OPTIONS.map((opt) => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange(opt.id)}
                    className={cn(
                        ATHLETE_SESSION_FILTER_CHIP,
                        value === opt.id
                            ? ATHLETE_SESSION_FILTER_CHIP_SELECTED
                            : ATHLETE_SESSION_FILTER_CHIP_IDLE
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};
