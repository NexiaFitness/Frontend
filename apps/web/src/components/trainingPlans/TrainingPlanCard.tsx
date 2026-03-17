/**
 * TrainingPlanCard.tsx — Card individual para plan o plantilla
 *
 * Tokens: bg-card, border-border, text-foreground, text-muted-foreground
 * Estilo: rounded-lg border border-border border-l-2 border-l-primary
 *
 * @author Frontend Team
 * @since v5.0.0
 * @updated v6.x - Tokens, diseño consistente con app
 */

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Copy, Trash2, FileStack } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { ClientAvatarsGroup } from "@/components/ui/avatar";
import { FormSelect } from "@/components/ui/forms";
import { cn } from "@/lib/utils";
import type { TrainingPlan, TrainingPlanTemplate } from "@nexia/shared/types/training";
import type { Client } from "@nexia/shared/types/client";

interface TrainingPlanCardProps {
    item: TrainingPlan | TrainingPlanTemplate;
    type: "template" | "active" | "archived";
    clientName?: string;
    clients?: Client[];
    onEdit?: () => void;
    onAssign?: () => void;
    onDuplicate?: () => void;
    onConvert?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    onPreview?: () => void;
    onAddClient?: () => void;
    onStatusChange?: (status: string) => void;
    isProcessing?: boolean;
}

const CARD_BASE =
    "rounded-lg border border-border border-l-2 border-l-primary bg-card p-5 text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md";

export const TrainingPlanCard: React.FC<TrainingPlanCardProps> = ({
    item,
    type,
    clientName: _clientName,
    clients = [],
    onEdit,
    onAssign,
    onDuplicate,
    onConvert,
    onDelete,
    onView,
    onPreview,
    onAddClient,
    onStatusChange,
    isProcessing = false,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);
    const isTemplate = "usage_count" in item;
    const template = isTemplate ? (item as TrainingPlanTemplate) : null;
    const plan = !isTemplate ? (item as TrainingPlan) : null;

    const getDuration = (): string => {
        if (template) {
            if (template.duration_value && template.duration_unit) {
                const unitLabels: Record<string, string> = {
                    days: "días",
                    weeks: "semanas",
                    months: "meses",
                };
                return `${template.duration_value} ${unitLabels[template.duration_unit] || template.duration_unit}`;
            }
            if (template.estimated_duration_weeks) {
                return `${template.estimated_duration_weeks} semanas`;
            }
        }
        if (plan?.start_date && plan?.end_date) {
            const start = new Date(plan.start_date);
            const end = new Date(plan.end_date);
            const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
            return `${weeks} semanas`;
        }
        return "Duración no especificada";
    };

    const getFrequency = (): string | null => {
        if (template?.training_days_per_week) {
            return `${template.training_days_per_week}x/semana`;
        }
        return null;
    };

    const getBadge = (): React.ReactNode => {
        if (type === "archived") {
            return (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                    Archivado
                </span>
            );
        }
        if (type === "active" && plan?.status) {
            const statusMap: Record<string, string> = {
                active: "bg-success/10 text-success",
                completed: "bg-primary/10 text-primary",
                paused: "bg-warning/10 text-warning",
                cancelled: "bg-destructive/10 text-destructive",
            };
            const labels: Record<string, string> = {
                active: "Activo",
                completed: "Completado",
                paused: "Pausado",
                cancelled: "Cancelado",
            };
            return (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusMap[plan.status] ?? "bg-muted text-muted-foreground"
                    )}
                >
                    {labels[plan.status] ?? plan.status}
                </span>
            );
        }
        if (isTemplate && template?.level) {
            const levelMap: Record<string, string> = {
                beginner: "bg-success/10 text-success",
                intermediate: "bg-warning/10 text-warning",
                advanced: "bg-destructive/10 text-destructive",
            };
            const labels: Record<string, string> = {
                beginner: "Principiante",
                intermediate: "Intermedio",
                advanced: "Avanzado",
            };
            return (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        levelMap[template.level] ?? "bg-muted text-muted-foreground"
                    )}
                >
                    {labels[template.level] ?? template.level}
                </span>
            );
        }
        return null;
    };

    const duration = getDuration();
    const frequency = getFrequency();

    if (type === "active") {
        return (
            <article className={cn(CARD_BASE, "flex flex-col")}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                    {getBadge()}
                </div>

                <div className="mb-4 flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                        {item.description && (
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                {item.description}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{duration}</span>
                        {frequency && (
                            <>
                                <span className="text-border">•</span>
                                <span>{frequency}</span>
                            </>
                        )}
                        {clients.length > 0 && (
                            <>
                                <span className="text-border">•</span>
                                <div className="flex items-center gap-2">
                                    <ClientAvatarsGroup clients={clients} maxVisible={3} size="sm" />
                                    <span className="text-muted-foreground">
                                        {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
                                    </span>
                                </div>
                            </>
                        )}
                        {plan && onStatusChange && (
                            <>
                                <span className="text-border">•</span>
                                <div className="min-w-[120px]">
                                    <FormSelect
                                        value={plan.status || "active"}
                                        onChange={(e) => onStatusChange(e.target.value)}
                                        options={[
                                            { value: "active", label: "Progreso" },
                                            { value: "paused", label: "Pausado" },
                                            { value: "completed", label: "Completado" },
                                            { value: "cancelled", label: "Cancelado" },
                                        ]}
                                        className="text-sm"
                                    />
                                </div>
                            </>
                        )}
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((o) => !o)}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                disabled={isProcessing}
                                title="Más opciones"
                                aria-label="Más opciones"
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                            >
                                <MoreVertical className="h-5 w-5" />
                            </button>
                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-md border border-border bg-popover py-1 shadow-lg"
                                >
                                    {onEdit && (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                onEdit();
                                                setMenuOpen(false);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                                            Editar
                                        </button>
                                    )}
                                    {onConvert && (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                onConvert();
                                                setMenuOpen(false);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <FileStack className="h-4 w-4 shrink-0" aria-hidden />
                                            Convertir a plantilla
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                onDelete();
                                                setMenuOpen(false);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 border-t border-border pt-4">
                    {onView && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onView}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            Ver detalles
                        </Button>
                    )}
                    {onAddClient && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onAddClient}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            Agregar cliente
                        </Button>
                    )}
                </div>
            </article>
        );
    }

    return (
        <article className={cn(CARD_BASE, "flex h-full flex-col")}>
            <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
                            {item.name}
                        </h3>
                        {getBadge()}
                    </div>
                </div>
            </div>

            <div className="mb-4 min-h-[2.5rem]">
                {item.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                ) : (
                    <p className="text-sm italic text-muted-foreground/70">Sin descripción</p>
                )}
            </div>

            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{duration}</span>
                {frequency && (
                    <>
                        <span className="text-border">•</span>
                        <span>{frequency}</span>
                    </>
                )}
            </div>

            {isTemplate && template?.tags && template.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {template.tags.slice(0, 3).map((tag, i) => (
                        <span
                            key={i}
                            className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium bg-surface-2 text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                    {template.tags.length > 3 && (
                        <span className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium bg-surface-2 text-muted-foreground">
                            +{template.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="mt-auto flex-1" />

            <div className="flex items-center gap-2 border-t border-border pt-4">
                {type === "template" && onPreview && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPreview}
                        disabled={isProcessing}
                        className="flex-1"
                    >
                        Vista previa
                    </Button>
                )}
                {type === "template" && onAssign && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onAssign}
                        disabled={isProcessing}
                        className="flex-1"
                    >
                        Usar plantilla
                    </Button>
                )}
                <div className="relative shrink-0" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((o) => !o)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        disabled={isProcessing}
                        title="Más opciones"
                        aria-label="Más opciones"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                    >
                        <MoreVertical className="h-5 w-5" />
                    </button>
                    {menuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-md border border-border bg-popover py-1 shadow-lg"
                        >
                            {onEdit && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        onEdit();
                                        setMenuOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                                    Editar
                                </button>
                            )}
                            {onDuplicate && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        onDuplicate();
                                        setMenuOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Copy className="h-4 w-4 shrink-0" aria-hidden />
                                    Duplicar
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        onDelete();
                                        setMenuOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                                    Eliminar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};
