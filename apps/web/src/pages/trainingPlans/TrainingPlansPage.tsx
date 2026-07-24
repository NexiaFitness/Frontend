/**
 * TrainingPlansPage.tsx — Gestión de planificación y plantillas de planes
 *
 * Vista con pestañas (mismo patrón que Sesiones): Planificación | Plantillas,
 * paginación independiente por pestaña y CTA principal arriba a la derecha.
 * ?tab=templates abre la pestaña Plantillas (p. ej. vuelta desde detalle plantilla).
 *
 * @author Frontend Team
 * @since v3.2.0
 * @updated v6.x - TabsBar, URL sync, CTA "Nueva planificación"
 * @updated v6.5.0 - Modal SelectClientModal para flujo unificado de creación de planes
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus, Search } from "lucide-react";
import {
    useGetTrainingPlansQuery,
    useGetTrainingPlanTemplatesQuery,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { usePagination } from "@nexia/shared/hooks/common";
import type { RootState } from "@nexia/shared/store";
import { scrollDashboardMainToTop } from "@/lib/dashboardScroll";
import {
    TRAINING_PLAN_GOAL,
    TEMPLATE_LEVEL,
    type TrainingPlan,
    type TrainingPlanTemplate,
} from "@nexia/shared/types/training";

import { TrainingPlansSection } from "@/components/trainingPlans";
import { SelectClientModal } from "@/components/trainingPlans/modals/SelectClientModal";
import { Alert } from "@/components/ui/feedback";
import { PaginationBar } from "@/components/ui/pagination";
import { Button } from "@/components/ui/buttons";
import { TabsBar } from "@/components/ui/tabs/TabsBar";
import { Input, FormCombobox, DatePickerButton } from "@/components/ui/forms";
import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/shared";

type PlansTabId = "planning" | "templates";

/** Objetivos del backend → etiqueta en español (alineado con TrainingPlanCard). */
const PLAN_GOAL_LABEL_ES: Record<(typeof TRAINING_PLAN_GOAL)[keyof typeof TRAINING_PLAN_GOAL], string> = {
    [TRAINING_PLAN_GOAL.HYPERTROPHY]: "Hipertrofia",
    [TRAINING_PLAN_GOAL.STRENGTH]: "Fuerza",
    [TRAINING_PLAN_GOAL.POWER]: "Potencia",
    [TRAINING_PLAN_GOAL.ENDURANCE]: "Resistencia",
    [TRAINING_PLAN_GOAL.WEIGHT_LOSS]: "Pérdida de peso",
    [TRAINING_PLAN_GOAL.GENERAL_FITNESS]: "Fitness general",
    [TRAINING_PLAN_GOAL.REHABILITATION]: "Rehabilitación",
    [TRAINING_PLAN_GOAL.SPORT_PERFORMANCE]: "Rendimiento deportivo",
};

const PLAN_GOAL_SELECT_OPTIONS: { value: string; label: string }[] = [
    { value: "all", label: "Todos" },
    ...Object.values(TRAINING_PLAN_GOAL).map((goal) => ({
        value: goal,
        label: PLAN_GOAL_LABEL_ES[goal],
    })),
];

function planOverlapsDateRange(plan: TrainingPlan, dateFrom: string, dateTo: string): boolean {
    if (!dateFrom && !dateTo) return true;
    const start = plan.start_date?.slice(0, 10) ?? "";
    const end = plan.end_date?.slice(0, 10) ?? "";
    if (dateFrom && end < dateFrom) return false;
    if (dateTo && start > dateTo) return false;
    return true;
}

function templateCreatedInRange(
    template: TrainingPlanTemplate,
    dateFrom: string,
    dateTo: string
): boolean {
    if (!dateFrom && !dateTo) return true;
    const created = template.created_at?.slice(0, 10) ?? "";
    if (dateFrom && created < dateFrom) return false;
    if (dateTo && created > dateTo) return false;
    return true;
}

const PLAN_STATUS_FILTER_OPTIONS = [
    { value: "all", label: "Todas" },
    { value: "active", label: "Activos" },
    { value: "completed", label: "Completados" },
    { value: "paused", label: "Pausados" },
    { value: "cancelled", label: "Cancelados" },
] as const;

const TEMPLATE_LEVEL_FILTER_OPTIONS = [
    { value: "all", label: "Todas" },
    { value: TEMPLATE_LEVEL.BEGINNER, label: "Principiante" },
    { value: TEMPLATE_LEVEL.INTERMEDIATE, label: "Intermedio" },
    { value: TEMPLATE_LEVEL.ADVANCED, label: "Avanzado" },
] as const;

/** DESIGN.md §5.4 Filter Chips — rectangulares, h-9, rounded-md. */
function listFilterChipClass(active: boolean): string {
    return cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
        active
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-input hover:text-foreground"
    );
}

function listFilterCountClass(active: boolean): string {
    return cn(
        "tabular-nums font-normal",
        active ? "text-primary/60" : "text-muted-foreground/50"
    );
}

function applyPlanSecondaryFilters(
    plans: TrainingPlan[],
    goalFilter: string,
    dateFrom: string,
    dateTo: string,
    searchQ: string,
    clientNamesMap: Record<number, string>
): TrainingPlan[] {
    let list = plans;
    if (goalFilter !== "all") {
        list = list.filter((p) => (p.goal ?? "").trim() === goalFilter);
    }
    list = list.filter((p) => planOverlapsDateRange(p, dateFrom, dateTo));
    const q = searchQ.trim().toLowerCase();
    if (q) {
        list = list.filter((plan) => {
            const nameMatch = plan.name?.toLowerCase().includes(q);
            const clientName = plan.client_id ? clientNamesMap[plan.client_id] : "";
            const clientMatch = clientName?.toLowerCase().includes(q);
            return nameMatch || clientMatch;
        });
    }
    return list;
}

function applyTemplateSecondaryFilters(
    templatesList: TrainingPlanTemplate[],
    goalFilter: string,
    dateFrom: string,
    dateTo: string,
    searchQ: string
): TrainingPlanTemplate[] {
    let list = templatesList;
    if (goalFilter !== "all") {
        list = list.filter((t) => (t.goal ?? "").trim() === goalFilter);
    }
    list = list.filter((t) => templateCreatedInRange(t, dateFrom, dateTo));
    const q = searchQ.trim().toLowerCase();
    if (q) {
        list = list.filter((t) => {
            const name = t.name?.toLowerCase().includes(q);
            const desc = t.description?.toLowerCase().includes(q);
            return name || desc;
        });
    }
    return list;
}

function resolvePlansEmptyState(
    statusFilter: string,
    hasSecondaryFilters: boolean,
    totalPlansAll: number
): { title: string; description?: string; showCreateAction: boolean } {
    const filterHint = hasSecondaryFilters
        ? "Prueba a cambiar el objetivo, las fechas o la búsqueda."
        : undefined;
    if (statusFilter === "active") {
        return { title: "Sin planes activos", description: filterHint, showCreateAction: false };
    }
    if (statusFilter === "completed") {
        return { title: "Sin planes completados", description: filterHint, showCreateAction: false };
    }
    if (statusFilter === "paused") {
        return { title: "Sin planes pausados", description: filterHint, showCreateAction: false };
    }
    if (statusFilter === "cancelled") {
        return { title: "Sin planes cancelados", description: filterHint, showCreateAction: false };
    }
    if (totalPlansAll === 0 && !hasSecondaryFilters) {
        return {
            title: "Sin planificaciones",
            description:
                "Crea la primera planificación para asignar un programa de entrenamiento a un cliente.",
            showCreateAction: true,
        };
    }
    return {
        title: "Ningún plan encontrado",
        description: hasSecondaryFilters
            ? "Prueba a cambiar el objetivo, las fechas o la búsqueda."
            : undefined,
        showCreateAction: false,
    };
}

function resolveTemplatesEmptyState(
    levelFilter: string,
    hasSecondaryFilters: boolean,
    totalTemplatesAll: number
): { title: string; description?: string; showCreateAction: boolean } {
    const levelLabel = TEMPLATE_LEVEL_FILTER_OPTIONS.find((o) => o.value === levelFilter)?.label;
    if (levelFilter !== "all" && levelLabel) {
        return {
            title: `Sin plantillas ${levelLabel.toLowerCase()}`,
            description: hasSecondaryFilters
                ? "Prueba a cambiar el objetivo, las fechas o la búsqueda."
                : undefined,
            showCreateAction: false,
        };
    }
    if (totalTemplatesAll === 0 && !hasSecondaryFilters) {
        return {
            title: "Sin plantillas",
            description: "Crea la primera plantilla reutilizable para tus programas de entrenamiento.",
            showCreateAction: true,
        };
    }
    return {
        title: "Ninguna plantilla encontrada",
        description: hasSecondaryFilters
            ? "Prueba a cambiar el objetivo, las fechas o la búsqueda."
            : undefined,
        showCreateAction: false,
    };
}

export const TrainingPlansPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get("tab");
    const user = useSelector((state: RootState) => state.auth.user);

    const [activeTab, setActiveTab] = useState<PlansTabId>(() =>
        tabParam === "templates" ? "templates" : "planning"
    );

    useEffect(() => {
        if (tabParam === "templates") {
            setActiveTab("templates");
        } else if (tabParam == null || tabParam === "") {
            setActiveTab("planning");
        }
    }, [tabParam]);

    const handleTabChange = useCallback(
        (id: string) => {
            if (id !== "planning" && id !== "templates") return;
            setActiveTab(id);
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (id === "templates") {
                        next.set("tab", "templates");
                    } else {
                        next.delete("tab");
                    }
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });
    const trainerId = trainerProfile?.id;

    const [planStatusFilter, setPlanStatusFilter] = useState<string>("all");
    const [planGoalFilter, setPlanGoalFilter] = useState<string>("all");
    const [planDateFrom, setPlanDateFrom] = useState("");
    const [planDateTo, setPlanDateTo] = useState("");
    const [searchPlans, setSearchPlans] = useState("");
    const [searchPlansDebounced, setSearchPlansDebounced] = useState("");

    const [templateLevelFilter, setTemplateLevelFilter] = useState<string>("all");
    const [templateGoalFilter, setTemplateGoalFilter] = useState<string>("all");
    const [templateDateFrom, setTemplateDateFrom] = useState("");
    const [templateDateTo, setTemplateDateTo] = useState("");
    const [searchTemplates, setSearchTemplates] = useState("");
    const [searchTemplatesDebounced, setSearchTemplatesDebounced] = useState("");

    useEffect(() => {
        const t = setTimeout(() => setSearchPlansDebounced(searchPlans), 300);
        return () => clearTimeout(t);
    }, [searchPlans]);

    useEffect(() => {
        const t = setTimeout(() => setSearchTemplatesDebounced(searchTemplates), 300);
        return () => clearTimeout(t);
    }, [searchTemplates]);

    const ITEMS_PER_PAGE = 9;
    const API_LIMIT = 500;

    const {
        data: templates = [],
        isLoading: isLoadingTemplates,
    } = useGetTrainingPlanTemplatesQuery(
        trainerId ? { trainerId, skip: 0, limit: API_LIMIT } : { trainerId: 0 },
        { skip: !trainerId }
    );

    const {
        data: plans = [],
        isLoading: isLoadingPlans,
    } = useGetTrainingPlansQuery(
        trainerId ? { trainer_id: trainerId, skip: 0, limit: API_LIMIT } : { trainer_id: 0 },
        {
            skip: !trainerId,
            refetchOnMountOrArgChange: true,
        }
    );

    const { data: clientsData } = useGetTrainerClientsQuery(
        {
            trainerId: trainerId!,
            filters: {},
            page: 1,
            per_page: 50,
        },
        { skip: !trainerId }
    );

    const clientNamesMap = useMemo(() => {
        const clients = clientsData?.items ?? [];
        const map: Record<number, string> = {};
        clients.forEach((client) => {
            map[client.id] = `${client.nombre} ${client.apellidos}`;
        });
        return map;
    }, [clientsData?.items]);

    /** Planes asignados a cliente (pestaña Planificación); el estado se filtra con las pastillas. */
    const assignedPlans = useMemo(() => {
        return plans.filter((plan) => plan.client_id != null);
    }, [plans]);

    const plansForCounts = useMemo(
        () =>
            applyPlanSecondaryFilters(
                assignedPlans,
                planGoalFilter,
                planDateFrom,
                planDateTo,
                searchPlansDebounced,
                clientNamesMap
            ),
        [
            assignedPlans,
            planGoalFilter,
            planDateFrom,
            planDateTo,
            searchPlansDebounced,
            clientNamesMap,
        ]
    );

    const planStatusCounts = useMemo(
        () => ({
            all: plansForCounts.length,
            active: plansForCounts.filter((p) => p.status === "active").length,
            completed: plansForCounts.filter((p) => p.status === "completed").length,
            paused: plansForCounts.filter((p) => p.status === "paused").length,
            cancelled: plansForCounts.filter((p) => p.status === "cancelled").length,
        }),
        [plansForCounts]
    );

    const filteredAssignedPlans = useMemo(() => {
        if (planStatusFilter === "all") return plansForCounts;
        return plansForCounts.filter((p) => p.status === planStatusFilter);
    }, [plansForCounts, planStatusFilter]);

    const templatesForCounts = useMemo(
        () =>
            applyTemplateSecondaryFilters(
                templates,
                templateGoalFilter,
                templateDateFrom,
                templateDateTo,
                searchTemplatesDebounced
            ),
        [templates, templateGoalFilter, templateDateFrom, templateDateTo, searchTemplatesDebounced]
    );

    const templateLevelCounts = useMemo(
        () => ({
            all: templatesForCounts.length,
            [TEMPLATE_LEVEL.BEGINNER]: templatesForCounts.filter(
                (t) => t.level === TEMPLATE_LEVEL.BEGINNER
            ).length,
            [TEMPLATE_LEVEL.INTERMEDIATE]: templatesForCounts.filter(
                (t) => t.level === TEMPLATE_LEVEL.INTERMEDIATE
            ).length,
            [TEMPLATE_LEVEL.ADVANCED]: templatesForCounts.filter(
                (t) => t.level === TEMPLATE_LEVEL.ADVANCED
            ).length,
        }),
        [templatesForCounts]
    );

    const filteredTemplates = useMemo(() => {
        if (templateLevelFilter === "all") return templatesForCounts;
        return templatesForCounts.filter((t) => t.level === templateLevelFilter);
    }, [templatesForCounts, templateLevelFilter]);

    const hasPlanSecondaryFilters =
        planGoalFilter !== "all" ||
        Boolean(planDateFrom) ||
        Boolean(planDateTo) ||
        Boolean(searchPlansDebounced.trim());

    const plansEmptyState = useMemo(
        () =>
            resolvePlansEmptyState(
                planStatusFilter,
                hasPlanSecondaryFilters,
                planStatusCounts.all
            ),
        [planStatusFilter, hasPlanSecondaryFilters, planStatusCounts.all]
    );

    const hasTemplateSecondaryFilters =
        templateGoalFilter !== "all" ||
        Boolean(templateDateFrom) ||
        Boolean(templateDateTo) ||
        Boolean(searchTemplatesDebounced.trim());

    const templatesEmptyState = useMemo(
        () =>
            resolveTemplatesEmptyState(
                templateLevelFilter,
                hasTemplateSecondaryFilters,
                templateLevelCounts.all
            ),
        [templateLevelFilter, hasTemplateSecondaryFilters, templateLevelCounts.all]
    );

    const ACTIVE_PLANS_PER_PAGE = 6;
    const {
        currentPage: activePlansPage,
        totalPages: totalActivePlansPages,
        paginatedItems: paginatedActivePlans,
        totalItems: totalActivePlans,
        setPage: setActivePlansPage,
    } = usePagination({
        items: filteredAssignedPlans,
        itemsPerPage: ACTIVE_PLANS_PER_PAGE,
        resetOnItemsChange: true,
    });

    const handleAssignedPlansPageChange = (page: number): void => {
        setActivePlansPage(page);
        scrollDashboardMainToTop("smooth");
    };

    const resetPlanningPage = useCallback(() => {
        setActivePlansPage(1);
    }, [setActivePlansPage]);

    const {
        currentPage: templatesPage,
        totalPages: totalTemplatesPages,
        paginatedItems: paginatedTemplates,
        totalItems: totalTemplates,
        setPage: setTemplatesPage,
    } = usePagination({
        items: filteredTemplates,
        itemsPerPage: ITEMS_PER_PAGE,
        resetOnItemsChange: true,
    });

    const handleTemplatesPageChange = (page: number): void => {
        setTemplatesPage(page);
        scrollDashboardMainToTop("smooth");
    };

    const resetTemplatesPage = useCallback(() => {
        setTemplatesPage(1);
    }, [setTemplatesPage]);

    const clientsMap = useMemo(() => {
        const clients = clientsData?.items ?? [];
        const map: Record<number, (typeof clients)[number][]> = {};
        paginatedActivePlans.forEach((plan) => {
            if (plan.client_id) {
                const client = clients.find((c) => c.id === plan.client_id);
                map[plan.id] = client ? [client] : [];
            } else {
                map[plan.id] = [];
            }
        });
        return map;
    }, [paginatedActivePlans, clientsData?.items]);

    const handleCreateTemplate = () => {
        navigate("/dashboard/training-plans/templates/create");
    };

    const [isSelectClientModalOpen, setIsSelectClientModalOpen] = useState(false);

    const handleCreatePlan = () => {
        setIsSelectClientModalOpen(true);
    };

    const isLoading = isLoadingTemplates || isLoadingPlans;

    return (
        <div className="space-y-6">
            {!trainerId && !isLoading && user?.role === "trainer" && (
                <Alert variant="error">
                    No se pudo cargar tu perfil de trainer. Por favor, completa tu perfil primero.
                </Alert>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <PageTitle
                    title={activeTab === "planning" ? "Planificación" : "Plantillas"}
                    subtitle={
                        activeTab === "planning"
                            ? `${planStatusCounts.all} planes asignados`
                            : `${templateLevelCounts.all} plantillas disponibles`
                    }
                />
                {activeTab === "planning" ? (
                    <Button size="sm" onClick={handleCreatePlan}>
                        <Plus className="mr-1 h-4 w-4" aria-hidden />
                        Nueva planificación
                    </Button>
                ) : (
                    <Button size="sm" onClick={handleCreateTemplate}>
                        <Plus className="mr-1 h-4 w-4" aria-hidden />
                        Nueva plantilla
                    </Button>
                )}
            </div>

            <TabsBar
                ariaLabel="Planificación y plantillas"
                value={activeTab}
                onChange={handleTabChange}
                items={[
                    { id: "planning", label: "Planificación" },
                    { id: "templates", label: "Plantillas" },
                ]}
                distribute="equal"
            />

            {activeTab === "planning" && (
                <>
                    <div className="flex flex-wrap items-center gap-2">
                        <div
                            className="flex flex-wrap items-center gap-1.5"
                            role="group"
                            aria-label="Filtrar por estado del plan"
                        >
                            {PLAN_STATUS_FILTER_OPTIONS.map(({ value, label }) => {
                                const active = planStatusFilter === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            setPlanStatusFilter(value);
                                            resetPlanningPage();
                                        }}
                                        className={listFilterChipClass(active)}
                                        aria-pressed={active}
                                    >
                                        <span>{label}</span>
                                        <span className={listFilterCountClass(active)}>
                                            {planStatusCounts[value]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="h-9 w-44 min-w-[11rem]">
                            <FormCombobox
                                value={planGoalFilter}
                                onChange={(v) => {
                                    setPlanGoalFilter(v);
                                    resetPlanningPage();
                                }}
                                options={PLAN_GOAL_SELECT_OPTIONS}
                                placeholder="Todos"
                                size="sm"
                                className="w-full"
                                ariaLabel="Filtrar por objetivo del plan"
                            />
                        </div>
                        <div className="flex h-9 items-center gap-2">
                            <DatePickerButton
                                label="Desde"
                                value={planDateFrom}
                                onChange={(v) => {
                                    setPlanDateFrom(v);
                                    resetPlanningPage();
                                }}
                                aria-label="Desde"
                            />
                            <span className="text-muted-foreground text-sm">–</span>
                            <DatePickerButton
                                label="Hasta"
                                value={planDateTo}
                                onChange={(v) => {
                                    setPlanDateTo(v);
                                    resetPlanningPage();
                                }}
                                aria-label="Hasta"
                            />
                        </div>
                        <div className="relative ml-auto h-9 w-full sm:w-56">
                            <Search
                                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden
                            />
                            <Input
                                type="text"
                                size="sm"
                                placeholder="Buscar plan o cliente..."
                                value={searchPlans}
                                onChange={(e) => {
                                    setSearchPlans(e.target.value);
                                    resetPlanningPage();
                                }}
                                className="h-9 w-full pl-8"
                                aria-label="Buscar plan o cliente"
                            />
                        </div>
                    </div>

                    <TrainingPlansSection
                        title="Planificación"
                        description="Programas de entrenamiento asignados a clientes actualmente"
                        showHeading={false}
                        items={paginatedActivePlans}
                        type="active"
                        clientNames={clientNamesMap}
                        clientsMap={clientsMap}
                        onCreate={handleCreatePlan}
                        isLoading={isLoadingPlans}
                        emptyTitle={plansEmptyState.title}
                        emptyDescription={plansEmptyState.description}
                        emptyShowCreateAction={plansEmptyState.showCreateAction}
                    />
                    {totalActivePlansPages > 1 && (
                        <PaginationBar
                            currentPage={activePlansPage}
                            totalPages={totalActivePlansPages}
                            totalItems={totalActivePlans}
                            pageSize={ACTIVE_PLANS_PER_PAGE}
                            onPageChange={handleAssignedPlansPageChange}
                        />
                    )}
                </>
            )}

            {activeTab === "templates" && (
                <>
                    <div className="flex flex-wrap items-center gap-2">
                        <div
                            className="flex flex-wrap items-center gap-1.5"
                            role="group"
                            aria-label="Filtrar por nivel de plantilla"
                        >
                            {TEMPLATE_LEVEL_FILTER_OPTIONS.map(({ value, label }) => {
                                const active = templateLevelFilter === value;
                                const count =
                                    value === "all"
                                        ? templateLevelCounts.all
                                        : templateLevelCounts[value as keyof typeof templateLevelCounts];
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            setTemplateLevelFilter(value);
                                            resetTemplatesPage();
                                        }}
                                        className={listFilterChipClass(active)}
                                        aria-pressed={active}
                                    >
                                        <span>{label}</span>
                                        <span className={listFilterCountClass(active)}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="h-9 w-44 min-w-[11rem]">
                            <FormCombobox
                                value={templateGoalFilter}
                                onChange={(v) => {
                                    setTemplateGoalFilter(v);
                                    resetTemplatesPage();
                                }}
                                options={PLAN_GOAL_SELECT_OPTIONS}
                                placeholder="Todos"
                                size="sm"
                                className="w-full"
                                ariaLabel="Filtrar por objetivo de plantilla"
                            />
                        </div>
                        <div className="flex h-9 items-center gap-2">
                            <DatePickerButton
                                label="Desde"
                                value={templateDateFrom}
                                onChange={(v) => {
                                    setTemplateDateFrom(v);
                                    resetTemplatesPage();
                                }}
                                aria-label="Plantilla creada desde"
                            />
                            <span className="text-muted-foreground text-sm">–</span>
                            <DatePickerButton
                                label="Hasta"
                                value={templateDateTo}
                                onChange={(v) => {
                                    setTemplateDateTo(v);
                                    resetTemplatesPage();
                                }}
                                aria-label="Plantilla creada hasta"
                            />
                        </div>
                        <div className="relative ml-auto h-9 w-full sm:w-56">
                            <Search
                                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden
                            />
                            <Input
                                type="text"
                                size="sm"
                                placeholder="Buscar plantilla..."
                                value={searchTemplates}
                                onChange={(e) => {
                                    setSearchTemplates(e.target.value);
                                    resetTemplatesPage();
                                }}
                                className="h-9 w-full pl-8"
                                aria-label="Buscar plantilla"
                            />
                        </div>
                    </div>

                    <TrainingPlansSection
                        title="Plantillas"
                        description="Plantillas reutilizables que puedes asignar a múltiples clientes"
                        showHeading={false}
                        items={paginatedTemplates}
                        type="template"
                        onCreate={handleCreateTemplate}
                        isLoading={isLoadingTemplates}
                        emptyTitle={templatesEmptyState.title}
                        emptyDescription={templatesEmptyState.description}
                        emptyShowCreateAction={templatesEmptyState.showCreateAction}
                    />
                    {totalTemplates > ITEMS_PER_PAGE && (
                        <PaginationBar
                            currentPage={templatesPage}
                            totalPages={totalTemplatesPages}
                            totalItems={totalTemplates}
                            pageSize={ITEMS_PER_PAGE}
                            onPageChange={handleTemplatesPageChange}
                        />
                    )}
                </>
            )}

            <SelectClientModal
                isOpen={isSelectClientModalOpen}
                onClose={() => setIsSelectClientModalOpen(false)}
            />
        </div>
    );
};
