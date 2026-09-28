/**
 * AdminAuditFilters.tsx — Toolbar de filtros Auditoría admin (3 filas).
 */

import React, { useMemo } from "react";
import { X } from "lucide-react";
import { Button, SegmentButton } from "@/components/ui/buttons";
import { FormCombobox } from "@/components/ui/forms/FormCombobox";
import { Input } from "@/components/ui/forms";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AdminAuditUserPicker } from "@/components/admin/audit/AdminAuditUserPicker";
import {
    ADMIN_AUDIT_CHIPS_ROW,
    ADMIN_AUDIT_CHIP,
    ADMIN_AUDIT_COPY,
    ADMIN_AUDIT_FILTERS_GRID,
    ADMIN_AUDIT_FILTER_ROW,
    ADMIN_AUDIT_TOOLBAR,
    ADMIN_AUDIT_TOOLBAR_ROW,
    ADMIN_AUDIT_ACTION_OPTIONS,
} from "@/components/admin/audit/adminAuditPresentation";
import type { AuditPeriodPreset } from "@/components/admin/audit/useAdminAuditLogPage";
import type { AdminAuditVisibility } from "@nexia/shared/types/adminUsers";

export interface AdminAuditFiltersProps {
    targetUserId: number | null;
    actorUserId: number | null;
    action: string;
    visibility: AdminAuditVisibility;
    period: AuditPeriodPreset;
    desde: string;
    hasta: string;
    hasActiveFilters: boolean;
    activeChips: Array<{ key: string; label: string; onClear: () => void }>;
    onTargetChange: (id: number | null) => void;
    onActorChange: (id: number | null) => void;
    onActionChange: (action: string | null) => void;
    onVisibilityChange: (v: AdminAuditVisibility) => void;
    onPeriodChange: (p: AuditPeriodPreset) => void;
    onDesdeChange: (v: string | null) => void;
    onHastaChange: (v: string | null) => void;
    onClearAll: () => void;
}

export const AdminAuditFilters: React.FC<AdminAuditFiltersProps> = ({
    targetUserId,
    actorUserId,
    action,
    visibility,
    period,
    desde,
    hasta,
    hasActiveFilters,
    activeChips,
    onTargetChange,
    onActorChange,
    onActionChange,
    onVisibilityChange,
    onPeriodChange,
    onDesdeChange,
    onHastaChange,
    onClearAll,
}) => {
    const typeOptions = useMemo(
        () => [
            { value: "", label: ADMIN_AUDIT_COPY.filterTypeAll },
            ...ADMIN_AUDIT_ACTION_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
        ],
        []
    );

    return (
        <div className={ADMIN_AUDIT_TOOLBAR}>
            <NexiaGlassAccentRim />

            <div className={ADMIN_AUDIT_TOOLBAR_ROW}>
                <AdminAuditUserPicker
                    label={ADMIN_AUDIT_COPY.filterTargetLabel}
                    placeholder={ADMIN_AUDIT_COPY.filterTargetPlaceholder}
                    value={targetUserId}
                    onChange={onTargetChange}
                    defaultRoleSegment="all"
                    testId="audit-filter-target"
                />
            </div>

            <div className={ADMIN_AUDIT_FILTERS_GRID}>
                <AdminAuditUserPicker
                    label={ADMIN_AUDIT_COPY.filterActorLabel}
                    placeholder={ADMIN_AUDIT_COPY.filterActorPlaceholder}
                    value={actorUserId}
                    onChange={onActorChange}
                    defaultRoleSegment="admin"
                    testId="audit-filter-actor"
                />

                <div className="flex flex-col gap-1.5">
                    <span className="text-sm text-muted-foreground">
                        {ADMIN_AUDIT_COPY.filterPeriodLabel}
                    </span>
                    <div className={ADMIN_AUDIT_FILTER_ROW}>
                        {(
                            [
                                ["all", ADMIN_AUDIT_COPY.periodAll],
                                ["today", ADMIN_AUDIT_COPY.periodToday],
                                ["7d", ADMIN_AUDIT_COPY.period7d],
                                ["30d", ADMIN_AUDIT_COPY.period30d],
                                ["custom", ADMIN_AUDIT_COPY.periodCustom],
                            ] as const
                        ).map(([p, label]) => (
                            <SegmentButton
                                key={p}
                                size="sm"
                                selected={period === p}
                                onClick={() => onPeriodChange(p)}
                            >
                                {label}
                            </SegmentButton>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-sm text-muted-foreground">
                        {ADMIN_AUDIT_COPY.filterTypeLabel}
                    </span>
                    <FormCombobox
                        value={action}
                        onChange={(v) => onActionChange(v || null)}
                        options={typeOptions}
                        placeholder={ADMIN_AUDIT_COPY.filterTypeAll}
                        ariaLabel={ADMIN_AUDIT_COPY.filterTypeLabel}
                        size="sm"
                    />
                </div>
            </div>

            {period === "custom" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                        label={ADMIN_AUDIT_COPY.periodFrom}
                        type="date"
                        value={desde.slice(0, 10)}
                        onChange={(e) => onDesdeChange(e.target.value ? `${e.target.value}T00:00` : null)}
                    />
                    <Input
                        label={ADMIN_AUDIT_COPY.periodTo}
                        type="date"
                        value={hasta.slice(0, 10)}
                        onChange={(e) => onHastaChange(e.target.value ? `${e.target.value}T23:59` : null)}
                    />
                </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm text-muted-foreground">{ADMIN_AUDIT_COPY.visibilityLabel}</span>
                    <div className={ADMIN_AUDIT_FILTER_ROW}>
                        {(
                            [
                                ["actions", ADMIN_AUDIT_COPY.visibilityActions],
                                ["with_reads", ADMIN_AUDIT_COPY.visibilityReads],
                                ["all", ADMIN_AUDIT_COPY.visibilityAll],
                            ] as const
                        ).map(([v, label]) => (
                            <SegmentButton
                                key={v}
                                size="sm"
                                selected={visibility === v}
                                onClick={() => onVisibilityChange(v)}
                            >
                                {label}
                            </SegmentButton>
                        ))}
                    </div>
                </div>
                {hasActiveFilters ? (
                    <Button type="button" variant="ghost-primary" size="sm" onClick={onClearAll}>
                        {ADMIN_AUDIT_COPY.clearFilters}
                    </Button>
                ) : null}
            </div>

            {activeChips.length > 0 ? (
                <div className={ADMIN_AUDIT_CHIPS_ROW}>
                    {activeChips.map((chip) => (
                        <span key={chip.key} className={ADMIN_AUDIT_CHIP}>
                            {chip.label}
                            <button
                                type="button"
                                className="rounded p-0.5 hover:bg-primary/10"
                                onClick={chip.onClear}
                                aria-label={`Quitar filtro ${chip.label}`}
                            >
                                <X className="h-3 w-3" aria-hidden />
                            </button>
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
