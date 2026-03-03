import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { ClientAvatar } from "@/components/ui/avatar";
import { useDashboardAlerts, useGetCurrentTrainerProfileQuery } from "@nexia/shared";
import type { FatigueAlertSeverity, FatigueAlertType } from "@nexia/shared/types/training";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import type { RootState } from "@nexia/shared/store";

export const PriorityAlertsWidget: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { alerts, isLoading: isLoadingAlerts } = useDashboardAlerts();
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !isAuthenticated,
    });
    
    // Obtener todos los clientes del trainer para hacer lookup de nombres
    const { data: clientsData } = useGetTrainerClientsQuery(
        { trainerId: trainerProfile?.id ?? 0, page: 1, per_page: 50 },
        { skip: !trainerProfile?.id }
    );
    
    // Crear mapa de client_id -> { nombre, apellidos } y Set de client_ids válidos
    const clientMap = useMemo(() => {
        const map = new Map<number, { nombre: string; apellidos: string }>();
        const clients = clientsData?.items || [];
        clients.forEach(client => {
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

    // Set de client_ids que pertenecen al trainer actual
    const validClientIds = useMemo(() => {
        const clients = clientsData?.items || [];
        return new Set(clients.map(client => client.id));
    }, [clientsData]);
    
    const getClientName = useCallback((clientId: number): string => {
        return clientNameMap.get(clientId) || `Cliente #${clientId}`;
    }, [clientNameMap]);

    /**
     * Filtrar alertas para solo mostrar aquellas de clientes que pertenecen al trainer actual
     * Esto previene navegación a clientes que ya no están asignados al trainer
     */
    const validAlerts = useMemo(() => {
        if (!alerts || alerts.length === 0) {
            return [];
        }
        return alerts.filter(alert => validClientIds.has(alert.client_id));
    }, [alerts, validClientIds]);

    /**
     * Navegar al detalle del cliente con focus en la sección de alertas
     * Dashboard = radar, solo navegación, sin acciones
     * Valida que el cliente pertenezca al trainer antes de navegar
     */
    const handleAlertClick = useCallback((clientId: number) => {
        // Validar que el cliente pertenece al trainer antes de navegar
        if (!validClientIds.has(clientId)) {
            // Si el cliente no pertenece al trainer, mostrar mensaje o redirigir a lista
            // Por ahora, simplemente no navegar (la alerta ya fue filtrada)
            return;
        }
        navigate(`/dashboard/clients/${clientId}?focus=alerts`);
    }, [navigate, validClientIds]);

    if (isLoadingAlerts) {
        return (
            <div className="bg-surface border border-border rounded-xl p-6 lg:p-8">
                <div className="h-48 bg-surface-2 rounded animate-pulse" />
            </div>
        );
    }

    const getSeverityBadge = (severity: FatigueAlertSeverity) => {
        switch (severity) {
            case "critical":
                return "bg-destructive/10 text-destructive";
            case "high":
            case "medium":
                return "bg-warning/10 text-warning";
            case "low":
                return "bg-info/10 text-info";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const getAlertTypeLabel = (type: FatigueAlertType) => {
        switch (type) {
            case "overtraining": return "Sobreentrenamiento";
            case "recovery_needed": return "Recuperación Necesaria";
            case "session_adjustment": return "Ajuste de Sesión";
            default: return type;
        }
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                    <h2 className="text-lg font-semibold text-foreground">Requiere atención</h2>
                </div>
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                    {validAlerts.length} activas
                </span>
            </div>
            <div className="space-y-3">
                {validAlerts.length === 0 ? (
                    <p className="rounded-lg bg-surface p-6 text-center text-muted-foreground">
                        No hay alertas en este momento
                    </p>
                ) : (
                    <>
                        {validAlerts.slice(0, 3).map((alert) => {
                            const client = clientMap.get(alert.client_id);
                            return (
                                <button
                                    key={alert.id}
                                    type="button"
                                    onClick={() => handleAlertClick(alert.client_id)}
                                    className="flex w-full items-center gap-4 rounded-lg border-l-[3px] border-destructive bg-surface p-4 text-left transition-colors hover:bg-surface-2"
                                    aria-label={`Ver alerta de ${getClientName(alert.client_id)}`}
                                >
                                    <ClientAvatar
                                        clientId={alert.client_id}
                                        nombre={client?.nombre}
                                        apellidos={client?.apellidos}
                                        size="md"
                                        className="h-9 w-9 shrink-0"
                                    />
                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {getClientName(alert.client_id)}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {getAlertTypeLabel(alert.alert_type)}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getSeverityBadge(alert.severity)}`}
                                    >
                                        {alert.severity === "critical" ? "Crítica" : alert.severity === "high" || alert.severity === "medium" ? "Media" : "Baja"}
                                    </span>
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/clients")}
                            className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            Ver todas
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

