/**
 * ConstructorBlockShell.tsx — Contenedor visual de un bloque-card en el constructor.
 * Contexto: envuelve el constructor específico por setType; cabecera con badge de tipo.
 * Notas de mantenimiento: sin acciones Lovable (duplicar/colapsar); notas de bloque en fases posteriores.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { SET_TYPE_LABELS, type SetType } from "@nexia/shared/types/sessionProgramming";
import { cn } from "@/lib/utils";

export interface ConstructorBlockShellProps {
    setType: SetType;
    children: React.ReactNode;
    className?: string;
}

export const ConstructorBlockShell: React.FC<ConstructorBlockShellProps> = ({
    setType,
    children,
    className,
}) => (
    <div
        className={cn(
            "rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden",
            className
        )}
    >
        <div className="flex items-center px-4 py-2 border-b border-border bg-surface/30">
            <span className="inline-flex items-center rounded-full border border-primary/40 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                {SET_TYPE_LABELS[setType]}
            </span>
        </div>
        <div>{children}</div>
    </div>
);
