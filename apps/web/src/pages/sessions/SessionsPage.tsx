/**
 * SessionsPage — Listado unificado de sesiones (training + standalone)
 *
 * VISTA_LISTADO_SESIONES Fase 2-7 · premium DESIGN_PREMIUM.md (paridad TrainingPlansPage).
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, CalendarDays, Search } from "lucide-react";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetSessionsQuery } from "@nexia/shared/api/sessionsApi";
import { useGetSessionTemplatesQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import type { SessionOut } from "@nexia/shared/types/sessions";
import type { SessionTemplate } from "@nexia/shared/types/sessionProgramming";
import { LoadingSpinner, EmptyState } from "@/components/ui/feedback";
import { FormCombobox, DatePickerButton, Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { PaginationBar } from "@/components/ui/pagination";
import { TabsBar } from "@/components/ui/tabs/TabsBar";
import { PageTitle } from "@/components/dashboard/shared";
import { TrainerSessionsListRow } from "@/components/sessions/TrainerSessionsListRow";
import {
    SESSIONS_PAGE,
    SESSIONS_PAGE_COPY,
    SESSIONS_PAGE_EMPTY_GLOW,
    SESSIONS_PAGE_EMPTY_SHELL,
    SESSIONS_PAGE_EMPTY_ACTION,
    SESSIONS_PAGE_GLOW,
    SESSIONS_PAGE_HEADER,
    SESSIONS_PAGE_LIST,
    SESSIONS_PAGE_LOADING,
    SESSIONS_PAGE_PRIMARY_CTA,
    SESSIONS_PAGE_SEARCH_ICON,
    SESSIONS_PAGE_SEARCH_INPUT,
    SESSIONS_PAGE_SEARCH_WRAP,
    SESSIONS_PAGE_STACK,
    SESSIONS_PAGE_TEMPLATE_CARD,
    SESSIONS_PAGE_TEMPLATE_META,
    SESSIONS_PAGE_TEMPLATE_TITLE,
    SESSIONS_PAGE_TITLE_WRAP,
    SESSIONS_PAGE_TOOLBAR,
    sessionsPageFilterChipClass,
    sessionsPageFilterCountClass,
} from "@/components/sessions/sessionsPagePresentation";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";
import { scrollDashboardMainToTop } from "@/lib/dashboardScroll";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "Todas" },
    { value: "planned", label: "Planificadas" },
    { value: "completed", label: "Completadas" },
    { value: "cancelled", label: "Canceladas" },
] as const;

const SESSION_TYPE_FILTER_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "strength", label: "Fuerza" },
    { value: "cardio", label: "Cardio" },
    { value: "technique", label: "Técnica" },
    { value: "assessment", label: "Evaluación" },
];

function resolveSessionsEmptyState(
    statusFilter: string,
    hasSecondaryFilters: boolean,
    totalSessionsAll: number
): { title: string; description?: string; showCreateAction: boolean } {
    if (statusFilter === "planned") {
        return {
            title: "Sin sesiones planificadas",
            description: hasSecondaryFilters
                ? "Prueba a cambiar el tipo, las fechas o la búsqueda."
                : undefined,
            showCreateAction: false,
        };
    }
    if (statusFilter === "completed") {
        return {
            title: "Sin sesiones completadas",
            description: hasSecondaryFilters
                ? "Prueba a cambiar el tipo, las fechas o la búsqueda."
                : undefined,
            showCreateAction: false,
        };
    }
    if (statusFilter === "cancelled") {
        return {
            title: "Sin sesiones canceladas",
            description: hasSecondaryFilters
                ? "Prueba a cambiar el tipo, las fechas o la búsqueda."
                : undefined,
            showCreateAction: false,
        };
    }
    if (totalSessionsAll === 0 && !hasSecondaryFilters) {
        return {
            title: "Sin sesiones",
            description:
                "Crea la primera sesión para empezar a programar entrenamientos con tus clientes.",
            showCreateAction: true,
        };
    }
    return {
        title: "Ninguna sesión encontrada",
        description: hasSecondaryFilters
            ? "Prueba a cambiar el tipo, las fechas o la búsqueda."
            : undefined,
        showCreateAction: false,
    };
}

function formatSessionDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function getDetailUrl(s: SessionOut): string {
    return s.session_kind === "training"
        ? `/dashboard/session-programming/sessions/${s.id}`
        : `/dashboard/standalone-sessions/${s.id}`;
}

function getEditUrl(s: SessionOut): string {
    return s.session_kind === "training"
        ? `/dashboard/session-programming/edit-session/${s.id}`
        : `/dashboard/standalone-sessions/${s.id}/edit`;
}

export const SessionsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });
    const trainerId = trainerProfile?.id;

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [activeTab, setActiveTab] = useState<"sessions" | "templates">("sessions");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [search, setSearch] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [page, setPage] = useState(1);

    const [templatesSearch, setTemplatesSearch] = useState("");
    const [templatesSearchDebounced, setTemplatesSearchDebounced] = useState("");
    const [templatesPage, setTemplatesPage] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => setSearchDebounced(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        const t = setTimeout(() => setTemplatesSearchDebounced(templatesSearch), 300);
        return () => clearTimeout(t);
    }, [templatesSearch]);

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        setPage(1);
    };
    const handleTypeChange = (val: string) => {
        setTypeFilter(val);
        setPage(1);
    };

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        scrollDashboardMainToTop("smooth");
    }, []);

    const handleTemplatesPageChange = useCallback((newPage: number) => {
        setTemplatesPage(newPage);
        scrollDashboardMainToTop("smooth");
    }, []);

    const skip = (page - 1) * PAGE_SIZE;
    const templatesSkip = (templatesPage - 1) * PAGE_SIZE;

    const listQueryArgs = useMemo(
        () => ({
            trainerId: trainerId ?? 0,
            skip,
            limit: PAGE_SIZE,
            status: statusFilter === "all" ? undefined : statusFilter,
            sessionType: typeFilter === "all" ? undefined : typeFilter,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            search: searchDebounced.trim() || undefined,
            orderBy: "session_date" as const,
            order: "desc" as const,
        }),
        [trainerId, skip, statusFilter, typeFilter, dateFrom, dateTo, searchDebounced]
    );

    const skipSessionsQueries = !trainerId || !isAuthenticated;

    const sessionsCountBase = useMemo(
        () => ({
            trainerId: trainerId ?? 0,
            skip: 0,
            limit: 1,
            sessionType: typeFilter === "all" ? undefined : typeFilter,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            search: searchDebounced.trim() || undefined,
            orderBy: "session_date" as const,
            order: "desc" as const,
        }),
        [trainerId, typeFilter, dateFrom, dateTo, searchDebounced]
    );

    const { data, isLoading, isError } = useGetSessionsQuery(listQueryArgs, {
        skip: skipSessionsQueries,
    });

    const { data: countAllData } = useGetSessionsQuery(sessionsCountBase, {
        skip: skipSessionsQueries,
    });
    const { data: countPlannedData } = useGetSessionsQuery(
        { ...sessionsCountBase, status: "planned" },
        { skip: skipSessionsQueries }
    );
    const { data: countCompletedData } = useGetSessionsQuery(
        { ...sessionsCountBase, status: "completed" },
        { skip: skipSessionsQueries }
    );
    const { data: countCancelledData } = useGetSessionsQuery(
        { ...sessionsCountBase, status: "cancelled" },
        { skip: skipSessionsQueries }
    );

    const statusCounts: Record<(typeof STATUS_FILTER_OPTIONS)[number]["value"], number> = {
        all: countAllData?.total ?? 0,
        planned: countPlannedData?.total ?? 0,
        completed: countCompletedData?.total ?? 0,
        cancelled: countCancelledData?.total ?? 0,
    };

    const { data: templatesData, isLoading: isLoadingTemplates } = useGetSessionTemplatesQuery(
        {
            skip: templatesSkip,
            limit: PAGE_SIZE,
            search: templatesSearchDebounced.trim() || undefined,
        },
        { skip: !isAuthenticated }
    );

    const items = data?.items ?? [];
    const total = data?.total ?? 0;

    const hasSecondaryFilters =
        typeFilter !== "all" || Boolean(dateFrom) || Boolean(dateTo) || Boolean(searchDebounced.trim());

    const sessionsEmptyState = useMemo(
        () => resolveSessionsEmptyState(statusFilter, hasSecondaryFilters, statusCounts.all),
        [statusFilter, hasSecondaryFilters, statusCounts.all]
    );
    const templatesList = templatesData?.items ?? [];
    const templatesTotal = templatesData?.total ?? 0;

    const pageSubtitle =
        activeTab === "sessions"
            ? SESSIONS_PAGE_COPY.sessionsSubtitle(total)
            : SESSIONS_PAGE_COPY.templatesSubtitle(templatesTotal);

    if (!trainerId && !isLoading) {
        return (
            <div className={SESSIONS_PAGE_LOADING}>
                <p className="text-sm text-muted-foreground">No se pudo cargar el perfil del entrenador.</p>
            </div>
        );
    }

    if (isLoading && !data) {
        return (
            <div className={SESSIONS_PAGE_LOADING}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className={SESSIONS_PAGE_LOADING}>
                <p className="text-sm text-destructive">Error al cargar las sesiones.</p>
            </div>
        );
    }

    return (
        <div className={cn(SESSIONS_PAGE, "relative")}>
            <div className={SESSIONS_PAGE_GLOW} aria-hidden />

            <div className={cn(SESSIONS_PAGE_STACK, "relative space-y-6")}>
                <div className={SESSIONS_PAGE_HEADER}>
                    <div className={SESSIONS_PAGE_TITLE_WRAP}>
                        <PageTitle
                            title={activeTab === "sessions" ? "Sesiones" : "Plantillas"}
                            subtitle={pageSubtitle}
                        />
                    </div>
                    {activeTab === "sessions" ? (
                        <Button
                            variant="primary"
                            size="sm"
                            className={SESSIONS_PAGE_PRIMARY_CTA}
                            onClick={() => navigate("/dashboard/session-programming/create-session")}
                        >
                            <Plus className="h-4 w-4 shrink-0" aria-hidden />
                            Nueva sesión
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            className={SESSIONS_PAGE_PRIMARY_CTA}
                            onClick={() => navigate("/dashboard/session-programming/create-template")}
                        >
                            <Plus className="h-4 w-4 shrink-0" aria-hidden />
                            Nueva plantilla
                        </Button>
                    )}
                </div>

                <TabsBar
                    ariaLabel="Sesiones y plantillas"
                    value={activeTab}
                    onChange={(id) => {
                        if (id === "sessions" || id === "templates") {
                            setActiveTab(id);
                            scrollDashboardMainToTop();
                        }
                    }}
                    items={[
                        { id: "sessions", label: "Sesiones" },
                        { id: "templates", label: "Plantillas" },
                    ]}
                    distribute="equal"
                />

                {activeTab === "sessions" && (
                    <>
                        <div className={SESSIONS_PAGE_TOOLBAR}>
                            <NexiaGlassAccentRim />
                            <div
                                className="flex flex-wrap items-center gap-1.5"
                                role="group"
                                aria-label="Filtrar por estado"
                            >
                                {STATUS_FILTER_OPTIONS.map(({ value, label }) => {
                                    const active = statusFilter === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleStatusChange(value)}
                                            className={sessionsPageFilterChipClass(active)}
                                            aria-pressed={active}
                                        >
                                            <span>{label}</span>
                                            <span className={sessionsPageFilterCountClass(active)}>
                                                {statusCounts[value]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="h-9 w-full min-w-0 sm:w-44 sm:min-w-[11rem]">
                                <FormCombobox
                                    value={typeFilter}
                                    onChange={handleTypeChange}
                                    options={SESSION_TYPE_FILTER_OPTIONS}
                                    placeholder="Todos"
                                    size="sm"
                                    className="w-full"
                                    ariaLabel="Filtrar por tipo de sesión"
                                />
                            </div>
                            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                                <DatePickerButton
                                    label="Desde"
                                    value={dateFrom}
                                    onChange={(v) => {
                                        setDateFrom(v);
                                        setPage(1);
                                    }}
                                    aria-label="Desde"
                                />
                                <span className="text-sm text-muted-foreground">–</span>
                                <DatePickerButton
                                    label="Hasta"
                                    value={dateTo}
                                    onChange={(v) => {
                                        setDateTo(v);
                                        setPage(1);
                                    }}
                                    aria-label="Hasta"
                                />
                            </div>
                            <div className={SESSIONS_PAGE_SEARCH_WRAP}>
                                <Search className={SESSIONS_PAGE_SEARCH_ICON} aria-hidden />
                                <Input
                                    type="text"
                                    size="sm"
                                    placeholder={SESSIONS_PAGE_COPY.searchSessions}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className={SESSIONS_PAGE_SEARCH_INPUT}
                                    aria-label="Buscar sesión o cliente"
                                />
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <div className={SESSIONS_PAGE_EMPTY_SHELL}>
                                <NexiaGlassAccentRim />
                                <div className={SESSIONS_PAGE_EMPTY_GLOW} aria-hidden />
                                <EmptyState
                                    icon={<CalendarDays className="text-primary/70" />}
                                    title={sessionsEmptyState.title}
                                    description={sessionsEmptyState.description}
                                    className="relative z-[1] py-8"
                                    action={
                                        sessionsEmptyState.showCreateAction ? (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className={SESSIONS_PAGE_EMPTY_ACTION}
                                                onClick={() =>
                                                    navigate("/dashboard/session-programming/create-session")
                                                }
                                            >
                                                <Plus className="size-4 shrink-0" aria-hidden />
                                                Crear primera sesión
                                            </Button>
                                        ) : undefined
                                    }
                                />
                            </div>
                        ) : (
                            <>
                                <div className={SESSIONS_PAGE_LIST}>
                                    {items.map((s) => (
                                        <TrainerSessionsListRow
                                            key={`${s.session_kind}-${s.id}`}
                                            session={s}
                                            formatDate={formatSessionDate}
                                            onOpen={() =>
                                                navigate(getDetailUrl(s), {
                                                    state: returnToStateFromView(location),
                                                })
                                            }
                                            onEdit={() => navigate(getEditUrl(s))}
                                        />
                                    ))}
                                </div>
                                <PaginationBar
                                    currentPage={page}
                                    totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
                                    totalItems={total}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </>
                )}

                {activeTab === "templates" && (
                    <>
                        <div className={SESSIONS_PAGE_TOOLBAR}>
                            <NexiaGlassAccentRim />
                            <div className={cn(SESSIONS_PAGE_SEARCH_WRAP, "sm:ml-0 sm:w-full")}>
                                <Search className={SESSIONS_PAGE_SEARCH_ICON} aria-hidden />
                                <Input
                                    type="text"
                                    size="sm"
                                    placeholder={SESSIONS_PAGE_COPY.searchTemplates}
                                    value={templatesSearch}
                                    onChange={(e) => {
                                        setTemplatesSearch(e.target.value);
                                        setTemplatesPage(1);
                                    }}
                                    className={SESSIONS_PAGE_SEARCH_INPUT}
                                    aria-label="Buscar plantillas"
                                />
                            </div>
                        </div>

                        {isLoadingTemplates ? (
                            <div className={SESSIONS_PAGE_LOADING}>
                                <LoadingSpinner size="md" />
                            </div>
                        ) : templatesTotal === 0 && !templatesSearchDebounced.trim() ? (
                            <div className={SESSIONS_PAGE_EMPTY_SHELL}>
                                <NexiaGlassAccentRim />
                                <div className={SESSIONS_PAGE_EMPTY_GLOW} aria-hidden />
                                <EmptyState
                                    title="Sin plantillas"
                                    description="Crea la primera plantilla para reutilizar estructuras de sesión."
                                    className="relative z-[1] py-8"
                                    action={
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className={SESSIONS_PAGE_EMPTY_ACTION}
                                            onClick={() =>
                                                navigate("/dashboard/session-programming/create-template")
                                            }
                                        >
                                            <Plus className="size-4 shrink-0" aria-hidden />
                                            Crear primera plantilla
                                        </Button>
                                    }
                                />
                            </div>
                        ) : templatesList.length === 0 ? (
                            <div className={SESSIONS_PAGE_EMPTY_SHELL}>
                                <NexiaGlassAccentRim />
                                <EmptyState
                                    title="Ninguna plantilla coincide"
                                    description="Prueba con otro término de búsqueda."
                                    className="relative z-[1] py-8"
                                />
                            </div>
                        ) : (
                            <>
                                <div className={SESSIONS_PAGE_LIST}>
                                    {templatesList.map((template: SessionTemplate) => (
                                        <article
                                            key={template.id}
                                            className={SESSIONS_PAGE_TEMPLATE_CARD}
                                        >
                                            <NexiaGlassAccentRim />
                                            <div className="relative z-[1] min-w-0 flex-1">
                                                <p className={SESSIONS_PAGE_TEMPLATE_TITLE}>{template.name}</p>
                                                <p className={SESSIONS_PAGE_TEMPLATE_META}>
                                                    {template.session_type}
                                                    {template.estimated_duration != null
                                                        ? ` · ${template.estimated_duration} min`
                                                        : ""}
                                                    {template.usage_count > 0
                                                        ? ` · ${template.usage_count} usos`
                                                        : ""}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="relative z-[1] w-full shrink-0 sm:w-auto"
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/session-programming/create-from-template/${template.id}`
                                                    )
                                                }
                                            >
                                                Usar plantilla
                                            </Button>
                                        </article>
                                    ))}
                                </div>
                                <PaginationBar
                                    currentPage={templatesPage}
                                    totalPages={Math.max(1, Math.ceil(templatesTotal / PAGE_SIZE))}
                                    totalItems={templatesTotal}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={handleTemplatesPageChange}
                                />
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
