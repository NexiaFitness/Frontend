/**
 * AthleteInjuryCallout.tsx — Línea compacta lesión/conflicto (V04/V05, §10.6).
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
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
        <div
            className={cn(
                "relative flex items-center gap-2.5 overflow-hidden rounded-lg border px-3 py-2.5",
                "backdrop-blur-sm shadow-[inset_0_1px_0] shadow-foreground/[0.05]",
                isDanger
                    ? "border-destructive/30 bg-destructive/8"
                    : "border-warning/28 bg-warning/8",
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
            <p className="min-w-0 flex-1 text-sm leading-snug text-foreground/90">
                {message}
            </p>
            {onConsult && (
                <button
                    type="button"
                    onClick={onConsult}
                    className={cn(AUTH_LINK, "shrink-0 text-xs")}
                >
                    Consultar
                </button>
            )}
        </div>
    );
};
