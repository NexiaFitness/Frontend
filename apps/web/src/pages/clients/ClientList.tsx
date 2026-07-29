/**
 * ClientList.tsx — Vista Clientes (/dashboard/clients) premium.
 *
 * Lista en filas glass mobile-first (patrón atleta). Toolbar filtros + sidebar actividad (lg+).
 * Datos: useClientsListWithMetrics; invitaciones pendientes en filtro «Todos».
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";
import {
    useClientsListWithMetrics,
    useGetRecentActivityQuery,
    useGetCurrentTrainerProfileQuery,
    useCompleteProfileModal,
    usePendingInvitationsForList,
} from "@nexia/shared";
import type { ClientStatus } from "@nexia/shared/types/client";
import type { RootState } from "@nexia/shared/store";

import { CompleteProfileModal } from "@/components/dashboard/modals/CompleteProfileModal";
import { PageTitle } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { PaginationBar } from "@/components/ui/pagination";
import { SearchBar } from "@/components/ui/forms";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { scrollDashboardMainToTop } from "@/lib/dashboardScroll";
import { ClientListActivityAside } from "@/components/clients/ClientListActivityAside";
import { ClientListEmptyState } from "@/components/clients/ClientListEmptyState";
import { ClientInvitationListRow } from "@/components/clients/ClientInvitationListRow";
import { ClientListRow } from "@/components/clients/ClientListRow";
import {
    CLIENT_LIST_COPY,
    CLIENT_LIST_GLOW,
    CLIENT_LIST_HEADER,
    CLIENT_LIST_LAYOUT,
    CLIENT_LIST_LOADING_ROW,
    CLIENT_LIST_MAIN,
    CLIENT_LIST_PAGE,
    CLIENT_LIST_PRIMARY_CTA,
    CLIENT_LIST_ROWS,
    CLIENT_LIST_STACK,
    CLIENT_LIST_TITLE_WRAP,
    CLIENT_LIST_TOOLBAR,
    clientListFilterChipClass,
    clientListFilterCountClass,
} from "@/components/clients/clientListPresentation";

const PAGE_SIZE = 9;

type StatusFilter = "all" | "active" | "paused";

export const ClientList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { shouldBlock } = useCompleteProfileModal();
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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

    const rosterEmails = useMemo(
        () => items.map((client) => client.mail),
        [items],
    );

    const showInvitations = statusFilter === "all";
    const {
        items: invitationItems,
        isLoading: invitationsLoading,
        isError: invitationsError,
    } = usePendingInvitationsForList({
        skip: !isTrainerOrAdmin || !showInvitations,
        search: searchDebounced.trim() || null,
        rosterEmails,
    });

    const { data: activityData, isLoading: activityLoading } = useGetRecentActivityQuery(
        { limit: 10, trainer_id: trainerId ?? undefined },
        { skip: !isTrainerOrAdmin },
    );
    const activities = activityData?.items ?? [];

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        scrollDashboardMainToTop("smooth");
    }, []);

    const handleClientClick = useCallback(
        (clientId: number) => navigate(`/dashboard/clients/${clientId}`),
        [navigate],
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

    const errorDetail =
        error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "detail" in error.data
            ? String((error.data as { detail?: unknown }).detail)
            : "Error desconocido";

    return (
        <>
            <div className={CLIENT_LIST_PAGE}>
                <div className={CLIENT_LIST_GLOW} aria-hidden />
                <div className={CLIENT_LIST_STACK}>
                    <div className={CLIENT_LIST_HEADER}>
                        <div className={CLIENT_LIST_TITLE_WRAP}>
                            <PageTitle
                                title={CLIENT_LIST_COPY.pageTitle}
                                subtitle={CLIENT_LIST_COPY.pageSubtitle(rosterTotal)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddClient}
                            className={CLIENT_LIST_PRIMARY_CTA}
                        >
                            <Plus className="mr-2 size-4 shrink-0" aria-hidden />
                            {CLIENT_LIST_COPY.addClient}
                        </Button>
                    </div>

                    <div className={CLIENT_LIST_TOOLBAR}>
                        <NexiaGlassAccentRim />
                        <div
                            className="flex flex-wrap items-center gap-1.5"
                            role="group"
                            aria-label="Filtrar por estado"
                        >
                            {(["all", "active", "paused"] as const).map((key) => {
                                const active = statusFilter === key;
                                const label =
                                    key === "all"
                                        ? CLIENT_LIST_COPY.filterAll
                                        : key === "active"
                                          ? CLIENT_LIST_COPY.filterActive
                                          : CLIENT_LIST_COPY.filterPaused;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setStatusFilter(key)}
                                        aria-pressed={active}
                                        className={clientListFilterChipClass(active)}
                                    >
                                        <span>{label}</span>
                                        {key === "all" && total != null ? (
                                            <span className={clientListFilterCountClass(active)}>
                                                {total}
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                        <SearchBar
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder={CLIENT_LIST_COPY.searchPlaceholder}
                            ariaLabel="Buscar cliente"
                        />
                    </div>

                    {listLoading ? (
                        <div className={CLIENT_LIST_LOADING_ROW}>
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : null}

                    {listError ? (
                        <Alert variant="error">
                            {CLIENT_LIST_COPY.loadError}: {errorDetail}
                        </Alert>
                    ) : null}

                    {!listLoading && !listError && isEmpty ? (
                        <ClientListEmptyState
                            action={
                                <Button variant="primary" onClick={handleAddClient} className="w-full">
                                    <Plus className="mr-2 size-4" aria-hidden />
                                    {CLIENT_LIST_COPY.addFirstClient}
                                </Button>
                            }
                        />
                    ) : null}

                    {!listLoading && !listError && !isEmpty ? (
                        <div className={CLIENT_LIST_LAYOUT}>
                            <div className={CLIENT_LIST_MAIN}>
                                <ul className={CLIENT_LIST_ROWS}>
                                    {showInvitations
                                        ? invitationItems.map((invitation) => (
                                              <ClientInvitationListRow
                                                  key={`invitation-${invitation.id}`}
                                                  invitation={invitation}
                                              />
                                          ))
                                        : null}
                                    {items.map((client) => (
                                        <ClientListRow
                                            key={client.id}
                                            client={client}
                                            onClick={() => handleClientClick(client.id)}
                                        />
                                    ))}
                                </ul>

                                {totalPages > 1 ? (
                                    <PaginationBar
                                        currentPage={safeCurrentPage}
                                        totalPages={totalPages}
                                        totalItems={total}
                                        pageSize={PAGE_SIZE}
                                        onPageChange={handlePageChange}
                                    />
                                ) : null}
                            </div>

                            <ClientListActivityAside items={activities} isLoading={activityLoading} />
                        </div>
                    ) : null}
                </div>
            </div>

            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </>
    );
};
