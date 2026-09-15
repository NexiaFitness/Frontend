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
 * @updated v7.x - Premium glass (clientListPresentation.ts) · mobile-first · sidebar md+.
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
    usePendingInvitationsForList,
    getClientSatisfactionDisplay,
} from "@nexia/shared";
import type { ClientStatus } from "@nexia/shared/types/client";
import type { Invitation } from "@nexia/shared/types/invitation";
import type { RootState } from "@nexia/shared/store";

import { CompleteProfileModal } from "@/components/dashboard/modals/CompleteProfileModal";
import {
    CLIENT_LIST_ACTIVITY_ICON,
    CLIENT_LIST_ACTIVITY_ITEM,
    CLIENT_LIST_ACTIVITY_PANEL,
    CLIENT_LIST_ACTIVITY_TEXT,
    CLIENT_LIST_ACTIVITY_TIME,
    CLIENT_LIST_ACTIVITY_TITLE,
    CLIENT_LIST_ADHERENCE_LABEL,
    CLIENT_LIST_ADHERENCE_PERCENT,
    CLIENT_LIST_ASIDE,
    CLIENT_LIST_BADGE_BASE,
    CLIENT_LIST_CARD_BADGE_ROW,
    CLIENT_LIST_CARD_EMAIL,
    CLIENT_LIST_CARD_NAME,
    CLIENT_LIST_CLIENT_CARD,
    CLIENT_LIST_CONTENT_LAYOUT,
    CLIENT_LIST_COPY,
    CLIENT_LIST_EMPTY,
    CLIENT_LIST_EMPTY_BODY,
    CLIENT_LIST_EMPTY_GLOW,
    CLIENT_LIST_EMPTY_TITLE,
    CLIENT_LIST_FILTER_CHIP,
    CLIENT_LIST_FILTER_COUNT,
    CLIENT_LIST_EYEBROW,
    CLIENT_LIST_GLOW,
    CLIENT_LIST_GRID,
    CLIENT_LIST_HEADER,
    CLIENT_LIST_INVITATION_CARD,
    CLIENT_LIST_LOADING,
    CLIENT_LIST_MAIN,
    CLIENT_LIST_PAGE,
    CLIENT_LIST_PRIMARY_CTA,
    CLIENT_LIST_SEARCH_ICON,
    CLIENT_LIST_SEARCH_INPUT,
    CLIENT_LIST_SEARCH_WRAP,
    CLIENT_LIST_STACK,
    CLIENT_LIST_SUBTITLE,
    CLIENT_LIST_TABLE,
    CLIENT_LIST_TABLE_CELL,
    CLIENT_LIST_TABLE_HEAD,
    CLIENT_LIST_TABLE_HEAD_CELL,
    CLIENT_LIST_TABLE_ROW,
    CLIENT_LIST_TABLE_SHELL,
    CLIENT_LIST_TITLE,
    CLIENT_LIST_TITLE_WRAP,
    CLIENT_LIST_TOOLBAR,
    CLIENT_LIST_TOOLBAR_ROW,
    CLIENT_LIST_VIEW_TOGGLE,
    clientListFatigueBadgeClass,
    clientListStatusBadgeClass,
    clientListViewToggleBtnClass,
} from "@/components/clients/clientListPresentation";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { LoadingSpinner, Alert, HintTooltip } from "@/components/ui/feedback";
import { ClientAvatar } from "@/components/ui/avatar";
import { AdherenceBar, SatisfactionIcon, TrendIcon } from "@/components/ui/indicators";
import { PaginationBar } from "@/components/ui/pagination";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import { scrollDashboardMainToTop } from "@/lib/dashboardScroll";
import {
    InvitationRowActions,
    getInvitationBadgeClass,
    getInvitationBadgeLabel,
    getInvitationDisplayName,
} from "@/components/clients/invitations";

const PAGE_SIZE = 9;

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

    const showInvitations = statusFilter === "all";
    const {
        items: invitationItems,
        isLoading: invitationsLoading,
        isError: invitationsError,
    } = usePendingInvitationsForList({
        skip: !isTrainerOrAdmin || !showInvitations,
        search: searchDebounced.trim() || null,
    });

    const { data: activityData } = useGetRecentActivityQuery(
        { limit: 10, trainer_id: trainerId ?? undefined },
        { skip: !isTrainerOrAdmin }
    );
    const activities = activityData?.items ?? [];

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        scrollDashboardMainToTop("smooth");
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
        navigate("/dashboard/clients/invite");
    }, [shouldBlock, navigate]);

    const listLoading = isLoading || (showInvitations && invitationsLoading);
    const listError = isError || (showInvitations && invitationsError);
    const isEmpty =
        !listLoading &&
        !listError &&
        items.length === 0 &&
        (!showInvitations || invitationItems.length === 0);
    const rosterTotal = total + (showInvitations ? invitationItems.length : 0);

    const renderActivityPanel = (className?: string) => (
        <div className={cn(CLIENT_LIST_ACTIVITY_PANEL, className)}>
            <NexiaGlassAccentRim />
            <h2 className={cn(CLIENT_LIST_ACTIVITY_TITLE, "mb-3 sm:mb-4")}>
                {CLIENT_LIST_COPY.activityTitle}
            </h2>
            <ul className="space-y-3 sm:space-y-4">
                {activities.length === 0 ? (
                    <li className="py-4 text-center text-sm text-muted-foreground">
                        {CLIENT_LIST_COPY.activityEmpty}
                    </li>
                ) : (
                    activities.map((activity) => (
                        <li key={activity.id} className={CLIENT_LIST_ACTIVITY_ITEM}>
                            <div className={CLIENT_LIST_ACTIVITY_ICON}>{getActivityIcon(activity.type)}</div>
                            <div className="min-w-0 flex-1">
                                <p className={CLIENT_LIST_ACTIVITY_TEXT}>
                                    <span className="font-medium">{activity.actor_name}</span>{" "}
                                    {activity.description}
                                </p>
                                <p className={CLIENT_LIST_ACTIVITY_TIME}>{formatTimeAgo(activity.timestamp)}</p>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );

    const renderInvitationGridCard = (invitation: Invitation) => {
        const displayName = getInvitationDisplayName(invitation.nombre, invitation.email);
        return (
            <article key={`invitation-${invitation.id}`} className={CLIENT_LIST_INVITATION_CARD}>
                <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className={CLIENT_LIST_CARD_NAME}>{displayName}</p>
                        <p className={CLIENT_LIST_CARD_EMAIL}>{invitation.email}</p>
                    </div>
                </div>
                <span
                    className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-caption font-medium sm:px-2.5 sm:text-xs",
                        getInvitationBadgeClass(invitation.status),
                    )}
                >
                    {getInvitationBadgeLabel(invitation.status)}
                </span>
                <InvitationRowActions invitation={invitation} layout="grid" />
            </article>
        );
    };

    const renderInvitationListRow = (invitation: Invitation) => {
        const displayName = getInvitationDisplayName(invitation.nombre, invitation.email);
        return (
            <tr
                key={`invitation-${invitation.id}`}
                className="border-b border-border bg-background/60"
            >
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{invitation.email}</p>
                    </div>
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span
                        className={cn(
                            "rounded-full px-2 py-0.5 text-caption font-medium sm:px-2.5 sm:text-xs",
                            getInvitationBadgeClass(invitation.status),
                        )}
                    >
                        {getInvitationBadgeLabel(invitation.status)}
                    </span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground sm:px-4 sm:py-3">—</td>
                <td className="px-3 py-2.5 text-muted-foreground sm:px-4 sm:py-3">—</td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <InvitationRowActions invitation={invitation} layout="list" />
                </td>
            </tr>
        );
    };

    return (
        <>
            <div className={CLIENT_LIST_PAGE}>
                <div className={CLIENT_LIST_GLOW} aria-hidden />
                <div className={CLIENT_LIST_STACK}>
                <header className={CLIENT_LIST_HEADER}>
                    <div className={CLIENT_LIST_TITLE_WRAP}>
                        <p className={CLIENT_LIST_EYEBROW}>{CLIENT_LIST_COPY.eyebrow}</p>
                        <h1 className={CLIENT_LIST_TITLE}>{CLIENT_LIST_COPY.title}</h1>
                        <p className={CLIENT_LIST_SUBTITLE}>
                            {rosterTotal} {CLIENT_LIST_COPY.totalSuffix}
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddClient}
                        className={CLIENT_LIST_PRIMARY_CTA}
                    >
                        <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                        {CLIENT_LIST_COPY.newClient}
                    </Button>
                </header>

                <div className={CLIENT_LIST_TOOLBAR}>
                    <NexiaGlassAccentRim />
                    <div
                        className={CLIENT_LIST_TOOLBAR_ROW}
                        role="group"
                        aria-label={CLIENT_LIST_COPY.filterGroup}
                    >
                        {(["all", "active", "paused"] as const).map((key) => {
                            const active = statusFilter === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setStatusFilter(key)}
                                    aria-pressed={active}
                                    className={CLIENT_LIST_FILTER_CHIP(active)}
                                >
                                    <span>
                                        {key === "all"
                                            ? "Todos"
                                            : key === "active"
                                              ? "Activos"
                                              : "Pausados"}
                                    </span>
                                    {key === "all" && total != null ? (
                                        <span className={CLIENT_LIST_FILTER_COUNT(active)}>{total}</span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                    <div className={CLIENT_LIST_VIEW_TOGGLE}>
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={clientListViewToggleBtnClass(viewMode === "grid")}
                            aria-label={CLIENT_LIST_COPY.viewGrid}
                            aria-pressed={viewMode === "grid"}
                        >
                            <LayoutGrid className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={clientListViewToggleBtnClass(viewMode === "list")}
                            aria-label={CLIENT_LIST_COPY.viewList}
                            aria-pressed={viewMode === "list"}
                        >
                            <List className="h-4 w-4" aria-hidden />
                        </button>
                    </div>
                    <div className={CLIENT_LIST_SEARCH_WRAP}>
                        <Search className={CLIENT_LIST_SEARCH_ICON} aria-hidden />
                        <Input
                            id="client-search"
                            type="search"
                            size="sm"
                            placeholder={CLIENT_LIST_COPY.searchPlaceholder}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className={CLIENT_LIST_SEARCH_INPUT}
                            aria-label={CLIENT_LIST_COPY.searchAria}
                        />
                    </div>
                </div>

                {listLoading && (
                    <div className={CLIENT_LIST_LOADING}>
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {/* Error */}
                {listError && (
                    <Alert variant="error">
                        {CLIENT_LIST_COPY.loadError}:{" "}
                        {error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "detail" in error.data
                            ? String((error.data as { detail?: unknown }).detail)
                            : "Error desconocido"}
                    </Alert>
                )}

                {/* Empty state §6 */}
                {!listLoading && !listError && isEmpty && (
                    <div className={CLIENT_LIST_EMPTY}>
                        <div className={CLIENT_LIST_EMPTY_GLOW} aria-hidden />
                        <NexiaGlassAccentRim />
                        <UserPlus className="mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" aria-hidden />
                        <p className={CLIENT_LIST_EMPTY_TITLE}>{CLIENT_LIST_COPY.emptyTitle}</p>
                        <p className={cn(CLIENT_LIST_EMPTY_BODY, "mb-6 text-center")}>
                            {CLIENT_LIST_COPY.emptyDetail}
                        </p>
                        <Button variant="primary" onClick={handleAddClient} className={CLIENT_LIST_PRIMARY_CTA}>
                            <Plus className="mr-2 h-4 w-4" aria-hidden />
                            {CLIENT_LIST_COPY.emptyCta}
                        </Button>
                    </div>
                )}

                {/* Contenido + sidebar §7 — col on mobile, row lg+ */}
                {!listLoading && !listError && !isEmpty && (
                    <div className={CLIENT_LIST_CONTENT_LAYOUT}>
                        <div className={CLIENT_LIST_MAIN}>
                            {viewMode === "grid" ? (
                                <div className={CLIENT_LIST_GRID}>
                                    {showInvitations
                                        ? invitationItems.map(renderInvitationGridCard)
                                        : null}
                                    {items.map((client) => (
                                        <article
                                            key={client.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleClientClick(client.id)}
                                            onKeyDown={(e) => e.key === "Enter" && handleClientClick(client.id)}
                                            className={CLIENT_LIST_CLIENT_CARD}
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
                                                    <p className={cn(CLIENT_LIST_CARD_NAME, "min-w-0")}>
                                                        {client.nombre} {client.apellidos}
                                                    </p>
                                                </div>
                                                {(() => {
                                                    const satisfaction = getClientSatisfactionDisplay(client);
                                                    return (
                                                        <HintTooltip label={satisfaction.tooltip}>
                                                            <SatisfactionIcon
                                                                level={satisfaction.level ?? undefined}
                                                                unrated={satisfaction.unrated}
                                                                className="h-4 w-4 shrink-0"
                                                            />
                                                        </HintTooltip>
                                                    );
                                                })()}
                                            </div>
                                            <div className={CLIENT_LIST_CARD_BADGE_ROW}>
                                                <span className={cn(CLIENT_LIST_BADGE_BASE, clientListStatusBadgeClass(client.status))}>
                                                    {getStatusLabel(client.status)}
                                                </span>
                                                <span className={cn(CLIENT_LIST_BADGE_BASE, clientListFatigueBadgeClass(client.fatigue_level))}>
                                                    <FatigueBatteryIcon fatigue={client.fatigue_level} />
                                                    {translateFatigue(client.fatigue_level)}
                                                </span>
                                            </div>
                                            <div className="w-full">
                                                <div className="mb-1.5">
                                                    <span className={CLIENT_LIST_ADHERENCE_LABEL}>
                                                        {CLIENT_LIST_COPY.adherenceLabel}
                                                    </span>
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
                                                                CLIENT_LIST_ADHERENCE_PERCENT,
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
                                <div className={CLIENT_LIST_TABLE_SHELL}>
                                    <NexiaGlassAccentRim />
                                    <table className={CLIENT_LIST_TABLE}>
                                        <thead>
                                            <tr className={CLIENT_LIST_TABLE_HEAD}>
                                                <th className={CLIENT_LIST_TABLE_HEAD_CELL}>Nombre</th>
                                                <th className={cn(CLIENT_LIST_TABLE_HEAD_CELL, "whitespace-nowrap")}>
                                                    Estado
                                                </th>
                                                <th className={CLIENT_LIST_TABLE_HEAD_CELL}>Satisfacción</th>
                                                <th className={cn(CLIENT_LIST_TABLE_HEAD_CELL, "whitespace-nowrap")}>
                                                    Fatiga
                                                </th>
                                                <th className={cn(CLIENT_LIST_TABLE_HEAD_CELL, "whitespace-nowrap")}>
                                                    Adherencia
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {showInvitations
                                                ? invitationItems.map(renderInvitationListRow)
                                                : null}
                                            {items.map((client) => (
                                                <tr
                                                    key={client.id}
                                                    onClick={() => handleClientClick(client.id)}
                                                    className={CLIENT_LIST_TABLE_ROW}
                                                >
                                                    <td className={CLIENT_LIST_TABLE_CELL}>
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
                                                    <td className={CLIENT_LIST_TABLE_CELL}>
                                                        <span className={cn(CLIENT_LIST_BADGE_BASE, clientListStatusBadgeClass(client.status))}>
                                                            {getStatusLabel(client.status)}
                                                        </span>
                                                    </td>
                                                    <td className={CLIENT_LIST_TABLE_CELL}>
                                                        {(() => {
                                                            const satisfaction = getClientSatisfactionDisplay(client);
                                                            return (
                                                                <HintTooltip label={satisfaction.tooltip}>
                                                                    <SatisfactionIcon
                                                                        level={satisfaction.level ?? undefined}
                                                                        unrated={satisfaction.unrated}
                                                                        className="h-4 w-4"
                                                                    />
                                                                </HintTooltip>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className={CLIENT_LIST_TABLE_CELL}>
                                                        <span className={cn(CLIENT_LIST_BADGE_BASE, clientListFatigueBadgeClass(client.fatigue_level))}>
                                                            <FatigueBatteryIcon fatigue={client.fatigue_level} />
                                                            {translateFatigue(client.fatigue_level)}
                                                        </span>
                                                    </td>
                                                    <td className={CLIENT_LIST_TABLE_CELL}>
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

                        <aside className={cn(CLIENT_LIST_ASIDE, "hidden md:block")}>
                            {renderActivityPanel()}
                        </aside>
                    </div>
                )}

                {!listLoading && !listError && !isEmpty ? renderActivityPanel("md:hidden") : null}
                </div>
            </div>

            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </>
    );
};
