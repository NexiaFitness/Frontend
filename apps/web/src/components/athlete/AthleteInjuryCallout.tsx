/**
 * AthleteInjuryCallout.tsx — Callout compacto lesión/conflicto (V04/V05).
 *
 * Contexto: variante compacta del Alert unificado (DESIGN_PREMIUM.md §5.2).
 * Acción «Consultar» = ghost-primary (05_ACTION_HIERARCHY.md §3.1).
 *
 * Notas de mantenimiento: no añadir iconos propios — el Alert ya aporta
 * NexiaSemanticIcon.
 *
 * @author Frontend Team
 * @since v9.0.0
 * @updated v9.2.1 — acción ghost-primary
 */

import React from "react";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

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
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={onConsult}
                    >
                        Consultar
                    </Button>
                ) : undefined
            }
        />
    );
};
