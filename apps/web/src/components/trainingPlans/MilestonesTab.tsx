/**
 * MilestonesTab.tsx — Hitos del training plan
 *
 * UI: cabecera + formulario colapsable + lista ordenada por fecha.
 * La confirmación de borrado usa BaseModal (no confirm() nativo).
 * Errores de red renderizados con Alert (no alert() nativo).
 *
 * @author Frontend Team
 * @since v4.7.0 - Training Planning FASE 3A
 * @updated 2026-04 — Reescritura completa alineada con DESIGN.md / Sparkle Flow
 */

import React, { useState } from "react";
import {
    Calendar,
    Check,
    Flag,
    CheckCircle2,
    Trophy,
    ClipboardList,
    Bookmark,
    Plus,
    X,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMilestones } from "@nexia/shared/hooks/training/useMilestones";
import {
    MILESTONE_TYPES,
    MILESTONE_IMPORTANCE,
    type MilestoneType,
    type MilestoneImportance,
} from "@nexia/shared/types/training";
import type { Milestone } from "@nexia/shared/types/training";
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect, Textarea, DatePickerButton } from "@/components/ui/forms";
import { Alert, LoadingSpinner, EmptyState } from "@/components/ui/feedback";
import { BaseModal } from "@/components/ui/modals";

interface MilestonesTabProps {
    planId: number;
}

const TYPE_CONFIG: Record<
    MilestoneType,
    { icon: React.ReactNode; label: string; badgeClass: string }
> = {
    start: {
        icon: <Flag className="size-3" />,
        label: "Inicio",
        badgeClass: "bg-primary/15 text-primary border-primary/30",
    },
    end: {
        icon: <CheckCircle2 className="size-3" />,
        label: "Fin",
        badgeClass: "bg-muted text-muted-foreground border-border",
    },
    competition: {
        icon: <Trophy className="size-3" />,
        label: "Competición",
        badgeClass: "bg-warning/15 text-warning border-warning/30",
    },
    test: {
        icon: <ClipboardList className="size-3" />,
        label: "Prueba",
        badgeClass: "bg-secondary text-secondary-foreground border-border",
    },
    custom: {
        icon: <Bookmark className="size-3" />,
        label: "Personalizado",
        badgeClass: "bg-muted text-muted-foreground border-border",
    },
};

const IMPORTANCE_CONFIG: Record<
    MilestoneImportance,
    { label: string; filled: number; activeClass: string }
> = {
    low: { label: "Baja", filled: 1, activeClass: "bg-muted-foreground/60" },
    medium: { label: "Media", filled: 2, activeClass: "bg-warning" },
    high: { label: "Alta", filled: 3, activeClass: "bg-destructive" },
};

const TYPE_OPTIONS = [
    { value: MILESTONE_TYPES.START, label: "Inicio" },
    { value: MILESTONE_TYPES.END, label: "Fin" },
    { value: MILESTONE_TYPES.COMPETITION, label: "Competición" },
    { value: MILESTONE_TYPES.TEST, label: "Prueba" },
    { value: MILESTONE_TYPES.CUSTOM, label: "Personalizado" },
];

const IMPORTANCE_OPTIONS = [
    { value: MILESTONE_IMPORTANCE.LOW, label: "Baja" },
    { value: MILESTONE_IMPORTANCE.MEDIUM, label: "Media" },
    { value: MILESTONE_IMPORTANCE.HIGH, label: "Alta" },
];

const DEFAULT_FORM = {
    title: "",
    milestone_date: "",
    type: MILESTONE_TYPES.CUSTOM as MilestoneType,
    importance: MILESTONE_IMPORTANCE.MEDIUM as MilestoneImportance,
    notes: "",
};

const formatMilestoneDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

const ImportanceDots: React.FC<{ importance: MilestoneImportance }> = ({
    importance,
}) => {
    const config = IMPORTANCE_CONFIG[importance];
    return (
        <div
            className="flex items-center gap-0.5"
            title={`Importancia: ${config.label}`}
            aria-label={`Importancia ${config.label}`}
        >
            {[1, 2, 3].map((i) => (
                <span
                    key={i}
                    className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        i <= config.filled ? config.activeClass : "bg-border"
                    )}
                />
            ))}
        </div>
    );
};

export const MilestonesTab: React.FC<MilestonesTabProps> = ({ planId }) => {
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [formError, setFormError] = useState<string | null>(null);
    const [topError, setTopError] = useState<string | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        milestones,
        isLoading,
        createMilestone,
        deleteMilestone,
        toggleComplete,
        isCreating: isSubmitting,
    } = useMilestones({ planId });

    const openForm = () => {
        setFormData(DEFAULT_FORM);
        setFormError(null);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.milestone_date) {
            setFormError("El nombre y la fecha son obligatorios.");
            return;
        }
        try {
            await createMilestone(formData);
            setFormData(DEFAULT_FORM);
            setFormOpen(false);
            setFormError(null);
        } catch {
            setFormError("No se pudo guardar el hito. Inténtalo de nuevo.");
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteTargetId === null) return;
        setIsDeleting(true);
        try {
            await deleteMilestone(deleteTargetId);
            setDeleteTargetId(null);
        } catch {
            setTopError("No se pudo eliminar el hito. Inténtalo de nuevo.");
            setDeleteTargetId(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggle = async (milestone: Milestone) => {
        try {
            await toggleComplete(milestone);
        } catch {
            setTopError("No se pudo actualizar el hito. Inténtalo de nuevo.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sorted = [...milestones].sort(
        (a, b) =>
            new Date(a.milestone_date).getTime() -
            new Date(b.milestone_date).getTime()
    );

    return (
        <div className="space-y-5">
            {topError && (
                <Alert variant="error" onDismiss={() => setTopError(null)}>
                    {topError}
                </Alert>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Hitos del plan
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Registra eventos clave: competiciones, pruebas y fechas
                        importantes.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={formOpen ? closeForm : openForm}
                    className="shrink-0"
                >
                    {formOpen ? (
                        <X className="size-4" />
                    ) : (
                        <Plus className="size-4" />
                    )}
                    {formOpen ? "Cancelar" : "Nuevo hito"}
                </Button>
            </div>

            {/* Create form */}
            {formOpen && (
                <div className="rounded-lg border border-border bg-card p-5">
                    <p className="mb-4 text-sm font-semibold text-foreground">
                        Nuevo hito
                    </p>
                    {formError && (
                        <Alert
                            variant="error"
                            className="mb-4"
                            onDismiss={() => setFormError(null)}
                        >
                            {formError}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormSelect
                            label="Tipo"
                            value={formData.type}
                            options={TYPE_OPTIONS}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value as MilestoneType,
                                })
                            }
                            size="sm"
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label="Nombre"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="ej. Competición final, Test de fuerza"
                                size="sm"
                                autoFocus
                                isRequired
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Fecha{" "}
                                    <span className="text-destructive ml-1">*</span>
                                </label>
                                <DatePickerButton
                                    label="Seleccionar"
                                    value={formData.milestone_date}
                                    onChange={(v) =>
                                        setFormData({
                                            ...formData,
                                            milestone_date: v,
                                        })
                                    }
                                    variant="form"
                                    aria-label="Fecha del hito"
                                />
                            </div>
                        </div>
                        <FormSelect
                            label="Importancia"
                            value={formData.importance}
                            options={IMPORTANCE_OPTIONS}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    importance: e.target.value as MilestoneImportance,
                                })
                            }
                            size="sm"
                        />
                        <Textarea
                            label="Notas"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    notes: e.target.value,
                                })
                            }
                            placeholder="Contexto adicional o instrucciones..."
                            rows={3}
                            size="sm"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={closeForm}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                Guardar hito
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Milestone list */}
            {sorted.length === 0 ? (
                <EmptyState
                    icon={<Calendar />}
                    title="Sin hitos registrados"
                    description="Añade competiciones, pruebas de evaluación o fechas clave para guiar tu planificación."
                    action={
                        !formOpen ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openForm}
                            >
                                <Plus className="size-4" />
                                Añadir primer hito
                            </Button>
                        ) : undefined
                    }
                />
            ) : (
                <div className="space-y-2">
                    {sorted.map((milestone) => {
                        const isPast =
                            new Date(milestone.milestone_date) < today;
                        const typeConfig = TYPE_CONFIG[milestone.type];

                        return (
                            <div
                                key={milestone.id}
                                className={cn(
                                    "rounded-lg border p-4 transition-all",
                                    milestone.done
                                        ? "border-success/30 bg-success/10"
                                        : "border-border bg-card hover:border-border/80"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Custom checkbox */}
                                    <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={milestone.done}
                                        onClick={() => handleToggle(milestone)}
                                        className={cn(
                                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-150",
                                            milestone.done
                                                ? "border-success bg-success/20 text-success"
                                                : "border-border hover:border-primary"
                                        )}
                                        aria-label={
                                            milestone.done
                                                ? "Marcar como pendiente"
                                                : "Marcar como completado"
                                        }
                                    >
                                        {milestone.done && (
                                            <Check className="size-3" />
                                        )}
                                    </button>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <p
                                            className={cn(
                                                "text-sm font-semibold leading-tight",
                                                milestone.done
                                                    ? "text-muted-foreground line-through"
                                                    : "text-foreground"
                                            )}
                                        >
                                            {milestone.title}
                                        </p>
                                        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                            {formatMilestoneDate(
                                                milestone.milestone_date
                                            )}
                                            {isPast && !milestone.done && (
                                                <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                                                    Vencido
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                                    typeConfig.badgeClass
                                                )}
                                            >
                                                {typeConfig.icon}
                                                {typeConfig.label}
                                            </span>
                                            <ImportanceDots
                                                importance={
                                                    milestone.importance
                                                }
                                            />
                                        </div>
                                        {milestone.notes && (
                                            <p className="rounded-md bg-surface/50 px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
                                                {milestone.notes}
                                            </p>
                                        )}
                                    </div>

                                    {/* Delete button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setDeleteTargetId(milestone.id)
                                        }
                                        className="h-7 w-7 shrink-0 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive"
                                        aria-label={`Eliminar hito ${milestone.title}`}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete confirmation modal */}
            <BaseModal
                isOpen={deleteTargetId !== null}
                onClose={() => {
                    if (!isDeleting) setDeleteTargetId(null);
                }}
                title="Eliminar hito"
                description="Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este hito?"
                iconType="danger"
                maxWidth="sm"
                isLoading={isDeleting}
            >
                <div className="flex justify-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTargetId(null)}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteConfirm}
                        isLoading={isDeleting}
                    >
                        Eliminar
                    </Button>
                </div>
            </BaseModal>
        </div>
    );
};
