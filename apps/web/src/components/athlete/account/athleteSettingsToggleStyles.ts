/**
 * athleteSettingsToggleStyles.ts — Toggle V13 alineado con DESIGN.md primary (cyan glass).
 */

import { cn } from "@/lib/utils";

/** Track compacto: h-6 × w-10 (menor que iOS nativo, centrado en fila). */
export function athleteToggleTrackClass(checked: boolean, disabled: boolean): string {
    return cn(
        "relative inline-flex h-6 w-10 shrink-0 rounded-full border transition-all duration-300 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        disabled && "cursor-not-allowed opacity-50",
        checked
            ? "border-primary/30 bg-primary/15 shadow-[inset_0_1px_0] shadow-primary/10 backdrop-blur-sm"
            : "border-border/60 bg-muted/30 backdrop-blur-sm"
    );
}

export function athleteToggleThumbClass(checked: boolean): string {
    return cn(
        "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition-all duration-300 motion-reduce:transition-none",
        checked
            ? "left-[calc(100%-1.125rem)] bg-gradient-to-br from-[hsl(190,100%,48%)] to-[hsl(210,100%,56%)] shadow-[0_1px_8px] shadow-primary/40"
            : "left-0.5 bg-muted-foreground/55"
    );
}
