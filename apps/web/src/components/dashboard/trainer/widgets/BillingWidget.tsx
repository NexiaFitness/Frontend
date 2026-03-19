/**
 * BillingWidget — Facturación compacta según DASHBOARD_LAYOUT_SPEC
 *
 * Bloque debajo de Mis clientes: plan, próxima factura, link a /dashboard/billing.
 * Diseño flexible: mismo contenedor, contenido según datos disponibles.
 *
 * @author Frontend Team
 * @since v5.x - DASHBOARD_LAYOUT_SPEC
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, ArrowUpRight } from "lucide-react";
import { useBillingStats } from "@nexia/shared";

export const BillingWidget: React.FC = () => {
    const navigate = useNavigate();
    const { summary, isLoading } = useBillingStats();

    if (isLoading) {
        return (
            <div className="rounded-lg bg-surface p-4">
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-5 w-5 shrink-0 rounded bg-surface-2 animate-pulse" />
                    <div className="h-4 w-24 rounded bg-surface-2 animate-pulse" />
                </div>
                <div className="h-4 w-32 rounded bg-surface-2 animate-pulse" />
            </div>
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
        <div className="rounded-lg bg-surface p-4">
            <div className="mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 shrink-0 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">Facturación</h3>
            </div>
            <p className="text-sm text-muted-foreground">
                {summary.revenue ?? "—"} este año
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
                Próxima factura: {nextInvoiceDate}
            </p>
            <button
                type="button"
                onClick={() => navigate("/dashboard/billing")}
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
                Ver facturación
                <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
        </div>
    );
};
