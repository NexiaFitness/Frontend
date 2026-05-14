/**
 * DropStepRow.tsx — Fila MAIN / DROP n con conector «SIGUIENTE DROP» (Lovable dropset).
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    CONSTRUCTOR_DROP_CONNECTOR_CLASS,
    CONSTRUCTOR_DROP_CONNECTOR_LABEL_CLASS,
    CONSTRUCTOR_DROP_MAIN_RING_CLASS,
    CONSTRUCTOR_DROP_STEP_RING_CLASS,
} from "./constructorCardStyles";

export interface DropStepRowProps {
    stepLabel: string;
    isMain?: boolean;
    isLast?: boolean;
    showConnectorLabel?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const DropStepRow: React.FC<DropStepRowProps> = ({
    stepLabel,
    isMain = false,
    isLast = false,
    showConnectorLabel = false,
    children,
    className,
}) => (
    <div className={cn("grid grid-cols-[40px_1fr] gap-3", className)}>
        <div className="relative flex justify-center">
            <span
                className={
                    isMain ? CONSTRUCTOR_DROP_MAIN_RING_CLASS : CONSTRUCTOR_DROP_STEP_RING_CLASS
                }
            >
                {stepLabel}
            </span>
            {!isLast ? (
                <>
                    <span className={CONSTRUCTOR_DROP_CONNECTOR_CLASS} aria-hidden />
                    {showConnectorLabel ? (
                        <span className={CONSTRUCTOR_DROP_CONNECTOR_LABEL_CLASS}>
                            Siguiente drop
                        </span>
                    ) : null}
                </>
            ) : null}
        </div>
        <div className="min-w-0 py-0.5">{children}</div>
    </div>
);
