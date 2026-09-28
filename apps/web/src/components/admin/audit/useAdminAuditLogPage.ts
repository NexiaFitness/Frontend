/**
 * useAdminAuditLogPage.ts — URL, filtros y query RTK para Auditoría admin.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useListAdminAuditLogQuery } from "@nexia/shared/api/adminUsersApi";
import type { AdminAuditLogListParams, AdminAuditVisibility } from "@nexia/shared/types/adminUsers";
import { formatAdminAuditAction } from "@/components/admin/users/adminUsersPresentation";
import { ADMIN_AUDIT_COPY } from "@/components/admin/audit/adminAuditPresentation";

export const AUDIT_PAGE_SIZE = 20;

export type AuditPeriodPreset = "all" | "today" | "7d" | "30d" | "custom";

function parsePositiveInt(raw: string | null): number | null {
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
}

function toDatetimeLocalValue(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function periodRange(preset: AuditPeriodPreset): { desde?: string; hasta?: string } {
    if (preset === "all" || preset === "custom") return {};
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (preset === "7d") start.setDate(start.getDate() - 6);
    if (preset === "30d") start.setDate(start.getDate() - 29);
    return { desde: toDatetimeLocalValue(start), hasta: toDatetimeLocalValue(end) };
}

function periodLabel(preset: AuditPeriodPreset): string {
    switch (preset) {
        case "today":
            return ADMIN_AUDIT_COPY.periodToday;
        case "7d":
            return ADMIN_AUDIT_COPY.period7d;
        case "30d":
            return ADMIN_AUDIT_COPY.period30d;
        case "custom":
            return ADMIN_AUDIT_COPY.periodCustom;
        default:
            return ADMIN_AUDIT_COPY.periodAll;
    }
}

function visibilityLabel(v: AdminAuditVisibility): string {
    switch (v) {
        case "with_reads":
            return ADMIN_AUDIT_COPY.visibilityReads;
        case "all":
            return ADMIN_AUDIT_COPY.visibilityAll;
        default:
            return ADMIN_AUDIT_COPY.visibilityActions;
    }
}

export function useAdminAuditLogPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const action = searchParams.get("action") ?? "";
    const actorUserId = parsePositiveInt(searchParams.get("actor"));
    const targetUserId =
        parsePositiveInt(searchParams.get("target")) ??
        parsePositiveInt(searchParams.get("target_user_id"));
    const visibility = (searchParams.get("visibility") as AdminAuditVisibility | null) ?? "actions";
    const period = (searchParams.get("period") as AuditPeriodPreset | null) ?? "all";
    const desdeParam = searchParams.get("desde") ?? "";
    const hastaParam = searchParams.get("hasta") ?? "";

    const { desde, hasta } = useMemo(() => {
        if (period === "custom") {
            return { desde: desdeParam, hasta: hastaParam };
        }
        return periodRange(period);
    }, [period, desdeParam, hastaParam]);

    const queryParams = useMemo((): AdminAuditLogListParams => {
        const params: AdminAuditLogListParams = {
            page,
            page_size: AUDIT_PAGE_SIZE,
            visibility,
        };
        if (action) params.action = action;
        if (actorUserId != null) params.actor_user_id = actorUserId;
        if (targetUserId != null) params.target_user_id = targetUserId;
        if (desde) params.desde = desde;
        if (hasta) params.hasta = hasta;
        return params;
    }, [action, actorUserId, targetUserId, desde, hasta, page, visibility]);

    const { data, isLoading, isError, refetch } = useListAdminAuditLogQuery(queryParams);

    const patch = useCallback(
        (updates: Record<string, string | null>, resetPage = false) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (resetPage) next.delete("page");
                    for (const [key, value] of Object.entries(updates)) {
                        if (value == null || value === "") next.delete(key);
                        else next.set(key, value);
                    }
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const hasActiveFilters = Boolean(
        action ||
            actorUserId != null ||
            targetUserId != null ||
            period !== "all" ||
            visibility !== "actions"
    );

    const clearFilters = useCallback(() => {
        patch(
            {
                action: null,
                actor: null,
                target: null,
                target_user_id: null,
                visibility: null,
                period: null,
                desde: null,
                hasta: null,
            },
            true
        );
    }, [patch]);

    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / AUDIT_PAGE_SIZE));

    const activeChips = useMemo(() => {
        const chips: Array<{ key: string; label: string; onClear: () => void }> = [];
        if (targetUserId != null) {
            chips.push({
                key: "target",
                label: ADMIN_AUDIT_COPY.chipTarget(`#${targetUserId}`),
                onClear: () => patch({ target: null, target_user_id: null }, true),
            });
        }
        if (actorUserId != null) {
            chips.push({
                key: "actor",
                label: ADMIN_AUDIT_COPY.chipActor(`#${actorUserId}`),
                onClear: () => patch({ actor: null }, true),
            });
        }
        if (period !== "all") {
            chips.push({
                key: "period",
                label: ADMIN_AUDIT_COPY.chipPeriod(periodLabel(period)),
                onClear: () => patch({ period: null, desde: null, hasta: null }, true),
            });
        }
        if (action) {
            chips.push({
                key: "action",
                label: ADMIN_AUDIT_COPY.chipAction(formatAdminAuditAction(action)),
                onClear: () => patch({ action: null }, true),
            });
        }
        if (visibility !== "actions") {
            chips.push({
                key: "visibility",
                label: ADMIN_AUDIT_COPY.chipVisibility(visibilityLabel(visibility)),
                onClear: () => patch({ visibility: null }, true),
            });
        }
        return chips;
    }, [action, actorUserId, targetUserId, period, visibility, patch]);

    return {
        page,
        action,
        actorUserId,
        targetUserId,
        visibility,
        period,
        desde,
        hasta,
        queryParams,
        data,
        isLoading,
        isError,
        refetch,
        patch,
        hasActiveFilters,
        clearFilters,
        totalPages,
        activeChips,
        periodLabel,
        visibilityLabel,
    };
}
