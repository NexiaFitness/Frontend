/**
 * AthletePeriodizationStrip.tsx — Contexto de plan bajo el header.
 */

import React from "react";
import type { PeriodizationStripCopy } from "@nexia/shared/utils/athlete/athletePeriodizationCopy";

export interface AthletePeriodizationStripProps {
    strip: PeriodizationStripCopy;
}

export const AthletePeriodizationStrip: React.FC<AthletePeriodizationStripProps> = ({
    strip,
}) => {
    return (
        <p
            className="truncate text-sm text-muted-foreground"
            aria-label="Contexto del plan"
        >
            {strip.line}
        </p>
    );
};
