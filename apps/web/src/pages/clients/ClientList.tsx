/**
 * ClientList.tsx — Vista Clientes (/dashboard/clients). VISTA_CLIENTES_SPEC.
 *
 * Contexto:
 * - Header (título + total + botón Nuevo cliente), controles (búsqueda + Pills status + toggle grid/lista).
 * - Vista grid (cards) o lista (tabla); paginación PAGE_SIZE=9; sidebar Actividad reciente (lg+).
 * - Datos: useClientsListWithMetrics (page, page_size, search, status); getRecentActivity.
 *
 * @author Frontend Team
 * @since v2.6.0
 * @updated v6.0.0 - VISTA_CLIENTES_SPEC: grid/lista, SatisfactionIcon por level, PaginationBar, tokens.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Battery, BatteryLow, LayoutGrid, List, Plus, Search, UserPlus } from "lucide-react";
import {
    useClientsListWithMetrics,
    useGetRecentActivityQuery,
    useGetCurrentTrainerProfileQuery,
    useCompleteProfileModal,
} from "@nexia/shared";
import type { ClientStatus } from "@nexia/shared/types/client";
import type { RootState } from "@nexia/shared/store";

import { CompleteProfileModal } from "@/components/dashboard/modals/CompleteProfileModal";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { ClientAvatar } from "@/components/ui/avatar";
import { AdherenceBar, SatisfactionIcon, TrendIcon } from "@/components/ui/indicators";
import { PaginationBar } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

/** Satisfacción 1–10: fatigue 1 (perfecto) → 10, fatigue 10 (exhausted) → 1. Usado como fallback cuando no hay satisfaction_level. */
function satisfactionFromFatigue(fatigueLevelNumeric: number | null): number {
    const raw = fatigueLevelNumeric != null ? 10 - fatigueLevelNumeric : 5;
    return Math.max(1, Math.min(10, raw));
}

function getFatigueColor(fatigue: string | null): string {
    if (!fatigue) return "bg-muted text-muted-foreground";
    const f = fatigue.toLowerCase();
    if (f.includes("perfect")) return "bg-success/10 text-success";
    if (f.includes("slightly")) return "bg-warning/10 text-warning";
    if (f.includes("very")) return "bg-warning/10 text-warning";
    if (f.includes("exhausted")) return "bg-destructive/10 text-destructive";
    return "bg-muted text-muted-foreground";
}

function translateFatigue(fatigue: string | null): string {
    if (!fatigue) return "Sin datos";
    const f = fatigue.toLowerCase();
    if (f.includes("perfect")) return "Descansado";
    if (f.includes("slightly")) return "Cansado";
    if (f.includes("very")) return "Muy cansado";
    if (f.includes("exhausted")) return "Agotado";
    return fatigue;
}

function FatigueBatteryIcon({ fatigue }: { fatigue: string | null }) {
    if (!fatigue) return <Battery className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />;
    const f = fatigue.toLowerCase();
    const isLow = f.includes("slightly") || f.includes("very") || f.includes("exhausted");
    return isLow ? (
        <BatteryLow className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ) : (
        <Battery className="h-3.5 w-3.5 shrink-0" aria-hidden />
    );
}

function getStatusLabel(status: ClientStatus | null | undefined): string {
    if (!status) return "—";
    if (status === "active") return "Activo";
    if (status === "paused") return "Pausado";
    if (status === "inactive") return "Baja";
    return "—";
}

function getStatusBadgeClass(status: ClientStatus | null | undefined): string {
    if (!status || status === "active") return "bg-success/10 text-success";
    if (status === "paused") return "bg-warning/10 text-warning";
    return "bg-destructive/10 text-destructive";
}

function formatTimeAgo(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    if (diffDays === 1) return "hace 1 día";
    return `hace ${diffDays} días`;
}

function getActivityIcon(type: string): React.ReactNode {
    switch (type) {
        case "session_completed":
            return (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case "client_added":
            return (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            );
        case "session_scheduled":
            return (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        case "goal_achieved":
            return (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case "test_completed":
            return (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            );
        default:
            return (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
}

type StatusFilter = "all" | "active" | "paused";
type ViewMode = "grid" | "list";

export const ClientList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { shouldBlock } = useCompleteProfileModal();
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    useEffect(() => {
        const t = setTimeout(() => setSearchDebounced(searchInput), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchDebounced]);

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: user?.role !== "trainer",
    });
    const trainerId = trainerProfile?.id ?? null;
    const isTrainerOrAdmin = user?.role === "trainer" || user?.role === "admin";

    const statusParam: ClientStatus | undefined =
        statusFilter === "all" ? undefined : statusFilter;

    const {
        items,
        total,
        isLoading,
        isError,
        error,
        totalPages,
        safeCurrentPage,
    } = useClientsListWithMetrics({
        trainerId,
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: searchDebounced.trim() || null,
        status: statusParam ?? null,
        skip: !isTrainerOrAdmin,
    });

    const { data: activityData } = useGetRecentActivityQuery(
        { limit: 10, trainer_id: trainerId ?? undefined },
        { skip: !isTrainerOrAdmin }
    );
    const activities = activityData?.items ?? [];

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleClientClick = useCallback(
        (clientId: number) => navigate(`/dashboard/clients/${clientId}`),
        [navigate]
    );

    const handleAddClient = useCallback(() => {
        if (shouldBlock) {
            setShowCompleteProfileModal(true);
            return;
        }
        navigate("/dashboard/clients/onboarding");
    }, [shouldBlock, navigate]);

    const isEmpty = !isLoading && !isError && items.length === 0;

    return (
        <>
            <div className="space-y-4 sm:space-y-6">
                {/* Header §4 — responsive: stack on xs, inline sm+ */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Clientes</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{total} total</p>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddClient}
                        className="w-full min-h-touch sm:w-auto sm:min-h-0"
                    >
                        <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                        Nuevo cliente
                    </Button>
                </div>

                {/* Controles §5 — full width search on mobile; pills + toggle wrap */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="relative w-full min-w-0 flex-1 sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-muted-foreground" aria-hidden />
                        <input
                            type="search"
                            placeholder="Buscar por nombre o email..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="min-h-touch w-full rounded-md border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] sm:min-h-0 sm:py-2"
                            aria-label="Buscar cliente"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex flex-wrap gap-1.5">
                            {(["all", "active", "paused"] as const).map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setStatusFilter(key)}
                                    className={cn(
                                        "min-h-[40px] rounded-full px-3 py-2 text-sm font-medium transition-colors sm:min-h-0 sm:px-4 sm:py-1.5",
                                        statusFilter === key
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-surface-2 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {key === "all" ? "Todos" : key === "active" ? "Activo" : "Pausado"}
                                </button>
                            ))}
                        </div>
                        <div className="flex shrink-0 rounded-md border border-border">
                            <button
                                type="button"
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "inline-flex min-h-touch-sm min-w-touch-sm items-center justify-center p-2 transition-colors sm:min-h-0 sm:min-w-0",
                                    viewMode === "grid"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                                )}
                                aria-label="Vista grid"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "inline-flex min-h-touch-sm min-w-touch-sm items-center justify-center p-2 transition-colors sm:min-h-0 sm:min-w-0",
                                    viewMode === "list"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                                )}
                                aria-label="Vista lista"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center py-16">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <Alert variant="error">
                        Error al cargar clientes:{" "}
                        {error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "detail" in error.data
                            ? String((error.data as { detail?: unknown }).detail)
                            : "Error desconocido"}
                    </Alert>
                )}

                {/* Empty state §6 */}
                {!isLoading && !isError && isEmpty && (
                    <div className="flex flex-col items-center justify-center rounded-lg bg-surface px-4 py-12 sm:py-16">
                        <UserPlus className="mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" aria-hidden />
                        <p className="mb-1 text-center font-medium text-foreground sm:text-left">Aún no tienes clientes registrados.</p>
                        <p className="mb-6 text-center text-sm text-muted-foreground sm:text-left">Añade tu primer cliente para empezar</p>
                        <Button variant="primary" onClick={handleAddClient} className="w-full min-h-touch sm:w-auto sm:min-h-0">
                            <Plus className="mr-2 h-4 w-4" aria-hidden />
                            Añadir tu primer cliente
                        </Button>
                    </div>
                )}

                {/* Contenido + sidebar §7 — col on mobile, row lg+ */}
                {!isLoading && !isError && !isEmpty && (
                    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                        <div className="min-w-0 flex-1">
                            {viewMode === "grid" ? (
                                /* Vista Grid §8 — 1 col xs, 2 sm, 3 xl */
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                                    {items.map((client) => (
                                        <article
                                            key={client.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleClientClick(client.id)}
                                            onKeyDown={(e) => e.key === "Enter" && handleClientClick(client.id)}
                                            className="cursor-pointer rounded-lg bg-surface p-4 text-left shadow-md transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] sm:p-5"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-2">
                                                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                                                    <ClientAvatar
                                                        clientId={client.id}
                                                        nombre={client.nombre}
                                                        apellidos={client.apellidos}
                                                        size="sm"
                                                        className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
                                                    />
                                                    <p className="min-w-0 truncate text-sm font-medium text-foreground sm:text-base">
                                                        {client.nombre} {client.apellidos}
                                                    </p>
                                                </div>
                                                <SatisfactionIcon level={client.satisfaction_level ?? undefined} value={satisfactionFromFatigue(client.fatigue_level_numeric)} className="h-4 w-4 shrink-0" />
                                            </div>
                                            <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                <span className={cn("rounded-full px-2 py-0.5 text-caption font-medium sm:px-2.5 sm:text-xs", getStatusBadgeClass(client.status))}>
                                                    {getStatusLabel(client.status)}
                                                </span>
                                                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium sm:px-2.5 sm:text-xs", getFatigueColor(client.fatigue_level))}>
                                                    <FatigueBatteryIcon fatigue={client.fatigue_level} />
                                                    {translateFatigue(client.fatigue_level)}
                                                </span>
                                            </div>
                                            <div className="w-full">
                                                <div className="mb-1.5">
                                                    <span className="text-label text-muted-foreground sm:text-caption">Adherencia</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <AdherenceBar value={client.adherence_percentage ?? 0} className="min-w-0 flex-1" />
                                                    <div className="relative flex shrink-0 flex-col items-end">
                                                        <TrendIcon
                                                            trend={
                                                                client.satisfaction_trend ??
                                                                client.progress_trend ??
                                                                (client.adherence_percentage != null
                                                                    ? client.adherence_percentage >= 75
                                                                        ? "up"
                                                                        : client.adherence_percentage < 50
                                                                          ? "down"
                                                                          : "stable"
                                                                    : "stable")
                                                            }
                                                            className="absolute -top-3.5 h-3.5 w-3.5"
                                                        />
                                                        <span
                                                            className={cn(
                                                                "whitespace-nowrap text-xs font-medium sm:text-sm",
                                                                client.adherence_percentage == null
                                                                    ? "text-muted-foreground"
                                                                    : client.adherence_percentage >= 75
                                                                      ? "text-success"
                                                                      : client.adherence_percentage >= 50
                                                                        ? "text-warning"
                                                                        : "text-destructive"
                                                            )}
                                                        >
                                                            {client.adherence_percentage != null ? `${Math.round(client.adherence_percentage)}%` : "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                /* Vista Lista §9 — scroll horizontal en móvil */
                                <div className="-mx-1 overflow-x-auto rounded-lg border border-border sm:mx-0">
                                    <table className="w-full min-w-[560px] text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-surface text-left text-muted-foreground">
                                                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Nombre</th>
                                                <th className="whitespace-nowrap px-3 py-2.5 font-medium sm:px-4 sm:py-3">Estado</th>
                                                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Satisfacción</th>
                                                <th className="whitespace-nowrap px-3 py-2.5 font-medium sm:px-4 sm:py-3">Fatiga</th>
                                                <th className="whitespace-nowrap px-3 py-2.5 font-medium sm:px-4 sm:py-3">Adherencia</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((client) => (
                                                <tr
                                                    key={client.id}
                                                    onClick={() => handleClientClick(client.id)}
                                                    className="cursor-pointer border-b border-border bg-background transition-colors hover:bg-surface active:bg-surface"
                                                >
                                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                        <div className="flex items-center gap-2">
                                                            <ClientAvatar
                                                                clientId={client.id}
                                                                nombre={client.nombre}
                                                                apellidos={client.apellidos}
                                                                size="sm"
                                                                className="h-6 w-6 shrink-0 sm:h-7 sm:w-7"
                                                            />
                                                            <span className="truncate font-medium text-foreground max-w-[120px] sm:max-w-none">
                                                                {client.nombre} {client.apellidos}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                        <span className={cn("rounded-full px-2 py-0.5 text-caption font-medium sm:px-2.5 sm:text-xs", getStatusBadgeClass(client.status))}>
                                                            {getStatusLabel(client.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                        <SatisfactionIcon level={client.satisfaction_level ?? undefined} value={satisfactionFromFatigue(client.fatigue_level_numeric)} className="h-4 w-4" />
                                                    </td>
                                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium sm:px-2.5 sm:text-xs", getFatigueColor(client.fatigue_level))}>
                                                            <FatigueBatteryIcon fatigue={client.fatigue_level} />
                                                            {translateFatigue(client.fatigue_level)}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                        <div className="flex min-w-[100px] items-center gap-1.5 sm:w-40 sm:gap-2">
                                                            <AdherenceBar value={client.adherence_percentage ?? 0} />
                                                            <span className="whitespace-nowrap text-foreground text-xs sm:text-sm">
                                                                {client.adherence_percentage != null ? `${Math.round(client.adherence_percentage)}%` : "Sin datos"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {totalPages > 1 && (
                                <PaginationBar
                                    currentPage={safeCurrentPage}
                                    totalPages={totalPages}
                                    totalItems={total}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>

                        {/* Sidebar Actividad reciente §11 — oculto en móvil, ancho fijo lg+ */}
                        <aside className="hidden w-full shrink-0 lg:block lg:w-72">
                            <div className="rounded-lg bg-surface p-4 sm:p-5">
                                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:mb-4">
                                    ACTIVIDAD RECIENTE
                                </h2>
                                <ul className="space-y-3 sm:space-y-4">
                                    {activities.length === 0 ? (
                                        <li className="py-4 text-center text-sm text-muted-foreground">No hay actividad reciente</li>
                                    ) : (
                                        activities.map((activity) => (
                                            <li key={activity.id} className="flex gap-2 sm:gap-3">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2 p-1 text-muted-foreground sm:h-8 sm:w-8 sm:p-1.5">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-2 text-xs text-foreground sm:text-sm">
                                                        <span className="font-medium">{activity.actor_name}</span> {activity.description}
                                                    </p>
                                                    <p className="mt-0.5 text-label text-muted-foreground sm:mt-1 sm:text-xs">{formatTimeAgo(activity.timestamp)}</p>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </aside>
                    </div>
                )}
            </div>

            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </>
    );
};
