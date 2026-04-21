/**
 * SessionExerciseOrderHeader — Cabecera reutilizable: orden + nombre de ejercicio (sesión).
 * Clases alineadas con el patrón de diseño Nexia (badge soft + título primary).
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface SessionExerciseOrderHeaderProps {
    order: number;
    title: string;
    /** Contenido a la derecha (p. ej. reloj + descanso) */
    trailing?: React.ReactNode;
    className?: string;
    titleClassName?: string;
}

export const SessionExerciseOrderHeader: React.FC<SessionExerciseOrderHeaderProps> = ({
    order,
    title,
    trailing,
    className,
    titleClassName,
}) => {
    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3",
                trailing && "justify-between",
                className
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary tabular-nums">
                    {order}
                </span>
                <div className="min-w-0 flex-1">
                    <span
                        className={cn(
                            "text-sm font-semibold text-primary line-clamp-3 leading-snug",
                            titleClassName
                        )}
                    >
                        {title}
                    </span>
                </div>
            </div>
            {trailing}
        </div>
    );
};
