/**
 * GroupedExerciseRow.tsx — Fila A1/A2 con conector vertical.
 * Contexto: SupersetBlock y futuros giant set.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface GroupedExerciseRowProps {
    slotLabel: string;
    isLast?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const GroupedExerciseRow: React.FC<GroupedExerciseRowProps> = ({
    slotLabel,
    isLast = false,
    children,
    className,
}) => (
    <div className={cn("grid grid-cols-[52px_1fr] gap-3", className)}>
        <div className="relative flex justify-center pt-1">
            <span className="z-10 flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-[10px] font-bold text-primary">
                {slotLabel}
            </span>
            {!isLast ? (
                <span className="absolute top-8 bottom-0 w-px bg-border" aria-hidden />
            ) : null}
        </div>
        <div className="min-w-0">{children}</div>
    </div>
);
