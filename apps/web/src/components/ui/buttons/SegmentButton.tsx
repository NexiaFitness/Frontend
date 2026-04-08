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

const selectedClass =
  "rounded-lg border border-primary/30 bg-primary/20 text-primary font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const unselectedClass =
  "rounded-lg border border-border bg-background text-foreground font-medium transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const sizeClass: Record<SegmentButtonSize, string> = {
  md: "flex-1 px-4 py-1.5 text-sm",
  sm: "min-w-[2.5rem] px-3 py-1.5 text-sm",
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
                selected ? selectedClass : unselectedClass,
                sizeClass[size],
                className
            )}
        >
            {children}
        </button>
    );
};
