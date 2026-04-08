/**
 * PeriodBlockEmptyCallout.tsx — Estado vacío con marco discontinuo (reutilizable).
 *
 * Uso: bloques de periodización, lista de sesiones sin datos, coherencia → planificación, etc.
 * Si pasas `action`, se muestra en lugar del enlace «Ir a planificación» (`clientId`).
 */

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PeriodBlockEmptyIconDecoration } from "./PeriodBlockEmptyIconDecoration";
import {
    periodBlockDashedShellClassName,
    periodBlockEmptyCalloutOutlineCtaClassName,
} from "./periodBlockEmptyCallout.styles";

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
