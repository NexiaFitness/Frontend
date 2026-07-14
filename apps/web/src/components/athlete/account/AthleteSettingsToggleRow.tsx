/**
 * AthleteSettingsToggleRow.tsx — Fila con toggle premium (V13 notificaciones).
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    athleteToggleThumbClass,
    athleteToggleTrackClass,
} from "./athleteSettingsToggleStyles";

export interface AthleteSettingsToggleRowProps {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
    isLast?: boolean;
}

export const AthleteSettingsToggleRow: React.FC<AthleteSettingsToggleRowProps> = ({
    id,
    label,
    description,
    checked,
    disabled = false,
    onChange,
    isLast = false,
}) => {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-5 px-4 py-4",
                !isLast && "border-b border-border/50"
            )}
        >
            <div className="min-w-0 flex-1 space-y-1">
                <label
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium leading-snug text-foreground",
                        disabled && "opacity-60"
                    )}
                >
                    {label}
                </label>
                <p className="text-caption leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(athleteToggleTrackClass(checked, disabled), "shrink-0")}
            >
                <span className={athleteToggleThumbClass(checked)} aria-hidden />
            </button>
        </div>
    );
};
