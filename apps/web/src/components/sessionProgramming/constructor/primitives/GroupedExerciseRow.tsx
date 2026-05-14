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
    CONSTRUCTOR_FOR_TIME_SLOT_CONNECTOR_CLASS,
    CONSTRUCTOR_FOR_TIME_SLOT_RING_CLASS,
    CONSTRUCTOR_GIANT_SET_SLOT_CONNECTOR_CLASS,
    CONSTRUCTOR_GIANT_SET_SLOT_RING_CLASS,
    CONSTRUCTOR_AMRAP_SLOT_CONNECTOR_CLASS,
    CONSTRUCTOR_AMRAP_SLOT_RING_CLASS,
} from "./constructorCardStyles";

export type GroupedExerciseRowVariant = "primary" | "for_time" | "giant_set" | "amrap";

function resolveSlotRingClass(variant: GroupedExerciseRowVariant): string {
    if (variant === "for_time") return CONSTRUCTOR_FOR_TIME_SLOT_RING_CLASS;
    if (variant === "giant_set") return CONSTRUCTOR_GIANT_SET_SLOT_RING_CLASS;
    if (variant === "amrap") return CONSTRUCTOR_AMRAP_SLOT_RING_CLASS;
    return CONSTRUCTOR_SLOT_RING_CLASS;
}

function resolveSlotConnectorClass(variant: GroupedExerciseRowVariant): string {
    if (variant === "for_time") return CONSTRUCTOR_FOR_TIME_SLOT_CONNECTOR_CLASS;
    if (variant === "giant_set") return CONSTRUCTOR_GIANT_SET_SLOT_CONNECTOR_CLASS;
    if (variant === "amrap") return CONSTRUCTOR_AMRAP_SLOT_CONNECTOR_CLASS;
    return CONSTRUCTOR_SLOT_CONNECTOR_CLASS;
}

export interface GroupedExerciseRowProps {
    slotLabel: string;
    isLast?: boolean;
    variant?: GroupedExerciseRowVariant;
    children: React.ReactNode;
    className?: string;
}

export const GroupedExerciseRow: React.FC<GroupedExerciseRowProps> = ({
    slotLabel,
    isLast = false,
    variant = "primary",
    children,
    className,
}) => (
    <div className={cn("grid grid-cols-[40px_1fr] gap-3", className)}>
        <div className="relative flex justify-center">
            <span className={resolveSlotRingClass(variant)}>{slotLabel}</span>
            {!isLast ? (
                <span className={resolveSlotConnectorClass(variant)} aria-hidden />
            ) : null}
        </div>
        <div className="min-w-0 py-0.5">{children}</div>
    </div>
);
