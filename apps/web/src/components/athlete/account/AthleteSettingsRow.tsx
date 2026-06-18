/**
 * AthleteSettingsRow.tsx — Fila navegable o acción (V13 atleta).
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AthleteSettingsRowProps {
    label: string;
    hint?: string;
    icon?: LucideIcon;
    onClick: () => void;
    showChevron?: boolean;
    variant?: "default" | "destructive";
    /** Solo afecta al icono; label siempre `text-foreground`. */
    isLast?: boolean;
}

export const AthleteSettingsRow: React.FC<AthleteSettingsRowProps> = ({
    label,
    hint,
    icon: Icon,
    onClick,
    showChevron = true,
    variant = "default",
    isLast = false,
}) => {
    const isDestructive = variant === "destructive";

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3 px-4 py-4 text-left transition-colors",
                "hover:bg-surface-2/80 active:bg-surface-2 active:scale-[0.995] motion-reduce:active:scale-100",
                !isLast && "border-b border-border/50"
            )}
        >
            {Icon && (
                <span
                    className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg border backdrop-blur-sm",
                        isDestructive
                            ? "border-destructive/25 bg-destructive/10 text-destructive"
                            : "border-primary/25 bg-primary/10 text-primary"
                    )}
                    aria-hidden
                >
                    <Icon className="size-4" />
                </span>
            )}
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-snug text-foreground">
                    {label}
                </span>
                {hint && (
                    <span className="mt-1 block text-caption leading-relaxed text-muted-foreground">
                        {hint}
                    </span>
                )}
            </span>
            {showChevron && (
                <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground/70"
                    aria-hidden
                />
            )}
        </button>
    );
};
