/**
 * DropStepRow.tsx — Fila MAIN / DROP n con conector vertical (sin texto intermedio).
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    CONSTRUCTOR_DROP_CONNECTOR_CLASS,
    CONSTRUCTOR_DROP_MAIN_RING_CLASS,
    CONSTRUCTOR_DROP_STEP_RING_CLASS,
} from "./constructorCardStyles";

export interface DropStepRowProps {
    stepIndex: number;
    isLast?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const DropStepRow: React.FC<DropStepRowProps> = ({
    stepIndex,
    isLast = false,
    children,
    className,
}) => {
    const isMain = stepIndex === 0;

    return (
        <div className={cn("grid grid-cols-[44px_1fr] gap-3", className)}>
            <div className="relative flex h-full min-h-[2.25rem] justify-center">
                {isMain ? (
                    <span className={CONSTRUCTOR_DROP_MAIN_RING_CLASS}>MAIN</span>
                ) : (
                    <span className={CONSTRUCTOR_DROP_STEP_RING_CLASS}>
                        <span className="text-[7px] font-semibold uppercase leading-none tracking-wide">
                            Drop
                        </span>
                        <span className="text-[11px] font-bold leading-none">{stepIndex}</span>
                    </span>
                )}
                {!isLast ? (
                    <span className={CONSTRUCTOR_DROP_CONNECTOR_CLASS} aria-hidden />
                ) : null}
            </div>
            <div className="min-w-0 py-0.5">{children}</div>
        </div>
    );
};
