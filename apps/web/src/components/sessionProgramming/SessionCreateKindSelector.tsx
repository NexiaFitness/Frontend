/**
 * D2 — Elección explícita Programa vs Sesión suelta (no inferida solo por cobertura de fecha).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";

export type SessionCreateKind = "program" | "standalone";

export interface SessionCreateKindSelectorProps {
    value: SessionCreateKind;
    onChange: (value: SessionCreateKind) => void;
    disabled?: boolean;
    className?: string;
}

export const SessionCreateKindSelector: React.FC<SessionCreateKindSelectorProps> = ({
    value,
    onChange,
    disabled = false,
    className,
}) => (
    <div
        role="radiogroup"
        aria-label="Tipo de sesión"
        className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", className)}
    >
        <span className="text-sm font-medium text-foreground">¿Qué quieres crear?</span>
        <div className="flex flex-wrap gap-2">
            <Button
                type="button"
                size="sm"
                variant={value === "program" ? "primary" : "outline"}
                disabled={disabled}
                aria-checked={value === "program"}
                role="radio"
                onClick={() => onChange("program")}
            >
                Programa
            </Button>
            <Button
                type="button"
                size="sm"
                variant={value === "standalone" ? "primary" : "outline"}
                disabled={disabled}
                aria-checked={value === "standalone"}
                role="radio"
                onClick={() => onChange("standalone")}
            >
                Sesión suelta
            </Button>
        </div>
    </div>
);
