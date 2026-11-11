/**
 * removableChipPresentation.ts — Chip de un valor elegido, con su botón de quitar.
 *
 * Contexto: H10, ficha admin (músculos sinergistas y estabilizadores, patrones,
 * articulaciones, material y etiquetas). Reutilizable en cualquier selección múltiple.
 * Notas de mantenimiento: 44 px de alto en móvil (DESIGN_PREMIUM §2.2 d) y 32 px desde
 * `sm`. El tono del patrón llega de patternBadgePresentation, no se redefine aquí.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { cn } from "@/lib/utils";

export type RemovableChipTone = "neutral" | "primary";

const CHIP_BASE = cn(
    "inline-flex min-h-touch max-w-full items-center gap-1.5 rounded-full border pl-3 pr-1 text-sm",
    "sm:min-h-8"
);

export const REMOVABLE_CHIP_TONE: Record<RemovableChipTone, string> = {
    neutral: "border-border/70 bg-surface-2/50 text-foreground",
    primary: "border-primary/20 bg-primary/10 text-primary",
};

export function removableChipClass(tone: RemovableChipTone, toneClassName?: string): string {
    return cn(CHIP_BASE, toneClassName ?? REMOVABLE_CHIP_TONE[tone]);
}

export const REMOVABLE_CHIP_LABEL = "min-w-0 truncate";

export const REMOVABLE_CHIP_REMOVE = cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground",
    "transition-colors hover:bg-destructive/15 hover:text-destructive",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    "sm:size-7 [&_svg]:size-3.5"
);
