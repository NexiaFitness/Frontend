/**
 * GroupedExerciseRow.tsx — Fila A1/A2 con anillo y conector (Lovable).
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    CONSTRUCTOR_SLOT_CONNECTOR_CLASS,
    CONSTRUCTOR_SLOT_RING_CLASS,
} from "./constructorCardStyles";

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
    <div className={cn("grid grid-cols-[40px_1fr] gap-3", className)}>
        <div className="relative flex justify-center">
            <span className={CONSTRUCTOR_SLOT_RING_CLASS}>{slotLabel}</span>
            {!isLast ? <span className={CONSTRUCTOR_SLOT_CONNECTOR_CLASS} aria-hidden /> : null}
        </div>
        <div className="min-w-0 py-0.5">{children}</div>
    </div>
);
