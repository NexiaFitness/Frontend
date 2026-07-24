/**
 * Labels and formatters for template program lifecycle (aligned with BE §09).
 */

export const TEMPLATE_LIFECYCLE_STATUS = {
    DRAFT: "draft",
    PUBLISHED: "published",
    ARCHIVED: "archived",
} as const;

export const TEMPLATE_VALIDATION_STATUS = {
    NOT_VALIDATED: "not_validated",
    VALID: "valid",
    INVALID: "invalid",
} as const;

export type TemplateLifecycleStatus =
    (typeof TEMPLATE_LIFECYCLE_STATUS)[keyof typeof TEMPLATE_LIFECYCLE_STATUS];

export type TemplateValidationStatus =
    (typeof TEMPLATE_VALIDATION_STATUS)[keyof typeof TEMPLATE_VALIDATION_STATUS];

export const TEMPLATE_LIFECYCLE_LABELS: Record<TemplateLifecycleStatus, string> = {
    draft: "Borrador",
    published: "Publicada",
    archived: "Archivada",
};

export const TEMPLATE_VALIDATION_LABELS: Record<TemplateValidationStatus, string> = {
    not_validated: "Sin validar",
    valid: "Válida",
    invalid: "Inválida",
};

export function labelTemplateLifecycle(status: string | null | undefined): string {
    if (!status) return "—";
    return (
        TEMPLATE_LIFECYCLE_LABELS[status as TemplateLifecycleStatus] ?? status
    );
}

export function labelTemplateValidation(status: string | null | undefined): string {
    if (!status) return "—";
    return (
        TEMPLATE_VALIDATION_LABELS[status as TemplateValidationStatus] ?? status
    );
}

export function formatTemplateDurationHint(
    estimatedWeeks: number | null | undefined,
): string | null {
    if (estimatedWeeks == null) return null;
    return `${estimatedWeeks} semanas (referencia)`;
}

export function formatTemplateProgramWeekCount(
    programWeekCount: number | null | undefined,
): string | null {
    if (programWeekCount == null) return null;
    return `${programWeekCount} semanas de programa`;
}
