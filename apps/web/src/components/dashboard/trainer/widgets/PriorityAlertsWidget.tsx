/**
 * PriorityAlertsWidget — Alertas prioritarias (dashboard premium).
 */

import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { ClientAvatar } from "@/components/ui/avatar";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { useDashboardAlerts, useGetCurrentTrainerProfileQuery } from "@nexia/shared";
import type { FatigueAlertSeverity, FatigueAlertType } from "@nexia/shared/types/training";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import type { RootState } from "@nexia/shared/store";
import { cn } from "@/lib/utils";
import {
    TRAINER_DASHBOARD_ALERT_COUNT_BADGE,
    TRAINER_DASHBOARD_COPY,
    TRAINER_DASHBOARD_EMPTY_BODY,
    TRAINER_DASHBOARD_LINK,
    TRAINER_DASHBOARD_LIST,
    TRAINER_DASHBOARD_LIST_ITEM_ALERT,
    TRAINER_DASHBOARD_LIST_ITEM_META,
    TRAINER_DASHBOARD_LIST_ITEM_NAME,
    TRAINER_DASHBOARD_LOADING_BLOCK,
    TRAINER_DASHBOARD_SEVERITY_BADGE,
    TRAINER_DASHBOARD_WIDGET,
    TRAINER_DASHBOARD_WIDGET_HEADER,
    TRAINER_DASHBOARD_WIDGET_TITLE,
    TRAINER_DASHBOARD_WIDGET_TITLE_ROW,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";

export const PriorityAlertsWidget: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { alerts, isLoading: isLoadingAlerts } = useDashboardAlerts();
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const { data: clientsData } = useGetTrainerClientsQuery(
        { trainerId: trainerProfile?.id ?? 0, page: 1, per_page: 50 },
        { skip: !trainerProfile?.id },
    );

    const clientMap = useMemo(() => {
        const map = new Map<number, { nombre: string; apellidos: string }>();
        const clients = clientsData?.items || [];
        clients.forEach((client) => {
            map.set(client.id, { nombre: client.nombre, apellidos: client.apellidos });
        });
        return map;
    }, [clientsData]);

    const clientNameMap = useMemo(() => {
        const map = new Map<number, string>();
        clientMap.forEach((v, id) => {
            map.set(id, `${v.nombre} ${v.apellidos}`.trim());
        });
        return map;
    }, [clientMap]);

    const validClientIds = useMemo(() => {
        const clients = clientsData?.items || [];
        return new Set(clients.map((client) => client.id));
    }, [clientsData]);

    const getClientName = useCallback(
        (clientId: number): string => clientNameMap.get(clientId) || `Cliente #${clientId}`,
        [clientNameMap],
    );

    const validAlerts = useMemo(() => {
        if (!alerts || alerts.length === 0) return [];
        return alerts.filter((alert) => validClientIds.has(alert.client_id));
    }, [alerts, validClientIds]);

    const handleAlertClick = useCallback(
        (clientId: number) => {
            if (!validClientIds.has(clientId)) return;
            navigate(`/dashboard/clients/${clientId}?focus=alerts`);
        },
        [navigate, validClientIds],
    );

    if (isLoadingAlerts) {
        return (
            <section className={TRAINER_DASHBOARD_WIDGET}>
                <NexiaGlassAccentRim />
                <div className={TRAINER_DASHBOARD_LOADING_BLOCK} />
            </section>
        );
    }

    const getSeverityBadge = (severity: FatigueAlertSeverity) =>
        TRAINER_DASHBOARD_SEVERITY_BADGE[severity] ?? TRAINER_DASHBOARD_SEVERITY_BADGE.default;

    const getAlertTypeLabel = (type: FatigueAlertType) => {
        switch (type) {
            case "overtraining":
                return "Sobreentrenamiento";
            case "recovery_needed":
                return "Recuperación Necesaria";
            case "session_adjustment":
                return "Ajuste de Sesión";
            default:
                return type;
        }
    };

    const severityLabel = (severity: FatigueAlertSeverity) => {
        if (severity === "critical") return "Crítica";
        if (severity === "high" || severity === "medium") return "Media";
        return "Baja";
    };

    return (
        <section className={TRAINER_DASHBOARD_WIDGET}>
            <NexiaGlassAccentRim />
            <div className={TRAINER_DASHBOARD_WIDGET_HEADER}>
                <div className={TRAINER_DASHBOARD_WIDGET_TITLE_ROW}>
                    <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
                    <h2 className={TRAINER_DASHBOARD_WIDGET_TITLE}>{TRAINER_DASHBOARD_COPY.alertsTitle}</h2>
                </div>
                <span className={TRAINER_DASHBOARD_ALERT_COUNT_BADGE}>{validAlerts.length} activas</span>
            </div>

            {validAlerts.length === 0 ? (
                <p className={cn(TRAINER_DASHBOARD_EMPTY_BODY, "py-4 text-center")}>
                    {TRAINER_DASHBOARD_COPY.noAlerts}
                </p>
            ) : (
                <>
                    <div className={TRAINER_DASHBOARD_LIST}>
                        {validAlerts.slice(0, 3).map((alert) => {
                            const client = clientMap.get(alert.client_id);
                            return (
                                <button
                                    key={alert.id}
                                    type="button"
                                    onClick={() => handleAlertClick(alert.client_id)}
                                    className={TRAINER_DASHBOARD_LIST_ITEM_ALERT}
                                    aria-label={`Ver alerta de ${getClientName(alert.client_id)}`}
                                >
                                    <ClientAvatar
                                        clientId={alert.client_id}
                                        nombre={client?.nombre}
                                        apellidos={client?.apellidos}
                                        size="md"
                                        className="h-9 w-9 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className={TRAINER_DASHBOARD_LIST_ITEM_NAME}>
                                            {getClientName(alert.client_id)}
                                        </p>
                                        <p className={TRAINER_DASHBOARD_LIST_ITEM_META}>
                                            {getAlertTypeLabel(alert.alert_type)}
                                        </p>
                                    </div>
                                    <span className={cn("shrink-0", getSeverityBadge(alert.severity))}>
                                        {severityLabel(alert.severity)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/clients")}
                        className={cn(TRAINER_DASHBOARD_LINK, "mt-3")}
                    >
                        {TRAINER_DASHBOARD_COPY.viewAll}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                </>
            )}
        </section>
    );
};
