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
import { TrainingPlanTemplateCard } from "./TrainingPlanTemplateCard";
import type { TrainingPlan, TrainingPlanTemplate } from "@nexia/shared/types/training";
import type { Client } from "@nexia/shared/types/client";

interface TrainingPlansSectionProps {
    title: string;
    description?: string;
    /** Si es false, no se muestra la fila con icono, título, total ni botón crear (p. ej. vista con tabs y CTA arriba). */
    showHeading?: boolean;
    totalCount?: number;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    searchAriaLabel?: string;
    items: (TrainingPlan | TrainingPlanTemplate)[];
    type: "template" | "active" | "archived";
    clientNames?: Record<number, string>;
    clientsMap?: Record<number, Client[]>;
    onCreate?: () => void;
    isLoading?: boolean;
}

export const TrainingPlansSection: React.FC<TrainingPlansSectionProps> = ({
    title,
    description,
    showHeading = true,
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
    isLoading = false,
}) => {
    const isTemplate = items.length > 0 && "usage_count" in items[0];
    const EmptyIcon = isTemplate ? FileStack : ClipboardList;
    const SectionIcon = type === "template" ? FileStack : type === "archived" ? Archive : ClipboardList;

    return (
        <section className="mb-8 lg:mb-12">
            {showHeading ? (
                <div className="mb-4 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
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
            ) : description ? (
                <p className="mb-4 text-xs text-muted-foreground">{description}</p>
            ) : null}

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
                            ? "No hay plantillas que coincidan con los filtros o aún no has creado ninguna."
                            : type === "active"
                              ? "No hay planes que coincidan con los filtros o aún no tienes planificaciones asignadas."
                              : "No hay planes archivados."
                    }
                    action={
                        onCreate && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-primary/30 bg-transparent text-primary hover:border-primary/50 hover:bg-primary/10"
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
                    {type === "template"
                        ? (items as TrainingPlanTemplate[]).map((template) => (
                              <TrainingPlanTemplateCard key={template.id} template={template} />
                          ))
                        : (items as TrainingPlan[]).map((plan) => {
                              const clients = clientsMap[plan.id] ?? [];
                              const client =
                                  plan.client_id != null
                                      ? clients.find((c) => c.id === plan.client_id) ?? null
                                      : null;
                              const clientDisplayName =
                                  plan.client_id != null ? clientNames[plan.client_id] ?? "" : "";
                              return (
                                  <TrainingPlanCard
                                      key={plan.id}
                                      plan={plan}
                                      client={client}
                                      clientDisplayName={clientDisplayName}
                                  />
                              );
                          })}
                </div>
            )}
        </section>
    );
};
