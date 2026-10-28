/**
 * clientProgressRecordsPresentation.ts — Clases y copy de «Registros antropométricos»
 * (pestaña Progreso, subpestaña Cuerpo).
 *
 * Contexto: lo consume ClientProgressRecordsSection, en la ficha del entrenador y en
 * la vista supervisada del admin (solo lectura).
 *
 * Notas de mantenimiento: tokens semánticos (border, muted, primary); sin hex.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

export const PROGRESS_RECORDS_SECTION = "space-y-5 border-t border-border/50 pt-8";
export const PROGRESS_RECORDS_HEADER = "flex flex-wrap items-center justify-between gap-3";
export const PROGRESS_RECORDS_TITLE = "text-sm font-semibold text-foreground";
export const PROGRESS_RECORDS_SUBTITLE = "mt-1 text-xs text-muted-foreground";
export const PROGRESS_RECORDS_FORM_CARD = "rounded-lg border border-border bg-card p-5";
export const PROGRESS_RECORDS_FORM_TITLE = "mb-4 text-sm font-semibold text-foreground";
export const PROGRESS_RECORDS_LIST = "space-y-2";
export const PROGRESS_RECORDS_ROW = "flex items-center gap-4 rounded-lg bg-surface p-4";
export const PROGRESS_RECORDS_ROW_BODY = "min-w-0 flex-1";
export const PROGRESS_RECORDS_ROW_DATE = "text-sm font-medium text-foreground";
export const PROGRESS_RECORDS_ROW_METRICS =
    "mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground";
export const PROGRESS_RECORDS_ROW_VALUE = "text-foreground";
export const PROGRESS_RECORDS_ROW_NOTES = "mt-1 line-clamp-1 text-xs text-muted-foreground/70";
export const PROGRESS_RECORDS_EDIT_BUTTON =
    "shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary";
export const PROGRESS_RECORDS_EMPTY = "rounded-lg border border-dashed border-border/50 bg-muted/10";

export const PROGRESS_RECORDS_COPY = {
    title: "Registros antropométricos",
    subtitle: "Peso, IMC y notas registrados manualmente.",
    newRecord: "Nuevo registro",
    cancel: "Cancelar",
    formTitle: "Nuevo registro de progreso",
    editRecord: "Editar registro",
    weight: "Peso",
    bmi: "IMC",
    emptyTitle: "Sin registros de progreso",
    emptyDescription:
        "Registra peso, IMC y notas para seguir la evolución corporal del cliente.",
    emptyDescriptionReadOnly: "El entrenador aún no ha registrado peso ni IMC.",
    addFirst: "Añadir primer registro",
} as const;
