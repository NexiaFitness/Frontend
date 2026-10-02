/**
 * AthleteInjuryCallout.tsx — Callout compacto lesión/conflicto (V04/V05).
 *
 * Contexto: variante compacta del Alert unificado (DESIGN_PREMIUM.md §5.2).
 * Sustituye el callout a mano con AlertTriangle duplicado.
 *
 * Notas de mantenimiento: no añadir iconos propios — el Alert ya aporta
 * NexiaSemanticIcon. Acción «Consultar» vía prop action del Alert.
 *
 * @author Frontend Team
 * @since v9.0.0
 * @updated v9.2.0 — Alert compact
 */

import React from "react";
import { Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { AUTH_LINK } from "@/components/auth/authFormPresentation";

export interface AthleteInjuryCalloutProps {
    message: string;
    isDanger?: boolean;
    onConsult?: () => void;
    className?: string;
}

export const AthleteInjuryCallout: React.FC<AthleteInjuryCalloutProps> = ({
    message,
    isDanger = false,
    onConsult,
    className,
}) => {
    return (
        <Alert
            variant={isDanger ? "error" : "warning"}
            compact
            className={cn(className)}
            title={message}
            action={
                onConsult ? (
                    <button
                        type="button"
                        onClick={onConsult}
                        className={cn(AUTH_LINK, "shrink-0 text-xs")}
                    >
                        Consultar
                    </button>
                ) : undefined
            }
        />
    );
};
