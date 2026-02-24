import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDashboardAlerts, useGetCurrentTrainerProfileQuery } from "@nexia/shared";
import { getFatigueAlertContextualAction } from "@nexia/shared";
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
    
    // Crear mapa de client_id -> nombre y Set de client_ids válidos
    const clientNameMap = useMemo(() => {
        const map = new Map<number, string>();
        const clients = clientsData?.items || [];
        clients.forEach(client => {
            map.set(client.id, `${client.nombre} ${client.apellidos}`.trim());
        });
        return map;
    }, [clientsData]);

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
            <div className="bg-card border border-border rounded-2xl shadow-xl p-6 lg:p-8">
                <div className="h-48 bg-muted rounded animate-pulse" />
            </div>
        );
    }

    const getSeverityColor = (severity: FatigueAlertSeverity) => {
        switch (severity) {
            case "critical": return "bg-destructive/10 border-destructive/50 text-destructive";
            case "high": return "bg-warning/10 border-warning/50 text-warning";
            case "medium": return "bg-warning/10 border-warning/30 text-warning";
            case "low": return "bg-info/10 border-info/50 text-info";
            default: return "bg-muted border-border text-muted-foreground";
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
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl lg:text-2xl font-bold text-foreground">
                    Alertas Prioritarias
                </h3>
                <span className="bg-destructive/10 text-destructive text-xs font-semibold px-3 py-1 rounded-full">
                    {validAlerts.length} activas
                </span>
            </div>
            <div className="space-y-3">
                {validAlerts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No hay alertas en este momento</p>
                ) : (
                    validAlerts.slice(0, 3).map((alert) => (
                        <div
                            key={alert.id}
                            onClick={() => handleAlertClick(alert.client_id)}
                            className={`border-l-4 p-4 rounded cursor-pointer transition-all hover:shadow-md ${getSeverityColor(alert.severity)}`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleAlertClick(alert.client_id);
                                }
                            }}
                            aria-label={`Ver alerta de ${getClientName(alert.client_id)}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm uppercase">
                                    {getAlertTypeLabel(alert.alert_type)}
                                </span>
                                <span className="text-xs opacity-75">
                                    {new Date(alert.created_at).toLocaleDateString("es-ES")}
                                </span>
                            </div>
                            <p className="text-sm font-semibold mb-1">{alert.title}</p>
                            <p className="text-sm">{alert.message}</p>
                            <p className="text-xs mt-1 opacity-75">Cliente: {getClientName(alert.client_id)}</p>
                            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                {(() => {
                                    const action = getFatigueAlertContextualAction(alert.alert_type);
                                    const path = action.tab
                                        ? `/dashboard/clients/${alert.client_id}?tab=${action.tab}`
                                        : `/dashboard/clients/${alert.client_id}`;
                                    return (
                                        <button
                                            type="button"
                                            className="text-xs font-medium text-primary hover:text-primary/80 underline"
                                            onClick={() => navigate(path)}
                                        >
                                            {action.label} →
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

