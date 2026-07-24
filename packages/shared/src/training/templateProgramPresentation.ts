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

export function isTrainingPlanTemplateNotFoundError(error: unknown): boolean {
    if (error == null || typeof error !== "object") return false;
    if ("status" in error) {
        const status = (error as { status?: unknown }).status;
        if (status === 404 || status === "404" || status === "PARSING_ERROR") {
            return true;
        }
    }
    const message =
        typeof error === "object" && "data" in error
            ? String((error as { data?: unknown }).data ?? "")
            : String(error);
    return message.toLowerCase().includes("not found");
}

export function resolveTrainingPlanTemplateLoadError(error: unknown): string {
    if (isTrainingPlanTemplateNotFoundError(error)) {
        return "Esta plantilla no existe o ha sido eliminada.";
    }
    if (error != null && typeof error === "object" && "data" in error) {
        const data = (error as { data?: unknown }).data;
        if (typeof data === "object" && data != null && "detail" in data) {
            const detail = (data as { detail?: unknown }).detail;
            if (typeof detail === "string" && detail.trim()) {
                return detail;
            }
        }
    }
    return "No se pudo cargar la plantilla. Comprueba tu conexión e inténtalo de nuevo.";
}
