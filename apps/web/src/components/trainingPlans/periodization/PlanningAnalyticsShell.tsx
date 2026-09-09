/**
 * PlanningAnalyticsShell.tsx — Modo analytics F5: gráficas de periodización.
 */

import React from "react";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { PeriodizationCharts } from "./PeriodizationCharts";
import { PLANNING_SHELL_SECTION_CLASS } from "./planningShellPresentation";

interface Props {
    blocks: PlanPeriodBlock[];
    catalog: PhysicalQuality[];
    onBack: () => void;
}

export const PlanningAnalyticsShell: React.FC<Props> = ({
    blocks,
    catalog,
    onBack,
}) => (
    <section
        className={PLANNING_SHELL_SECTION_CLASS}
        data-testid="planning-analytics-shell"
    >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <PageTitle titleAs="h3" title="Análisis de periodización" />
            <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="planning-analytics-back"
                onClick={onBack}
            >
                Volver a planificación
            </Button>
        </div>
        <PeriodizationCharts blocks={blocks} catalog={catalog} />
    </section>
);
