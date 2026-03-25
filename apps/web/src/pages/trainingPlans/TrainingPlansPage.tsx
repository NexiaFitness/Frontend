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
import { Input, FormSelect, DatePickerButton } from "@/components/ui/forms";
import { cn } from "@/lib/utils";

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

    const filteredAssignedPlans = useMemo(() => {
        let list = assignedPlans;
        if (planStatusFilter !== "all") {
            list = list.filter((p) => p.status === planStatusFilter);
        }
        if (planGoalFilter !== "all") {
            list = list.filter((p) => (p.goal ?? "").trim() === planGoalFilter);
        }
        list = list.filter((p) => planOverlapsDateRange(p, planDateFrom, planDateTo));
        const q = searchPlansDebounced.trim().toLowerCase();
        if (q) {
            list = list.filter((plan) => {
                const nameMatch = plan.name?.toLowerCase().includes(q);
                const clientName = plan.client_id ? clientNamesMap[plan.client_id] : "";
                const clientMatch = clientName?.toLowerCase().includes(q);
                return nameMatch || clientMatch;
            });
        }
        return list;
    }, [
        assignedPlans,
        planStatusFilter,
        planGoalFilter,
        planDateFrom,
        planDateTo,
        searchPlansDebounced,
        clientNamesMap,
    ]);

    const filteredTemplates = useMemo(() => {
        let list = templates;
        if (templateLevelFilter !== "all") {
            list = list.filter((t) => t.level === templateLevelFilter);
        }
        if (templateGoalFilter !== "all") {
            list = list.filter((t) => (t.goal ?? "").trim() === templateGoalFilter);
        }
        list = list.filter((t) => templateCreatedInRange(t, templateDateFrom, templateDateTo));
        const q = searchTemplatesDebounced.trim().toLowerCase();
        if (q) {
            list = list.filter((t) => {
                const name = t.name?.toLowerCase().includes(q);
                const desc = t.description?.toLowerCase().includes(q);
                return name || desc;
            });
        }
        return list;
    }, [
        templates,
        templateLevelFilter,
        templateGoalFilter,
        templateDateFrom,
        templateDateTo,
        searchTemplatesDebounced,
    ]);

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
        window.scrollTo({ top: 0, behavior: "smooth" });
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
        window.scrollTo({ top: 0, behavior: "smooth" });
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
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {activeTab === "planning" ? "Planificación" : "Plantillas"}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {activeTab === "planning"
                            ? `${filteredAssignedPlans.length} planes activos`
                            : `${filteredTemplates.length} plantillas disponibles`}
                    </p>
                </div>
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
            />

            {activeTab === "planning" && (
                <>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { value: "all", label: "Todas" },
                                { value: "active", label: "Activos" },
                                { value: "completed", label: "Completados" },
                                { value: "paused", label: "Pausados" },
                                { value: "cancelled", label: "Cancelados" },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setPlanStatusFilter(value);
                                        resetPlanningPage();
                                    }}
                                    className={cn(
                                        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                        planStatusFilter === value
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-surface-2 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="w-44 min-w-[176px]">
                            <FormSelect
                                value={planGoalFilter}
                                onChange={(e) => {
                                    setPlanGoalFilter(e.target.value);
                                    resetPlanningPage();
                                }}
                                options={PLAN_GOAL_SELECT_OPTIONS}
                                placeholder="Todos"
                                size="sm"
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
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
                        <div className="relative ml-auto">
                            <Search
                                className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
                                className="w-56 pl-8"
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
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { value: "all", label: "Todas" },
                                { value: TEMPLATE_LEVEL.BEGINNER, label: "Principiante" },
                                { value: TEMPLATE_LEVEL.INTERMEDIATE, label: "Intermedio" },
                                { value: TEMPLATE_LEVEL.ADVANCED, label: "Avanzado" },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setTemplateLevelFilter(value);
                                        resetTemplatesPage();
                                    }}
                                    className={cn(
                                        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                        templateLevelFilter === value
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-surface-2 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="w-44 min-w-[176px]">
                            <FormSelect
                                value={templateGoalFilter}
                                onChange={(e) => {
                                    setTemplateGoalFilter(e.target.value);
                                    resetTemplatesPage();
                                }}
                                options={PLAN_GOAL_SELECT_OPTIONS}
                                placeholder="Todos"
                                size="sm"
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
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
                        <div className="relative ml-auto">
                            <Search
                                className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
                                className="w-56 pl-8"
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
