/**
 * SessionsPage — Listado unificado de sesiones (training + standalone)
 *
 * VISTA_LISTADO_SESIONES Fase 2-7.
 * Obtiene trainerId, llama GET /sessions, mantiene estado de filtros y paginación.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Pencil, CalendarDays } from "lucide-react";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetSessionsQuery } from "@nexia/shared/api/sessionsApi";
import { useGetSessionTemplatesQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import type { SessionOut } from "@nexia/shared/types/sessions";
import type { SessionTemplate } from "@nexia/shared/types/sessionProgramming";
import { LoadingSpinner, EmptyState } from "@/components/ui/feedback";
import { Input, FormCombobox, DatePickerButton } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { ClientAvatar } from "@/components/ui/avatar";
import { PaginationBar } from "@/components/ui/pagination";
import { TabsBar } from "@/components/ui/tabs/TabsBar";
import { PageTitle } from "@/components/dashboard/shared";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";
import { scrollDashboardMainToTop } from "@/lib/dashboardScroll";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const TYPE_LABELS: Record<string, string> = {
    strength: "Fuerza",
    cardio: "Cardio",
    technique: "Técnica",
    assessment: "Evaluación",
};

const TYPE_BADGE_CLASS: Record<string, string> = {
    strength: "bg-primary/20 text-primary",
    cardio: "bg-warning/20 text-warning",
    technique: "bg-info/20 text-info",
    assessment: "bg-[hsl(270,60%,60%)]/20 text-[hsl(270,60%,60%)]",
};

const STATUS_LABELS: Record<string, string> = {
    planned: "Planificada",
    completed: "Completada",
    cancelled: "Cancelada",
    modified: "Planificada",
    in_progress: "Planificada",
    skipped: "Cancelada",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
    planned: "bg-primary/15 text-primary",
    completed: "bg-success/15 text-success",
    cancelled: "bg-destructive/15 text-destructive",
    modified: "bg-primary/15 text-primary",
    in_progress: "bg-primary/15 text-primary",
    skipped: "bg-destructive/15 text-destructive",
};

/** DESIGN.md Card-5 / §5.4 — franja izquierda por estado (tokens semánticos). */
const STATUS_LEFT_BORDER_CLASS: Record<string, string> = {
    planned: "border-l-primary",
    completed: "border-l-success",
    cancelled: "border-l-destructive",
    modified: "border-l-primary",
    in_progress: "border-l-primary",
    skipped: "border-l-destructive",
};

function sessionRowBorderClass(status: string): string {
    return STATUS_LEFT_BORDER_CLASS[status] ?? "border-l-muted-foreground/40";
}

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

/** DESIGN.md §5.4 Filter Chips — rectangulares, h-9, rounded-md. */
function sessionStatusFilterChipClass(active: boolean): string {
    return cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
        active
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-input hover:text-foreground"
    );
}

function sessionStatusFilterCountClass(active: boolean): string {
    return cn(
        "tabular-nums font-normal",
        active ? "text-primary/60" : "text-muted-foreground/50"
    );
}

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
        : `/dashboard/standalone-sessions/${s.id}`;
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
        [
            trainerId,
            skip,
            statusFilter,
            typeFilter,
            dateFrom,
            dateTo,
            searchDebounced,
        ]
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

    if (!trainerId && !isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                No se pudo cargar el perfil del entrenador.
            </div>
        );
    }

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[200px] text-destructive">
                Error al cargar las sesiones.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <PageTitle
                    title={activeTab === "sessions" ? "Sesiones" : "Plantillas"}
                    subtitle={
                        activeTab === "sessions"
                            ? `${total} sesiones programadas`
                            : `${templatesTotal} plantillas disponibles`
                    }
                />
                {activeTab === "sessions" ? (
                    <Button size="sm" onClick={() => navigate("/dashboard/session-programming/create-session")}>
                        <Plus className="mr-1 h-4 w-4" aria-hidden />
                        Nueva sesión
                    </Button>
                ) : (
                    <Button size="sm" onClick={() => navigate("/dashboard/session-programming/create-template")}>
                        <Plus className="mr-1 h-4 w-4" aria-hidden />
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
            />

            {activeTab === "sessions" && (
                <>
                    {/* Filtros — DESIGN.md §5.4 Filter Chips, h-9 alineado con inputs */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por estado">
                            {STATUS_FILTER_OPTIONS.map(({ value, label }) => {
                                const active = statusFilter === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => handleStatusChange(value)}
                                        className={sessionStatusFilterChipClass(active)}
                                        aria-pressed={active}
                                    >
                                        <span>{label}</span>
                                        <span className={sessionStatusFilterCountClass(active)}>
                                            {statusCounts[value]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="h-9 w-36 min-w-[9rem]">
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
                        <div className="flex h-9 items-center gap-2">
                            <DatePickerButton
                                label="Desde"
                                value={dateFrom}
                                onChange={(v) => {
                                    setDateFrom(v);
                                    setPage(1);
                                }}
                                aria-label="Desde"
                            />
                            <span className="text-muted-foreground text-sm">–</span>
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
                        <div className="relative ml-auto h-9 w-full sm:w-56">
                            <Search
                                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden
                            />
                            <Input
                                type="text"
                                size="sm"
                                placeholder="Buscar sesión o cliente..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="h-9 w-full pl-8"
                                aria-label="Buscar sesión o cliente"
                            />
                        </div>
                    </div>

                    {/* Lista o estado vacío (EmptyState reutilizable) */}
                    {items.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border/50 bg-muted/10">
                            <EmptyState
                                icon={<CalendarDays />}
                                title={sessionsEmptyState.title}
                                description={sessionsEmptyState.description}
                                className="py-16"
                                action={
                                    sessionsEmptyState.showCreateAction ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate("/dashboard/session-programming/create-session")
                                            }
                                        >
                                            <Plus className="size-4" aria-hidden />
                                            Crear primera sesión
                                        </Button>
                                    ) : undefined
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {items.map((s) => (
                                    <div
                                        key={`${s.session_kind}-${s.id}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                            navigate(getDetailUrl(s), {
                                                state: returnToStateFromView(location),
                                            })
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                navigate(getDetailUrl(s), {
                                                    state: returnToStateFromView(location),
                                                });
                                            }
                                        }}
                                        className={cn(
                                            "flex w-full cursor-pointer items-center gap-4 rounded-lg border border-border border-l-[3px] bg-card p-4 text-left transition-colors",
                                            sessionRowBorderClass(s.status),
                                            "hover:border-primary/30 hover:bg-surface-2"
                                        )}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{s.session_name}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <ClientAvatar
                                                    clientId={s.client_id}
                                                    nombre={s.client_name?.split(/\s+/)[0]}
                                                    apellidos={s.client_name?.split(/\s+/).slice(1).join(" ") || undefined}
                                                    size="sm"
                                                    className="shrink-0"
                                                />
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {s.client_name}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatSessionDate(s.session_date)}
                                            {s.session_time ? ` · ${s.session_time.slice(0, 5)}` : ""}
                                        </span>
                                        <span
                                            className={cn(
                                                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium border-0",
                                                TYPE_BADGE_CLASS[s.session_type] ?? "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {TYPE_LABELS[s.session_type] ?? s.session_type}
                                        </span>
                                        <span
                                            className={cn(
                                                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium border-0",
                                                STATUS_BADGE_CLASS[s.status] ?? "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {STATUS_LABELS[s.status] ?? s.status}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {s.exercises_count} ejerc.
                                            {s.planned_duration != null ? ` · ${s.planned_duration} min` : ""}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(getEditUrl(s));
                                            }}
                                            aria-label="Editar sesión"
                                        >
                                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                                        </Button>
                                    </div>
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
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative ml-auto w-full sm:w-80">
                            <Search
                                className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden
                            />
                            <Input
                                type="text"
                                size="sm"
                                placeholder="Buscar plantilla por nombre o descripción..."
                                value={templatesSearch}
                                onChange={(e) => {
                                    setTemplatesSearch(e.target.value);
                                    setTemplatesPage(1);
                                }}
                                className="w-full pl-8"
                                aria-label="Buscar plantillas"
                            />
                        </div>
                    </div>
                    {isLoadingTemplates ? (
                        <div className="flex items-center justify-center min-h-[160px]">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : templatesTotal === 0 && !templatesSearchDebounced.trim() ? (
                        <div className="flex flex-col items-center justify-center rounded-lg bg-surface py-20 text-center">
                            <p className="mb-1 font-medium">Sin plantillas.</p>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Crea la primera plantilla para reutilizar estructuras de sesión.
                            </p>
                            <Button
                                size="sm"
                                onClick={() => navigate("/dashboard/session-programming/create-template")}
                            >
                                <Plus className="mr-1 h-4 w-4" aria-hidden />
                                Crear primera plantilla
                            </Button>
                        </div>
                    ) : templatesList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg bg-surface py-16 text-center">
                            <p className="mb-1 font-medium">Ninguna plantilla coincide.</p>
                            <p className="text-sm text-muted-foreground">
                                Prueba con otro término de búsqueda.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {templatesList.map((template: SessionTemplate) => (
                                    <div
                                        key={template.id}
                                        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {template.name}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
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
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/dashboard/session-programming/create-from-template/${template.id}`
                                                )
                                            }
                                        >
                                            Usar plantilla
                                        </Button>
                                    </div>
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
    );
};
