/**
 * AdminDashboardKpiCard.tsx — KPI glass premium (experimento admin).
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ADMIN_DASHBOARD_KPI_CARD,
    ADMIN_DASHBOARD_KPI_HINT,
    ADMIN_DASHBOARD_KPI_LABEL,
    ADMIN_DASHBOARD_KPI_VALUE,
} from "./adminDashboardPresentation";

export interface AdminDashboardKpiCardProps {
    value: string;
    label: string;
    hint: string;
}

export const AdminDashboardKpiCard: React.FC<AdminDashboardKpiCardProps> = ({
    value,
    label,
    hint,
}) => {
    return (
        <article className={ADMIN_DASHBOARD_KPI_CARD}>
            <NexiaGlassAccentRim />
            <div className="relative pt-1">
                <p className={ADMIN_DASHBOARD_KPI_VALUE}>{value}</p>
                <p className={ADMIN_DASHBOARD_KPI_LABEL}>{label}</p>
                <p className={ADMIN_DASHBOARD_KPI_HINT}>{hint}</p>
            </div>
        </article>
    );
};
