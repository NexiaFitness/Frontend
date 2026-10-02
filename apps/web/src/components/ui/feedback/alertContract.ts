/**
 * alertContract.ts — Contrato puro del Alert unificado (sin React ni CSS).
 *
 * Contexto: capa de feedback única (DESIGN_PREMIUM.md §3, §5.2). Vive en apps/web
 * como diferimiento consciente respecto a agent.md §6 (packages/ui-primitives);
 * la extracción futura es mover este archivo sin cambiar el contrato.
 *
 * Notas de mantenimiento: ARIA por severidad — error = alert/assertive;
 * warning|info|success = status/polite. No mezclar con Toast ni ErrorBoundary.
 *
 * @author Frontend Team
 * @since v9.2.0
 */

export type AlertVariant = "info" | "success" | "warning" | "error";

export type AlertAriaRole = "alert" | "status";

export type AlertAriaLive = "assertive" | "polite";

/** Rol ARIA según variante (decisión Nelson: ARIA correcta, no compatibilidad tests). */
export function alertAriaRole(variant: AlertVariant): AlertAriaRole {
    return variant === "error" ? "alert" : "status";
}

/** aria-live según variante. */
export function alertAriaLive(variant: AlertVariant): AlertAriaLive {
    return variant === "error" ? "assertive" : "polite";
}
