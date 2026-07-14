/**
 * SegmentButton — Botón de segmento/opción reutilizable
 *
 * Usado para elegir una opción entre varias (ej. Baja/Media/Alta, días 1-7, L-D).
 * Estado seleccionado: fondo azul suave (bg-primary/20, border-primary/30, text-primary).
 * Estado no seleccionado: borde neutro, hover suave.
 *
 * @author Frontend Team
 * @since v6.x
 */

import React from "react";
import { cn } from "@/lib/utils";

export type SegmentButtonSize = "sm" | "md";

interface SegmentButtonProps {
    /** Si está seleccionado (estilo azul marcado) */
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    /** "md" = flex-1 px-4 py-1.5; "sm" = min-w compacto px-3 py-1.5 */
    size?: SegmentButtonSize;
    className?: string;
    type?: "button" | "submit";
    disabled?: boolean;
}

/** Misma caja en ambos estados: sin ring-offset ni cambio de padding al marcar. */
const baseClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg border box-border font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";

const selectedClass =
  "border-primary/30 bg-primary/20 text-primary";

const unselectedClass =
  "border-border/60 bg-background text-muted-foreground/75 hover:border-border hover:bg-muted/40 hover:text-muted-foreground";

const sizeClass: Record<SegmentButtonSize, string> = {
  md: "h-9 flex-1 px-4 text-sm",
  sm: "h-8 min-w-[2.5rem] px-3 text-xs",
};

export const SegmentButton: React.FC<SegmentButtonProps> = ({
    selected,
    onClick,
    children,
    size = "md",
    className,
    type = "button",
    disabled = false,
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                baseClass,
                sizeClass[size],
                selected ? selectedClass : unselectedClass,
                className
            )}
        >
            {children}
        </button>
    );
};
