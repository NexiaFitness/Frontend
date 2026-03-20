/**
 * SessionsPage — Listado unificado de sesiones (training + standalone)
 *
 * VISTA_LISTADO_SESIONES Fase 2-7.
 * Obtiene trainerId, llama GET /sessions, mantiene estado de filtros y paginación.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, LayoutList, Layers } from "lucide-react";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetSessionsQuery } from "@nexia/shared/api/sessionsApi";
import { useGetSessionTemplatesQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import type { SessionOut } from "@nexia/shared/types/sessions";
import type { SessionTemplate } from "@nexia/shared/types/sessionProgramming";
import { LoadingSpinner } from "@/components/ui/feedback";
import { Input, FormSelect, DatePickerButton } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { ClientAvatar } from "@/components/ui/avatar";
import { PaginationBar } from "@/components/ui/pagination";
import { TabsBar } from "@/components/ui/tabs/TabsBar";
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
};

const STATUS_BADGE_CLASS: Record<string, string> = {
    planned: "bg-primary/15 text-primary",
    completed: "bg-success/15 text-success",
    cancelled: "bg-destructive/15 text-destructive",
};

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

    useEffect(() => {
        const t = setTimeout(() => setSearchDebounced(search), 300);
        return () => clearTimeout(t);
    }, [search]);

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
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const skip = (page - 1) * PAGE_SIZE;

    const { data, isLoading, isError } = useGetSessionsQuery(
        {
            trainerId: trainerId ?? 0,
            skip,
            limit: PAGE_SIZE,
            status: statusFilter === "all" ? undefined : statusFilter,
            sessionType: typeFilter === "all" ? undefined : typeFilter,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            search: searchDebounced.trim() || undefined,
            orderBy: "session_date",
            order: "desc",
        },
        { skip: !trainerId || !isAuthenticated }
    );

    const { data: templates = [], isLoading: isLoadingTemplates } = useGetSessionTemplatesQuery(
        { skip: 0, limit: 200 },
        { skip: !isAuthenticated }
    );

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const templatesTotal = templates.length;

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                    {activeTab === "sessions" ? `Sesiones · ${total}` : `Plantillas · ${templatesTotal}`}
                </h1>
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
                variant="segmented"
                ariaLabel="Sesiones y plantillas"
                value={activeTab}
                onChange={(id) => {
                    if (id === "sessions" || id === "templates") {
                        setActiveTab(id);
                    }
                }}
                items={[
                    {
                        id: "sessions",
                        label: "Sesiones",
                        icon: <LayoutList className="h-4 w-4" aria-hidden />,
                        badge: total,
                    },
                    {
                        id: "templates",
                        label: "Plantillas",
                        icon: <Layers className="h-4 w-4" aria-hidden />,
                        badge: templatesTotal,
                    },
                ]}
            />

            {activeTab === "sessions" && (
                <>
                    {/* Filtros §4 */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex gap-1.5">
                            {[
                                { value: "all", label: "Todas" },
                                { value: "planned", label: "Planificadas" },
                                { value: "completed", label: "Completadas" },
                                { value: "cancelled", label: "Canceladas" },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleStatusChange(value)}
                                    className={cn(
                                        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                        statusFilter === value
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-surface-2 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="w-36 min-w-[144px]">
                            <FormSelect
                                value={typeFilter}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                options={[
                                    { value: "all", label: "Todos" },
                                    { value: "strength", label: "Fuerza" },
                                    { value: "cardio", label: "Cardio" },
                                    { value: "technique", label: "Técnica" },
                                    { value: "assessment", label: "Evaluación" },
                                ]}
                                placeholder="Todos"
                                size="sm"
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
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
                        <div className="relative ml-auto">
                            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <Input
                                type="text"
                                size="sm"
                                placeholder="Buscar sesión o cliente..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-56 pl-8"
                                aria-label="Buscar sesión o cliente"
                            />
                        </div>
                    </div>

                    {/* Lista o estado vacío §5-6 */}
                    {items.length === 0 && total === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg bg-surface py-20 text-center">
                            <p className="mb-1 font-medium">Sin sesiones.</p>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Crea la primera sesión para empezar.
                            </p>
                            <Button
                                size="sm"
                                onClick={() => navigate("/dashboard/session-programming/create-session")}
                            >
                                <Plus className="mr-1 h-4 w-4" aria-hidden />
                                Crear primera sesión
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {items.map((s) => (
                                    <div
                                        key={`${s.session_kind}-${s.id}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => navigate(getDetailUrl(s))}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                navigate(getDetailUrl(s));
                                            }
                                        }}
                                        className="flex w-full cursor-pointer items-center gap-4 rounded-lg bg-card p-4 text-left transition-colors hover:bg-surface-2"
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
                    {isLoadingTemplates ? (
                        <div className="flex items-center justify-center min-h-[160px]">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : templatesTotal === 0 ? (
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
                    ) : (
                        <div className="space-y-2">
                            {templates.map((template: SessionTemplate) => (
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
                                            {template.usage_count > 0 ? ` · ${template.usage_count} usos` : ""}
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
                    )}
                </>
            )}
        </div>
    );
};
