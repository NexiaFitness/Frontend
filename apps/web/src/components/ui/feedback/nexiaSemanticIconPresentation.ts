/**
 * nexiaSemanticIconPresentation.ts — Tinte y tamaño de iconos en Alert / avisos.
 *
 * Contrato diseño (DESIGN_PREMIUM.md §5.2): solo trazo Lucide; prohibido shell
 * circular / caja alrededor del glyph; error = CircleAlert (no XCircle/CircleX).
 *
 * @author Frontend Team
 * @since v9.1.0
 * @updated v9.2.1 — error CircleAlert; tinte destructive/80
 */

import { cn } from "@/lib/utils";

export type NexiaSemanticTone = "info" | "success" | "warning" | "error";

const TONE_CLASS: Record<NexiaSemanticTone, string> = {
    info: "text-primary",
    success: "text-[hsl(var(--success))]",
    warning: "text-[hsl(var(--warning))]",
    error: "text-destructive/80",
};

export function nexiaSemanticIconClass(
    tone: NexiaSemanticTone,
    size: "sm" | "md" = "md",
): string {
    const dim = size === "sm" ? "size-3.5" : "size-5";
    return cn(dim, "shrink-0 stroke-[1.75]", TONE_CLASS[tone]);
}
