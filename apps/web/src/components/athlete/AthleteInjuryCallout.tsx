/**
 * AthleteInjuryCallout.tsx — Línea compacta lesión/conflicto (V04/V05, §10.6).
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
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
        <div
            className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
                isDanger
                    ? "border-destructive/35 bg-destructive/5"
                    : "border-warning/35 bg-warning/5",
                className
            )}
            role="status"
        >
            <AlertTriangle
                className={cn(
                    "size-4 shrink-0",
                    isDanger ? "text-destructive" : "text-warning"
                )}
                aria-hidden
            />
            <p className="min-w-0 flex-1 leading-snug text-muted-foreground">{message}</p>
            {onConsult && (
                <button
                    type="button"
                    onClick={onConsult}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                    Consultar
                </button>
            )}
        </div>
    );
};
