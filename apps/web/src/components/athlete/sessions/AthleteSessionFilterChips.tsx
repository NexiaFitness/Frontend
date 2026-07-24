/**
 * AthleteSessionFilterChips.tsx — Filtros premium V02 (delega en TabsBar).
 */

import React from "react";
import { TabsBar } from "@/components/ui/tabs";
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
        <TabsBar
            ariaLabel="Filtrar sesiones"
            distribute="equal"
            items={FILTER_OPTIONS}
            value={value}
            onChange={(id) => onChange(id as AthleteSessionFilter)}
        />
    );
};
