/**
 * ConstructorStepHeader.tsx — Cabecera reutilizable de un paso del constructor.
 *
 * Usado en PeriodizationPanel y futuros flujos de bloque (edición, wizard, etc.).
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface ConstructorStepHeaderProps {
    stepTitle: string;
    required?: boolean;
    /** Rango del bloque; esquina superior derecha del bloque de cabecera. */
    rangeLabel?: string;
    trailing?: React.ReactNode;
    className?: string;
}

export const ConstructorStepHeader: React.FC<ConstructorStepHeaderProps> = ({
    stepTitle,
    required = false,
    rangeLabel,
    trailing,
    className,
}) => (
    <div
        className={cn(
            "shrink-0 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 pb-1 min-w-0",
            className,
        )}
    >
        <p className="col-start-1 row-start-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Constructor
        </p>
        {rangeLabel ? (
            <p
                className="col-start-2 row-start-1 text-sm font-semibold text-primary tabular-nums text-right self-start leading-none"
                aria-label={`Rango del bloque: ${rangeLabel}`}
            >
                {rangeLabel}
            </p>
        ) : null}
        <div className="col-start-1 row-start-2 min-w-0">
            <p className="text-sm font-semibold text-foreground">
                {stepTitle}
                {required && (
                    <span
                        className="ml-0.5 text-destructive font-bold"
                        aria-hidden
                    >
                        *
                    </span>
                )}
            </p>
        </div>
        {trailing ? (
            <div className="col-start-2 row-start-2 self-center">{trailing}</div>
        ) : null}
    </div>
);
