/**
 * AthletePrBanner.tsx — Celebración récord personal en ejecución (V05 F2).
 */

import React from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AthletePrBannerProps {
    exerciseName: string;
    weight: number;
    previousMaxWeight: number | null;
    className?: string;
}

export const AthletePrBanner: React.FC<AthletePrBannerProps> = ({
    exerciseName,
    weight,
    previousMaxWeight,
    className,
}) => {
    return (
        <div
            className={cn(
                "mb-4 flex items-start gap-3 rounded-lg border border-success/40 bg-success/10 px-4 py-3",
                "animate-in fade-in slide-in-from-top-2 duration-300",
                className
            )}
            role="status"
            aria-live="polite"
        >
            <Trophy className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
            <div className="min-w-0">
                <p className="font-semibold text-success">¡Nuevo récord!</p>
                <p className="text-sm text-foreground">
                    {exerciseName}: {weight} kg
                    {previousMaxWeight != null && (
                        <span className="text-muted-foreground">
                            {" "}
                            (antes {previousMaxWeight} kg)
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
};
