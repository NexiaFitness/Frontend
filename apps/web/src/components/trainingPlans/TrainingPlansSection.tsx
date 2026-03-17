/**
 * TrainingPlansSection.tsx — Sección con grid de cards de planes/plantillas
 *
 * Contexto:
 * - Renderiza una sección completa (templates, activos, archivados)
 * - Tokens: bg-card, border-border, text-foreground, text-muted-foreground
 * - EmptyStateCard para estados vacíos
 *
 * @author Frontend Team
 * @since v5.0.0
 * @updated v6.x - Tokens, EmptyStateCard, layout consistente con dashboard/clients
 */

import React from "react";
import { Archive, ClipboardList, FileStack } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { SearchBar } from "@/components/ui/forms";
import { LoadingSpinner } from "@/components/ui/feedback";
import { EmptyStateCard } from "@/components/ui/cards";
import { TrainingPlanCard } from "./TrainingPlanCard";
import type { TrainingPlan, TrainingPlanTemplate } from "@nexia/shared/types/training";
import type { Client } from "@nexia/shared/types/client";

interface TrainingPlansSectionProps {
    title: string;
    description?: string;
    items: (TrainingPlan | TrainingPlanTemplate)[];
    type: "template" | "active" | "archived";
    clientNames?: Record<number, string>;
    clientsMap?: Record<number, Client[]>;
    onCreate?: () => void;
    onAssign?: (id: number) => void;
    onDuplicate?: (id: number) => void;
    onConvert?: (id: number) => void;
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
    onView?: (id: number) => void;
    onPreview?: (id: number) => void;
    onAddClient?: (id: number) => void;
    onStatusChange?: (id: number, status: string) => void;
    isLoading?: boolean;
    processingIds?: Set<number>;
}

export const TrainingPlansSection: React.FC<TrainingPlansSectionProps> = ({
    title,
    description,
    totalCount,
    searchValue = "",
    onSearchChange,
    searchPlaceholder,
    searchAriaLabel,
    items,
    type,
    clientNames = {},
    clientsMap = {},
    onCreate,
    onAssign,
    onDuplicate,
    onConvert,
    onDelete,
    onEdit,
    onView,
    onPreview,
    onAddClient,
    onStatusChange,
    isLoading = false,
    processingIds = new Set(),
}) => {
    const isTemplate = items.length > 0 && "usage_count" in items[0];
    const EmptyIcon = isTemplate ? FileStack : ClipboardList;
    const SectionIcon = type === "template" ? FileStack : type === "archived" ? Archive : ClipboardList;

    return (
        <section className="mb-8 lg:mb-12">
            {/* Header — icono + h3 + badge total (estilo ClientList) */}
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
                <div className="flex-1 space-y-1">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                            <SectionIcon className="h-4 w-4 text-primary" aria-hidden />
                            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                        </div>
                        {totalCount !== undefined && (
                            <span className="text-sm text-muted-foreground sm:text-base">{totalCount} total</span>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
                {onCreate && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onCreate}
                        className="w-full sm:w-auto"
                    >
                        {type === "active" ? "+ Nuevo Programa" : "+ Crear Plantilla"}
                    </Button>
                )}
            </div>

            {/* Buscador — estilo ClientList */}
            {onSearchChange && (
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <SearchBar
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                        ariaLabel={searchAriaLabel}
                    />
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border bg-card p-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : items.length === 0 ? (
                <EmptyStateCard
                    icon={<EmptyIcon aria-hidden />}
                    title={`No hay ${isTemplate ? "plantillas" : "planes"} aún`}
                    description={
                        isTemplate
                            ? "Crea tu primera plantilla reutilizable para asignar a múltiples clientes."
                            : type === "active"
                            ? "No hay planes activos en este momento."
                            : "No hay planes archivados."
                    }
                    action={
                        onCreate && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-primary/30 bg-transparent text-primary hover:bg-primary/10 hover:border-primary/50"
                                onClick={onCreate}
                            >
                                <EmptyIcon className="mr-2 h-3.5 w-3.5" aria-hidden />
                                Crear {isTemplate ? "primera plantilla" : "primer plan"}
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                        const clientId = !isTemplate && "client_id" in item ? item.client_id : null;
                        const clientName = clientId != null ? clientNames[clientId] : undefined;
                        const clients = clientsMap[item.id] || [];
                        const isProcessing = processingIds.has(item.id);

                        return (
                            <TrainingPlanCard
                                key={item.id}
                                item={item}
                                type={type}
                                clientName={clientName}
                                clients={clients}
                                onEdit={onEdit ? () => onEdit(item.id) : undefined}
                                onAssign={onAssign ? () => onAssign(item.id) : undefined}
                                onDuplicate={onDuplicate ? () => onDuplicate(item.id) : undefined}
                                onConvert={onConvert ? () => onConvert(item.id) : undefined}
                                onDelete={onDelete ? () => onDelete(item.id) : undefined}
                                onView={onView ? () => onView(item.id) : undefined}
                                onPreview={onPreview ? () => onPreview(item.id) : undefined}
                                onAddClient={onAddClient ? () => onAddClient(item.id) : undefined}
                                onStatusChange={
                                    onStatusChange
                                        ? (status: string) => onStatusChange(item.id, status)
                                        : undefined
                                }
                                isProcessing={isProcessing}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );
};
