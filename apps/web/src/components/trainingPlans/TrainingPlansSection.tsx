/**
 * TrainingPlansSection.tsx — Grid premium de planes/plantillas (tabs Planificación | Plantillas).
 *
 * Tokens: templateLibraryPresentation.ts (TRAINING_PLANS_TABS_*)
 * Doc: DESIGN_PREMIUM.md
 */

import React from "react";
import { Archive, ClipboardList, FileStack, Plus } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { SearchBar } from "@/components/ui/forms";
import { LoadingSpinner } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { TrainingPlanCard } from "./TrainingPlanCard";
import { TrainingPlanTemplateCard } from "./TrainingPlanTemplateCard";
import {
    PLANNING_LIBRARY_COPY,
    TEMPLATE_LIBRARY_CARD_GRID,
    TEMPLATE_LIBRARY_EMPTY_BODY,
    TEMPLATE_LIBRARY_EMPTY_GLOW,
    TEMPLATE_LIBRARY_EMPTY_SHELL,
    TEMPLATE_LIBRARY_EMPTY_TITLE,
    TEMPLATE_LIBRARY_LOADING_SHELL,
    TEMPLATE_LIBRARY_PRIMARY_CTA,
    TEMPLATE_LIBRARY_SECTION_DESC,
    TRAINING_PLANS_TABS_SECTION_DESC,
} from "./templateLibraryPresentation";
import type { TrainingPlan, TrainingPlanTemplate } from "@nexia/shared/types/training";
import type { Client } from "@nexia/shared/types/client";
import { cn } from "@/lib/utils";

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
    /** Vacío contextual (mismo patrón que Sesiones / EmptyState). */
    emptyTitle?: string;
    emptyDescription?: string;
    emptyShowCreateAction?: boolean;
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
    emptyTitle,
    emptyDescription,
    emptyShowCreateAction = false,
}) => {
    const isTemplate = type === "template";
    const isPremiumLibrary = isTemplate || type === "active";
    const SectionIcon = type === "template" ? FileStack : type === "archived" ? Archive : ClipboardList;

    const sectionDescriptionClass = isPremiumLibrary
        ? isTemplate
            ? TEMPLATE_LIBRARY_SECTION_DESC
            : TRAINING_PLANS_TABS_SECTION_DESC
        : "mb-4 text-xs text-muted-foreground";

    const emptyCreateLabel = isTemplate
        ? "Crear primera plantilla"
        : PLANNING_LIBRARY_COPY.createFirst;

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
                                <span className="text-sm text-muted-foreground sm:text-base">
                                    {totalCount} total
                                </span>
                            )}
                        </div>
                        {description ? (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        ) : null}
                    </div>
                    {onCreate ? (
                        <Button
                            variant="primary"
                            size="sm"
                            className={isPremiumLibrary ? TEMPLATE_LIBRARY_PRIMARY_CTA : "w-full sm:w-auto"}
                            onClick={onCreate}
                        >
                            {type === "active" ? "+ Nuevo Programa" : "+ Crear Plantilla"}
                        </Button>
                    ) : null}
                </div>
            ) : description ? (
                <p className={sectionDescriptionClass}>{description}</p>
            ) : null}

            {onSearchChange && !isTemplate ? (
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <SearchBar
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                        ariaLabel={searchAriaLabel}
                    />
                </div>
            ) : null}

            {isLoading ? (
                isPremiumLibrary ? (
                    <div className={TEMPLATE_LIBRARY_LOADING_SHELL}>
                        <NexiaGlassAccentRim />
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border bg-card p-12">
                        <LoadingSpinner size="lg" />
                    </div>
                )
            ) : items.length === 0 ? (
                isPremiumLibrary ? (
                    <div className={cn(TEMPLATE_LIBRARY_EMPTY_SHELL, "py-12")}>
                        <NexiaGlassAccentRim />
                        <div className={TEMPLATE_LIBRARY_EMPTY_GLOW} aria-hidden />
                        <p className={TEMPLATE_LIBRARY_EMPTY_TITLE}>
                            {emptyTitle ?? (isTemplate ? "No hay plantillas aún" : "No hay planes aún")}
                        </p>
                        {emptyDescription ? (
                            <p className={TEMPLATE_LIBRARY_EMPTY_BODY}>{emptyDescription}</p>
                        ) : null}
                        {emptyShowCreateAction && onCreate ? (
                            <Button
                                variant="primary"
                                size="sm"
                                className={cn("mt-4", TEMPLATE_LIBRARY_PRIMARY_CTA)}
                                onClick={onCreate}
                            >
                                {isTemplate ? (
                                    <FileStack className="mr-2 h-4 w-4" aria-hidden />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                                )}
                                {emptyCreateLabel}
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <div className={cn(TEMPLATE_LIBRARY_EMPTY_SHELL, "py-12")}>
                        <NexiaGlassAccentRim />
                        <div className={TEMPLATE_LIBRARY_EMPTY_GLOW} aria-hidden />
                        <p className={TEMPLATE_LIBRARY_EMPTY_TITLE}>
                            {emptyTitle ?? "No hay planes archivados"}
                        </p>
                        {emptyDescription ? (
                            <p className={TEMPLATE_LIBRARY_EMPTY_BODY}>{emptyDescription}</p>
                        ) : null}
                    </div>
                )
            ) : (
                <div className={TEMPLATE_LIBRARY_CARD_GRID}>
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
