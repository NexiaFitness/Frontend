/**
 * Icono documento en círculo neutro (decoración del callout discontinuo).
 */

import React from "react";

export const PeriodBlockEmptyIconDecoration: React.FC = () => (
    <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted/50 ring-1 ring-border/40"
        aria-hidden
    >
        <svg
            className="h-5 w-5 shrink-0 text-muted-foreground/55"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
        </svg>
    </div>
);
