/**
 * TrainingPlanEditorForm.tsx — Formulario presentacional unificado (crear / editar plan).
 *
 * Contexto: sin mutaciones ni RTK; el contenedor pasa estado y errores.
 * Estilo alineado con la vista compacta de creación (`CreateTrainingPlan`).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { useMemo } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea, DatePickerButton, Label, FormCombobox, FormSelect } from "@/components/ui/forms";
import { ClientAvatar } from "@/components/ui/avatar";
import { chipFromGoal } from "@/components/trainingPlans/goalLabels";
import type { TrainingPlanInstance } from "@nexia/shared/types/training";
import type {
    TrainingPlanEditorDraft,
    TrainingPlanEditorValidationErrors,
} from "@nexia/shared";

const PLAN_STATUS_OPTIONS = [
    { value: "active", label: "Activo" },
    { value: "completed", label: "Completado" },
    { value: "paused", label: "Pausado" },
    { value: "cancelled", label: "Cancelado" },
];

export interface GoalOption {
    value: string;
    label: string;
}

function formatDateShort(dateString: string | null | undefined): string {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export interface TrainingPlanEditorFormProps {
    formId: string;
    mode: "create" | "edit";
    pageTitle: string;
    cardTitle: string;
    client: { id: number; nombre: string; apellidos: string } | null;
    showClientBlock: boolean;
    draft: TrainingPlanEditorDraft;
    onDraftChange: (next: TrainingPlanEditorDraft) => void;
    errors: TrainingPlanEditorValidationErrors;
    goalOptions: GoalOption[];
    existingInstances: TrainingPlanInstance[];
    isLoadingInstances: boolean;
    isSubmitDisabled: boolean;
    isSubmitting: boolean;
    submitLabel: string;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    /** Crear plan: abre el plan fuente de la instancia activa en periodización (sin acoplar rutas en shared). */
    onOpenActivePlan?: (instance: TrainingPlanInstance) => void;
}

export const TrainingPlanEditorForm: React.FC<TrainingPlanEditorFormProps> = ({
    formId,
    mode,
    pageTitle,
    cardTitle,
    client,
    showClientBlock,
    draft,
    onDraftChange,
    errors,
    goalOptions,
    existingInstances,
    isLoadingInstances,
    isSubmitDisabled,
    isSubmitting,
    submitLabel,
    onSubmit,
    onCancel,
    onOpenActivePlan,
}) => {
    const sortedInstances = useMemo(() => {
        return [...existingInstances].sort((a, b) => {
            if (a.status === "active" && b.status !== "active") return -1;
            if (b.status === "active" && a.status !== "active") return 1;
            return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        });
    }, [existingInstances]);

    /** Una sola tarjeta destacada: primera instancia activa (el resto va en "Planes existentes"). */
    const featuredActiveInstance = useMemo(() => {
        return sortedInstances.find((i) => i.status === "active") ?? null;
    }, [sortedInstances]);

    const otherInstances = useMemo(() => {
        if (!featuredActiveInstance) return sortedInstances;
        return sortedInstances.filter((i) => i.id !== featuredActiveInstance.id);
    }, [sortedInstances, featuredActiveInstance]);

    const getInstanceStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return { label: "Activo", className: "text-success" };
            case "completed":
                return { label: "Completado", className: "text-warning" };
            default:
                return { label: status, className: "text-muted-foreground" };
        }
    };

    const renderInstanceBody = (instance: TrainingPlanInstance) => {
        const statusBadge = getInstanceStatusBadge(instance.status);
        return (
            <>
                <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{instance.name}</p>
                    <span
                        className={`inline-flex shrink-0 items-center text-xs font-medium ${statusBadge.className}`}
                    >
                        {statusBadge.label}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground">
                    {formatDateShort(instance.start_date)} — {formatDateShort(instance.end_date)}
                    {instance.goal ? (
                        <>
                            <span className="mx-1.5">·</span>
                            {(() => {
                                const chips = chipFromGoal(instance.goal);
                                const chip = chips[0];
                                if (!chip) return null;
                                return (
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold border-transparent ${chip.toneClass}`}
                                    >
                                        {chip.label}
                                    </span>
                                );
                            })()}
                        </>
                    ) : null}
                </div>
            </>
        );
    };

    const renderInstanceRow = (instance: TrainingPlanInstance) => (
        <div
            key={instance.id}
            className="space-y-2 rounded-lg bg-surface-2 px-4 py-2.5"
        >
            {renderInstanceBody(instance)}
        </div>
    );

    const renderExistingPlans = () => {
        if (isLoadingInstances) {
            return (
                <div className="rounded-lg bg-surface-2 px-4 py-2.5">
                    <p className="text-sm text-muted-foreground">Cargando planes...</p>
                </div>
            );
        }

        if (sortedInstances.length === 0) {
            return (
                <div className="rounded-lg bg-surface-2 px-4 py-2.5">
                    <p className="text-sm text-muted-foreground">
                        No hay planes asignados a este cliente
                    </p>
                </div>
            );
        }

        if (otherInstances.length === 0) {
            return (
                <div className="rounded-lg bg-surface-2 px-4 py-2.5">
                    <p className="text-sm text-muted-foreground">
                        No hay otros planes; el activo aparece arriba.
                    </p>
                </div>
            );
        }

        return <div className="space-y-2">{otherInstances.map(renderInstanceRow)}</div>;
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                    Volver
                </Button>
            </div>

            <div className="space-y-5 rounded-lg border border-border bg-surface p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{cardTitle}</h2>
                </div>

                {showClientBlock && client && (
                    <div className="flex items-center gap-3 rounded-lg bg-surface-2 px-4 py-2.5">
                        <div className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full">
                            <ClientAvatar
                                clientId={client.id}
                                nombre={client.nombre}
                                apellidos={client.apellidos}
                                size="sm"
                            />
                        </div>
                        <p className="flex-1 text-sm font-medium">
                            {client.nombre} {client.apellidos}
                        </p>
                    </div>
                )}

                {mode === "create" && showClientBlock && !isLoadingInstances && featuredActiveInstance && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Plan activo
                        </p>
                        <div className="space-y-3 rounded-lg border border-success/25 bg-success/5 px-4 py-3">
                            {renderInstanceBody(featuredActiveInstance)}
                            {onOpenActivePlan &&
                                featuredActiveInstance.source_plan_id != null &&
                                featuredActiveInstance.source_plan_id > 0 && (
                                    <div className="flex flex-col gap-2 border-t border-success/20 pt-3 sm:flex-row sm:items-center sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full shrink-0 border-success/30 bg-surface hover:bg-surface-2 sm:w-auto"
                                            onClick={() => onOpenActivePlan(featuredActiveInstance)}
                                        >
                                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                                            Abrir plan activo
                                        </Button>
                                    </div>
                                )}
                        </div>
                    </div>
                )}

                <form id={formId} onSubmit={onSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Nombre <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={draft.name}
                                onChange={(e) =>
                                    onDraftChange({ ...draft, name: e.target.value })
                                }
                                placeholder="Ej: Hipertrofia Avanzada Q1"
                                className="h-10"
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Fecha inicio <span className="text-destructive">*</span>
                            </Label>
                            <DatePickerButton
                                label="Seleccionar"
                                value={draft.start_date}
                                onChange={(value) => onDraftChange({ ...draft, start_date: value })}
                                variant="form"
                            />
                            {errors.start_date && (
                                <p className="text-xs text-destructive">{errors.start_date}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Fecha fin <span className="text-destructive">*</span>
                            </Label>
                            <DatePickerButton
                                label="Seleccionar"
                                value={draft.end_date}
                                onChange={(value) => onDraftChange({ ...draft, end_date: value })}
                                variant="form"
                            />
                            {errors.end_date && (
                                <p className="text-xs text-destructive">{errors.end_date}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Objetivo <span className="text-destructive">*</span>
                            </Label>
                            <FormCombobox
                                value={draft.goal}
                                onChange={(value) =>
                                    onDraftChange({
                                        ...draft,
                                        goal: typeof value === "string" ? value : String(value),
                                    })
                                }
                                options={goalOptions}
                                placeholder="Seleccionar"
                            />
                            {errors.goal && (
                                <p className="text-xs text-destructive">{errors.goal}</p>
                            )}
                        </div>
                    </div>

                    {mode === "edit" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Estado</Label>
                                <FormSelect
                                    options={PLAN_STATUS_OPTIONS}
                                    value={draft.status || "active"}
                                    onChange={(e) =>
                                        onDraftChange({ ...draft, status: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Etiquetas{" "}
                                    <span className="text-xs text-muted-foreground">
                                        (separadas por coma)
                                    </span>
                                </Label>
                                <Input
                                    value={draft.tagsInput}
                                    onChange={(e) =>
                                        onDraftChange({ ...draft, tagsInput: e.target.value })
                                    }
                                    placeholder="fuerza, pretemporada…"
                                    className="h-10"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                            {mode === "create" ? (
                                <>
                                    Notas{" "}
                                    <span className="text-xs text-muted-foreground">(opcional)</span>
                                </>
                            ) : (
                                "Descripción / notas"
                            )}
                        </Label>
                        <Textarea
                            value={draft.description}
                            onChange={(e) =>
                                onDraftChange({ ...draft, description: e.target.value })
                            }
                            placeholder={
                                mode === "create"
                                    ? "Notas sobre progresión, deloads, consideraciones…"
                                    : "Descripción u observaciones del plan…"
                            }
                            rows={mode === "create" ? 2 : 4}
                            className="min-h-[80px]"
                        />
                    </div>

                    {showClientBlock && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Planes existentes del cliente
                            </p>
                            {renderExistingPlans()}
                        </div>
                    )}
                </form>
            </div>

            <div
                className="fixed bottom-0 right-0 z-30 border-t border-border bg-background px-6 py-4"
                style={{ left: "var(--sidebar-width, 0)" }}
            >
                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline-destructive"
                        size="sm"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        variant="primary"
                        size="sm"
                        disabled={isSubmitDisabled}
                        isLoading={isSubmitting}
                    >
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};
