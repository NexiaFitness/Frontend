/**
 * BillingWidget — Facturación compacta (dashboard premium).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, ArrowUpRight } from "lucide-react";
import { useBillingStats } from "@nexia/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    TRAINER_DASHBOARD_COPY,
    TRAINER_DASHBOARD_KPI_DESCRIPTION,
    TRAINER_DASHBOARD_LINK,
    TRAINER_DASHBOARD_LOADING_BLOCK,
    TRAINER_DASHBOARD_WIDGET,
    TRAINER_DASHBOARD_WIDGET_TITLE,
    TRAINER_DASHBOARD_WIDGET_TITLE_ROW,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";

export const BillingWidget: React.FC = () => {
    const navigate = useNavigate();
    const { summary, isLoading } = useBillingStats();

    if (isLoading) {
        return (
            <section className={TRAINER_DASHBOARD_WIDGET}>
                <NexiaGlassAccentRim />
                <div className={TRAINER_DASHBOARD_LOADING_BLOCK} />
            </section>
        );
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextInvoiceDate = nextMonth.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <section className={TRAINER_DASHBOARD_WIDGET}>
            <NexiaGlassAccentRim />
            <div className={TRAINER_DASHBOARD_WIDGET_TITLE_ROW}>
                <CreditCard className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <h3 className={TRAINER_DASHBOARD_WIDGET_TITLE}>{TRAINER_DASHBOARD_COPY.billingTitle}</h3>
            </div>
            <p className={cn(TRAINER_DASHBOARD_KPI_DESCRIPTION, "mt-3")}>{summary.revenue ?? "—"} este año</p>
            <p className={TRAINER_DASHBOARD_KPI_DESCRIPTION}>Próxima factura: {nextInvoiceDate}</p>
            <button
                type="button"
                onClick={() => navigate("/dashboard/billing")}
                className={cn(TRAINER_DASHBOARD_LINK, "mt-3")}
            >
                {TRAINER_DASHBOARD_COPY.viewBilling}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </button>
        </section>
    );
};
