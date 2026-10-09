/**
 * AthletePlanQualitiesSection.tsx — Enfoque del mes (gráfico premium + colores catálogo).
 */

import React, { useMemo } from "react";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import type { TrainingPlanDistributionItem } from "@nexia/shared/types/trainingAnalytics";
import { athletePlanQualityDisplayName } from "@nexia/shared/utils/athlete/athletePlanViewUtils";
import {
    getPhysicalQualityColor,
    resolvePhysicalQualitySlug,
} from "@nexia/shared/utils/physicalQualityColors";
import {
    AthletePlanQualityFocusChart,
    type AthletePlanQualityChartItem,
} from "./AthletePlanQualityFocusChart";

export interface AthletePlanQualitiesSectionProps {
    qualities: TrainingPlanDistributionItem[];
}

export const AthletePlanQualitiesSection: React.FC<AthletePlanQualitiesSectionProps> = ({
    qualities,
}) => {
    const { data: catalog = [] } = useGetPhysicalQualitiesQuery();

    const items = useMemo((): AthletePlanQualityChartItem[] => {
        return qualities
            .filter((q) => q.percentage > 0)
            .map((q) => {
                const slug = resolvePhysicalQualitySlug(q.name, catalog);
                const catalogEntry = catalog.find(
                    (c) =>
                        c.slug === slug ||
                        c.name.trim().toLowerCase() === q.name.trim().toLowerCase()
                );
                const color = getPhysicalQualityColor(slug, {
                    displayOrder: catalogEntry?.display_order,
                });
                const label = athletePlanQualityDisplayName(q.name);
                return {
                    key: slug,
                    label,
                    shortLabel: label,
                    percentage: Math.round(q.percentage),
                    colorHex: color.hex,
                };
            })
            .sort((a, b) => b.percentage - a.percentage);
    }, [qualities, catalog]);

    if (items.length === 0) return null;

    return (
        <section aria-label="Enfoque del mes">
            <AthletePlanQualityFocusChart items={items} />
        </section>
    );
};
