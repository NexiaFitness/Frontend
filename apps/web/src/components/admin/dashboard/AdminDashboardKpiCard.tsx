/**
 * AdminDashboardKpiCard.tsx — KPI glass premium (experimento admin / D1).
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    ADMIN_DASHBOARD_KPI_BUTTON,
    ADMIN_DASHBOARD_KPI_CARD,
    ADMIN_DASHBOARD_KPI_HINT,
    ADMIN_DASHBOARD_KPI_LABEL,
    ADMIN_DASHBOARD_KPI_VALUE,
} from "./adminDashboardPresentation";

export interface AdminDashboardKpiCardProps {
    value: string;
    label: string;
    hint: string;
    onClick?: () => void;
}

export const AdminDashboardKpiCard: React.FC<AdminDashboardKpiCardProps> = ({
    value,
    label,
    hint,
    onClick,
}) => {
    const body = (
        <>
            <NexiaGlassAccentRim />
            <div className="relative pt-1">
                <p className={ADMIN_DASHBOARD_KPI_VALUE}>{value}</p>
                <p className={ADMIN_DASHBOARD_KPI_LABEL}>{label}</p>
                <p className={ADMIN_DASHBOARD_KPI_HINT}>{hint}</p>
            </div>
        </>
    );

    if (onClick) {
        return (
            <button type="button" className={cn(ADMIN_DASHBOARD_KPI_CARD, ADMIN_DASHBOARD_KPI_BUTTON)} onClick={onClick}>
                {body}
            </button>
        );
    }

    return <article className={ADMIN_DASHBOARD_KPI_CARD}>{body}</article>;
};
