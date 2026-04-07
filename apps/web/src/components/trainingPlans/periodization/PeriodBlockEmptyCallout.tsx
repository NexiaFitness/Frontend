/**
 * PeriodBlockEmptyCallout.tsx — Estado vacío con marco discontinuo (reutilizable).
 *
 * Uso: bloques de periodización, lista de sesiones sin datos, coherencia → planificación, etc.
 * Si pasas `action`, se muestra en lugar del enlace «Ir a planificación» (`clientId`).
 */

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Mismo aspecto que el enlace «Ir a planificación» para botones u otros CTAs en el callout. */
export const periodBlockEmptyCalloutOutlineCtaClassName = cn(
    "inline-flex h-9 items-center justify-center rounded-md",
    "border border-primary bg-transparent px-4 text-sm font-medium text-primary",
    "transition-colors hover:bg-primary/10",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
);

/** Marco discontinuo reutilizable (mismo patrón visual que estados vacíos). */
export const periodBlockDashedShellClassName = cn(
    "rounded-lg border-2 border-dashed border-border/60 p-8"
);

/** Icono documento en círculo neutro (decoración del callout discontinuo). */
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

export interface PeriodBlockEmptyCalloutProps {
    /** Línea principal (text-sm). */
    primaryText: string;
    /** Línea secundaria (text-xs, tono más suave). */
    secondaryText: string;
    /** Si está definido y no hay `action`, muestra «Ir a planificación» hacia el perfil del cliente. */
    clientId?: number;
    /** CTA personalizada (ej. &lt;Button&gt;). Tiene prioridad sobre `clientId`. */
    action?: React.ReactNode;
    className?: string;
}

export const PeriodBlockEmptyCallout: React.FC<PeriodBlockEmptyCalloutProps> = ({
    primaryText,
    secondaryText,
    clientId,
    action,
    className,
}) => {
    const showPlanningCta =
        action == null && clientId != null && clientId > 0;
    const planningHref = showPlanningCta ? `/dashboard/clients/${clientId}?tab=planning` : "";

    return (
        <div
            className={cn(
                periodBlockDashedShellClassName,
                "flex flex-col items-center justify-center space-y-3 text-center",
                className
            )}
        >
            <PeriodBlockEmptyIconDecoration />

            <p className="text-sm text-muted-foreground">{primaryText}</p>
            <p className="text-xs text-muted-foreground/70 max-w-sm">{secondaryText}</p>

            {action != null ? (
                <div className="flex flex-wrap items-center justify-center gap-2">{action}</div>
            ) : (
                showPlanningCta && (
                    <Link to={planningHref} className={periodBlockEmptyCalloutOutlineCtaClassName}>
                        Ir a planificación
                    </Link>
                )
            )}
        </div>
    );
};
