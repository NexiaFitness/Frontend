/**
 * nexiaSwitchPresentation.ts — Interruptor premium (track glass + pulgar cyan).
 *
 * Contexto: nació como el toggle V13 de los ajustes del atleta; H10 lo sube a ui/forms
 * para que el interruptor «Revisado» de la ficha admin use la misma receta (DESIGN_PREMIUM:
 * un solo lenguaje para todos los roles). Lo consumen NexiaSwitch y AthleteSettingsToggleRow.
 * Notas de mantenimiento: solo clases; el comportamiento (role="switch") va en el componente.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { cn } from "@/lib/utils";

/** Track compacto: h-6 × w-10 (menor que iOS nativo, centrado en fila). */
export function nexiaSwitchTrackClass(checked: boolean, disabled: boolean): string {
    return cn(
        "relative inline-flex h-6 w-10 shrink-0 rounded-full border transition-all duration-300 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        disabled && "cursor-not-allowed opacity-50",
        checked
            ? "border-primary/30 bg-primary/15 shadow-[inset_0_1px_0] shadow-primary/10 backdrop-blur-sm"
            : "border-border/60 bg-muted/30 backdrop-blur-sm"
    );
}

export function nexiaSwitchThumbClass(checked: boolean): string {
    return cn(
        "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition-all duration-300 motion-reduce:transition-none",
        checked
            ? "left-[calc(100%-1.125rem)] bg-gradient-to-br from-[hsl(190,100%,48%)] to-[hsl(210,100%,56%)] shadow-[0_1px_8px] shadow-primary/40"
            : "left-0.5 bg-muted-foreground/55"
    );
}

/** Interruptor con su etiqueta al lado; en móvil, toda la fila es objetivo táctil. */
export const NEXIA_SWITCH_ROW = cn(
    "inline-flex min-h-touch cursor-pointer select-none items-center gap-2.5 sm:min-h-0"
);

export const NEXIA_SWITCH_LABEL = "cursor-pointer text-sm font-medium text-foreground";
