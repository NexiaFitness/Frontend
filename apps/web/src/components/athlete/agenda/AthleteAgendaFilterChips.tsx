/**
 * AthleteAgendaFilterChips — Todo · Entrenos · Citas (TabsBar premium).
 */

import React from "react";
import { TabsBar } from "@/components/ui/tabs";
import type { AthleteAgendaFilter } from "@nexia/shared/utils/athlete/athleteAgendaViewUtils";

const FILTER_OPTIONS: { id: AthleteAgendaFilter; label: string }[] = [
    { id: "all", label: "Todo" },
    { id: "training", label: "Entrenos" },
    { id: "appointments", label: "Citas" },
];

export interface AthleteAgendaFilterChipsProps {
    value: AthleteAgendaFilter;
    onChange: (value: AthleteAgendaFilter) => void;
}

export const AthleteAgendaFilterChips: React.FC<AthleteAgendaFilterChipsProps> = ({
    value,
    onChange,
}) => (
    <TabsBar
        ariaLabel="Filtrar agenda"
        distribute="equal"
        items={FILTER_OPTIONS}
        value={value}
        onChange={(id) => onChange(id as AthleteAgendaFilter)}
    />
);
