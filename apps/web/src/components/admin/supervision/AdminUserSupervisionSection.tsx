/**
 * AdminUserSupervisionSection.tsx — Tabla de clientes supervisados (SUP F1).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";
import { PaginationBar } from "@/components/ui/pagination";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { useAdminSupervisionClients } from "./useAdminSupervisionClients";
import {
    ADMIN_SUP_BANNER,
    ADMIN_SUP_CARD_ITEM,
    ADMIN_SUP_CARD_LIST,
    ADMIN_SUP_CARD_META,
    ADMIN_SUP_CARD_TITLE_ROW,
    ADMIN_SUP_COPY,
    ADMIN_SUP_SKELETON_LIST,
    ADMIN_SUP_SKELETON_ROW,
    ADMIN_SUP_TABLE,
    ADMIN_SUP_TABLE_CARD,
    ADMIN_SUP_TABLE_SCROLL,
    ADMIN_SUP_TD,
    ADMIN_SUP_TD_MUTED,
    ADMIN_SUP_TD_NAME,
    ADMIN_SUP_TH,
    ADMIN_SUP_TOOLBAR,
    ADMIN_SUP_TOOLBAR_SEARCH,
    ADMIN_SUP_TR,
    ADMIN_SUP_PAGINATION,
    formatAdherence,
    formatClientStatus,
} from "./adminSupervisionPresentation";

const SKELETON_ROWS = [0, 1, 2, 3];

export interface AdminUserSupervisionSectionProps {
    userId: number;
    trainerId: number;
}

export const AdminUserSupervisionSection: React.FC<AdminUserSupervisionSectionProps> = ({
    userId,
    trainerId,
}) => {
    const navigate = useNavigate();
    const list = useAdminSupervisionClients({ trainerId, enabled: true });

    const openClient = (clientId: number) => {
        navigate(`/dashboard/admin/users/${userId}/clients/${clientId}`);
    };

    return (
        <section className="space-y-3" data-testid="admin-user-supervision">
            <div className={ADMIN_SUP_BANNER} role="status">
                {ADMIN_SUP_COPY.banner}
            </div>

            <div className={ADMIN_SUP_TABLE_CARD}>
                <NexiaGlassAccentRim />
                <div className="border-b border-border/60 px-4 py-3">
                    <h2 className="text-sm font-semibold">{ADMIN_SUP_COPY.sectionTitle}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {ADMIN_SUP_COPY.sectionSubtitle}
                    </p>
                </div>

                <div className={ADMIN_SUP_TOOLBAR}>
                    <div className={ADMIN_SUP_TOOLBAR_SEARCH}>
                        <Input
                            label={ADMIN_SUP_COPY.searchLabel}
                            placeholder={ADMIN_SUP_COPY.searchPlaceholder}
                            value={list.search}
                            onChange={(e) => list.setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {list.isError ? (
                    <Alert
                        variant="error"
                        className="m-4"
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => list.refetch()}
                            >
                                {ADMIN_SUP_COPY.retry}
                            </Button>
                        }
                    >
                        {ADMIN_SUP_COPY.loadError}
                    </Alert>
                ) : null}

                {!list.isError && list.isLoading ? (
                    <div className={ADMIN_SUP_SKELETON_LIST}>
                        {SKELETON_ROWS.map((row) => (
                            <div key={row} className={ADMIN_SUP_SKELETON_ROW} />
                        ))}
                    </div>
                ) : null}

                {!list.isError && !list.isLoading && list.items.length === 0 ? (
                    <EmptyState
                        title={ADMIN_SUP_COPY.emptyTitle}
                        description={ADMIN_SUP_COPY.emptyBody}
                    />
                ) : null}

                {!list.isError && !list.isLoading && list.items.length > 0 ? (
                    <>
                        <div className={ADMIN_SUP_TABLE_SCROLL}>
                            <table className={ADMIN_SUP_TABLE}>
                                <thead>
                                    <tr>
                                        <th className={ADMIN_SUP_TH}>{ADMIN_SUP_COPY.colName}</th>
                                        <th className={ADMIN_SUP_TH}>{ADMIN_SUP_COPY.colStatus}</th>
                                        <th className={ADMIN_SUP_TH}>{ADMIN_SUP_COPY.colPlan}</th>
                                        <th className={ADMIN_SUP_TH}>
                                            {ADMIN_SUP_COPY.colLastSession}
                                        </th>
                                        <th className={ADMIN_SUP_TH}>
                                            {ADMIN_SUP_COPY.colAdherence}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.items.map((client) => {
                                        const name =
                                            `${client.nombre} ${client.apellidos}`.trim() ||
                                            client.mail;
                                        return (
                                            <tr
                                                key={client.id}
                                                className={ADMIN_SUP_TR}
                                                tabIndex={0}
                                                onClick={() => openClient(client.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        openClient(client.id);
                                                    }
                                                }}
                                            >
                                                <td className={ADMIN_SUP_TD_NAME}>{name}</td>
                                                <td className={ADMIN_SUP_TD}>
                                                    {formatClientStatus(client.status)}
                                                </td>
                                                <td className={ADMIN_SUP_TD_MUTED}>
                                                    {ADMIN_SUP_COPY.planUnavailable}
                                                </td>
                                                <td className={ADMIN_SUP_TD_MUTED}>
                                                    {ADMIN_SUP_COPY.lastSessionUnavailable}
                                                </td>
                                                <td className={ADMIN_SUP_TD}>
                                                    {formatAdherence(client.adherence_percentage)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className={ADMIN_SUP_CARD_LIST}>
                            {list.items.map((client) => {
                                const name =
                                    `${client.nombre} ${client.apellidos}`.trim() || client.mail;
                                return (
                                    <button
                                        key={client.id}
                                        type="button"
                                        className={ADMIN_SUP_CARD_ITEM}
                                        onClick={() => openClient(client.id)}
                                    >
                                        <div className={ADMIN_SUP_CARD_TITLE_ROW}>
                                            <span>{name}</span>
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {formatClientStatus(client.status)}
                                            </span>
                                        </div>
                                        <p className={ADMIN_SUP_CARD_META}>
                                            Adherencia{" "}
                                            {formatAdherence(client.adherence_percentage)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className={ADMIN_SUP_PAGINATION}>
                            <PaginationBar
                                currentPage={list.page}
                                totalPages={list.totalPages}
                                totalItems={list.total}
                                pageSize={list.pageSize}
                                onPageChange={list.setPage}
                            />
                        </div>
                    </>
                ) : null}
            </div>
        </section>
    );
};
