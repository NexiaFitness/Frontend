/**
 * Estilos reutilizables para formularios de cliente (tokens del diseño).
 * Inputs, selects, textareas, labels, errores.
 * Para botones segmentados usar el componente SegmentButton (@/components/ui/buttons).
 */

export const inputClass =
  "w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] disabled:opacity-50 disabled:cursor-not-allowed";

export const selectClass = inputClass;

export const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] resize-y min-h-[100px]";

export const labelClass = "block text-sm font-medium text-foreground mb-1.5";

export const errorClass = "mt-1 text-sm text-destructive";

export const helperClass = "mt-1 text-xs text-muted-foreground";

export const sectionHeadingClass = "text-lg font-semibold text-foreground";

export const sectionDividerClass = "flex-1 h-0.5 bg-border";

/** Card de sección (fondo surface oscuro) */
export const sectionCardClass = "rounded-lg border border-border bg-surface p-6";

/** Campo de solo lectura / display */
export const displayFieldClass =
  "w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground";

/** Badge "Auto" / calculado */
export const badgeAutoClass = "text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full";
