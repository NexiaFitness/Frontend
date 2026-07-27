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

export const DUPLICATE_TEMPLATE_MODAL_COPY = {
    title: "Duplicar plantilla",
    description: (name: string) =>
        `Se creará una copia independiente en borrador a partir de «${name}». La plantilla original no se modifica.`,
    body: "Se copiarán bloques, estructura semanal y sesiones. Después podrás validar y publicar la copia en el editor.",
    confirm: "Duplicar plantilla",
    confirming: "Duplicando…",
    cancel: "Cancelar",
    successToast: "Plantilla duplicada",
} as const;

export const DUPLICATE_TEMPLATE_ACTION_LABEL = "Duplicar plantilla";

export const TEMPLATE_PUBLISH_COPY = {
    publish: "Publicar",
    republish: "Actualizar publicación",
    publishing: "Publicando…",
    republishing: "Actualizando…",
    publishedStatus: "Publicada",
    pendingRepublish: "Pendiente de publicar",
    validationFailed: "Corrige los errores del programa antes de publicar.",
    successFirstPublish: (revision: number, hashPrefix: string) =>
        `Plantilla publicada (rev. ${revision}, hash ${hashPrefix}…).`,
    successRepublish: (revision: number, hashPrefix: string) =>
        `Publicación actualizada (rev. ${revision}, hash ${hashPrefix}…).`,
} as const;

/** Publication UI phases — aligned with BE §09 lifecycle + validation. */
export type TemplatePublicationUiPhase =
    | "draft_unpublished"
    | "published_in_sync"
    | "published_pending_changes"
    | "archived";

export interface TemplatePublicationUiModel {
    phase: TemplatePublicationUiPhase;
    showPublishAction: boolean;
    publishActionLabel: string;
    publishLoadingLabel: string;
    showPublishedStatus: boolean;
    publishedStatusLabel: string;
    isRepublish: boolean;
}

export interface TemplateStatusChip {
    key: string;
    label: string;
    tone: "muted" | "success" | "warning" | "danger";
}

export const TEMPLATE_STATUS_CHIP_CLASS: Record<
    TemplateStatusChip["tone"],
    string
> = {
    muted: "rounded-full bg-muted px-2.5 py-0.5",
    success: "rounded-full bg-success/10 px-2.5 py-0.5 text-success",
    warning: "rounded-full bg-warning/10 px-2.5 py-0.5 text-warning",
    danger: "rounded-full bg-destructive/10 px-2.5 py-0.5 text-destructive",
};

export function resolveTemplatePublicationUi(input: {
    lifecycle_status?: string | null;
    validation_status?: string | null;
}): TemplatePublicationUiModel {
    const lifecycle = input.lifecycle_status ?? TEMPLATE_LIFECYCLE_STATUS.DRAFT;
    const validation = input.validation_status ?? TEMPLATE_VALIDATION_STATUS.NOT_VALIDATED;

    if (lifecycle === TEMPLATE_LIFECYCLE_STATUS.ARCHIVED) {
        return {
            phase: "archived",
            showPublishAction: false,
            publishActionLabel: TEMPLATE_PUBLISH_COPY.publish,
            publishLoadingLabel: TEMPLATE_PUBLISH_COPY.publishing,
            showPublishedStatus: false,
            publishedStatusLabel: TEMPLATE_PUBLISH_COPY.publishedStatus,
            isRepublish: false,
        };
    }

    if (lifecycle === TEMPLATE_LIFECYCLE_STATUS.PUBLISHED) {
        if (validation === TEMPLATE_VALIDATION_STATUS.VALID) {
            return {
                phase: "published_in_sync",
                showPublishAction: false,
                publishActionLabel: TEMPLATE_PUBLISH_COPY.republish,
                publishLoadingLabel: TEMPLATE_PUBLISH_COPY.republishing,
                showPublishedStatus: true,
                publishedStatusLabel: TEMPLATE_PUBLISH_COPY.publishedStatus,
                isRepublish: true,
            };
        }

        return {
            phase: "published_pending_changes",
            showPublishAction: true,
            publishActionLabel: TEMPLATE_PUBLISH_COPY.republish,
            publishLoadingLabel: TEMPLATE_PUBLISH_COPY.republishing,
            showPublishedStatus: false,
            publishedStatusLabel: TEMPLATE_PUBLISH_COPY.publishedStatus,
            isRepublish: true,
        };
    }

    return {
        phase: "draft_unpublished",
        showPublishAction: true,
        publishActionLabel: TEMPLATE_PUBLISH_COPY.publish,
        publishLoadingLabel: TEMPLATE_PUBLISH_COPY.publishing,
        showPublishedStatus: false,
        publishedStatusLabel: TEMPLATE_PUBLISH_COPY.publishedStatus,
        isRepublish: false,
    };
}

/** Status chips for template editor header — publication-first, not raw DB fields. */
export function getTemplateEditorStatusChips(input: {
    lifecycle_status?: string | null;
    validation_status?: string | null;
}): TemplateStatusChip[] {
    const publication = resolveTemplatePublicationUi(input);
    const chips: TemplateStatusChip[] = [];

    if (publication.phase === "archived") {
        chips.push({
            key: "lifecycle",
            label: labelTemplateLifecycle(TEMPLATE_LIFECYCLE_STATUS.ARCHIVED),
            tone: "muted",
        });
        return chips;
    }

    if (publication.phase === "published_in_sync") {
        chips.push({
            key: "published",
            label: TEMPLATE_PUBLISH_COPY.publishedStatus,
            tone: "success",
        });
        return chips;
    }

    if (publication.phase === "published_pending_changes") {
        chips.push({
            key: "published-base",
            label: labelTemplateLifecycle(TEMPLATE_LIFECYCLE_STATUS.PUBLISHED),
            tone: "muted",
        });
        chips.push({
            key: "pending-republish",
            label: TEMPLATE_PUBLISH_COPY.pendingRepublish,
            tone: "warning",
        });
        const validation = input.validation_status ?? TEMPLATE_VALIDATION_STATUS.NOT_VALIDATED;
        if (validation === TEMPLATE_VALIDATION_STATUS.INVALID) {
            chips.push({
                key: "validation",
                label: labelTemplateValidation(validation),
                tone: "danger",
            });
        }
        return chips;
    }

    chips.push({
        key: "lifecycle",
        label: labelTemplateLifecycle(TEMPLATE_LIFECYCLE_STATUS.DRAFT),
        tone: "muted",
    });
    const validation = input.validation_status ?? TEMPLATE_VALIDATION_STATUS.NOT_VALIDATED;
    if (validation !== TEMPLATE_VALIDATION_STATUS.NOT_VALIDATED) {
        chips.push({
            key: "validation",
            label: labelTemplateValidation(validation),
            tone:
                validation === TEMPLATE_VALIDATION_STATUS.VALID ? "success" : "danger",
        });
    }
    return chips;
}

export function templatePublishSuccessMessage(
    isRepublish: boolean,
    revision: number,
    hashPrefix: string,
): string {
    return isRepublish
        ? TEMPLATE_PUBLISH_COPY.successRepublish(revision, hashPrefix)
        : TEMPLATE_PUBLISH_COPY.successFirstPublish(revision, hashPrefix);
}

interface ValidationIssueRow {
    message?: string;
}

function messagesFromReportSection(section: unknown): string[] {
    if (!Array.isArray(section)) return [];
    return section
        .map((item) => {
            if (item != null && typeof item === "object" && "message" in item) {
                const message = (item as ValidationIssueRow).message;
                return typeof message === "string" && message.trim()
                    ? message.trim()
                    : "Error";
            }
            return "Error";
        })
        .filter(Boolean);
}

export function getTemplateValidationIssues(report: Record<string, unknown>): {
    errors: string[];
    warnings: string[];
} {
    return {
        errors: messagesFromReportSection(report.errors),
        warnings: messagesFromReportSection(report.warnings),
    };
}

/** Puente semántico plantilla (semanas relativas) → plan cliente (calendario). */
export const TEMPLATE_TEMPORAL_BRIDGE_COPY =
    "Las plantillas se organizan por semanas (1, 2, 3…). Al asignarlas a un cliente eliges la fecha de inicio y NEXIA arma el calendario del plan.";

export const TEMPLATE_ASSIGN_MODAL_COPY = {
    title: "Asignar plantilla a cliente",
    description:
        "Elige cliente e inicio. Las semanas de la plantilla se convierten en fechas de calendario para el plan del cliente.",
    endDateHint: "Se calcula automáticamente al elegir la fecha de inicio.",
    endDateLoading: "Calculando fecha de fin…",
    durationWeeks: (weeks: number) => `${weeks} semanas de programa`,
} as const;

export type TemplateLibraryPrimaryIntent = "assign" | "continue_edit";

export interface TemplateLibraryCardActions {
    primaryLabel: string;
    primaryIntent: TemplateLibraryPrimaryIntent;
    assignEnabled: boolean;
    assignDisabledReason: string | null;
    secondaryLabel: string;
}

export function resolveTemplateLibraryCardActions(input: {
    lifecycle_status?: string | null;
    validation_status?: string | null;
}): TemplateLibraryCardActions {
    const publication = resolveTemplatePublicationUi(input);

    if (publication.phase === "published_in_sync") {
        return {
            primaryLabel: "Asignar a cliente",
            primaryIntent: "assign",
            assignEnabled: true,
            assignDisabledReason: null,
            secondaryLabel: "Editar programa",
        };
    }

    if (publication.phase === "archived") {
        return {
            primaryLabel: "Ver plantilla",
            primaryIntent: "continue_edit",
            assignEnabled: false,
            assignDisabledReason: "Las plantillas archivadas no se pueden asignar.",
            secondaryLabel: "Editar programa",
        };
    }

    if (publication.phase === "published_pending_changes") {
        return {
            primaryLabel: "Continuar edición",
            primaryIntent: "continue_edit",
            assignEnabled: false,
            assignDisabledReason:
                "Publica los cambios antes de asignar esta plantilla a un cliente.",
            secondaryLabel: "Ver detalle",
        };
    }

    return {
        primaryLabel: "Continuar edición",
        primaryIntent: "continue_edit",
        assignEnabled: false,
        assignDisabledReason: "Publica la plantilla antes de asignarla a un cliente.",
        secondaryLabel: "Ver detalle",
    };
}

/** Alias semántico — mismos chips que el editor, orientados a biblioteca. */
export const getTemplateLibraryStatusChips = getTemplateEditorStatusChips;

export function isTemplateAssignable(input: {
    lifecycle_status?: string | null;
    validation_status?: string | null;
}): boolean {
    return resolveTemplatePublicationUi(input).phase === "published_in_sync";
}
