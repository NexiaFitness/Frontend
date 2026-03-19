/**
 * ClientAlertsSection.tsx — Sección de Alertas Persistentes del Cliente
 *
 * Contexto:
 * - Muestra alertas persistentes (FatigueAlert) que requieren acción del trainer
 * - Estas son las MISMAS alertas que aparecen en el dashboard del trainer
 * - Acciones disponibles: Mark as read (opcional) y Resolve (acción principal)
 * - Una vez resueltas, desaparecen del dashboard y se mueven al historial
 *
 * Responsabilidades:
 * - Mostrar alertas activas (is_resolved = false) en tab "Activas"
 * - Mostrar alertas resueltas (is_resolved = true) en tab "Historial"
 * - Permitir marcar como leída (informacional)
 * - Permitir resolver (acción principal) con modal
 * - Integrar con useFatigueAlerts hook y useToast para feedback
 *
 * @author Frontend Team
 * @since v6.3.0 - Fase 2: Separación Alerts/Status
 * @updated v6.3.1 - Fase 3: Tabs Activas/Historial y modal de resolución
 */

import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFatigueAlerts } from "@nexia/shared/hooks/clients/useFatigueAlerts";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useToast } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { FatigueAlertCard } from "../fatigue/FatigueAlertCard";
import { CreateFatigueAlertModal } from "../fatigue/CreateFatigueAlertModal";
import { getFatigueAlertContextualAction } from "@nexia/shared";
import type { FatigueAlert } from "@nexia/shared/types/training";

type AlertsTab = "active" | "history";

interface ClientAlertsSectionProps {
    clientId: number;
    sectionRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Sección de Alertas Persistentes del Cliente
 *
 * Muestra alertas que requieren acción inmediata del trainer.
 * Estas alertas son las mismas que aparecen en el dashboard.
 */
export const ClientAlertsSection: React.FC<ClientAlertsSectionProps> = ({ clientId, sectionRef }) => {
    const navigate = useNavigate();
    const [markingAsReadId, setMarkingAsReadId] = useState<number | null>(null);
    const [resolvingId, setResolvingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<AlertsTab>("active");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { showSuccess, showError } = useToast();

    const {
        alerts: allAlerts,
        trainerId,
        isLoadingTrainer,
        markAsRead,
        resolveAlert,
        createAlert,
        isLoading,
        isCreating,
        isError,
        refetch,
    } = useFatigueAlerts(clientId);

    const handleCreateAlert = useCallback(
        async (data: {
            alert_type: "overtraining" | "recovery_needed" | "session_adjustment";
            severity: "low" | "medium" | "high" | "critical";
            title: string;
            message: string;
            recommendations?: string;
        }) => {
            try {
                await createAlert(data);
                showSuccess("Alerta creada correctamente");
                setShowCreateModal(false);
                refetch();
            } catch (err) {
                console.error("Error creating alert:", err);
                throw err;
            }
        },
        [createAlert, refetch, showSuccess]
    );

    /**
     * Filtrar alertas activas (no resueltas)
     * Las alertas resueltas desaparecen del dashboard
     */
    const unresolvedAlerts = useMemo(() => {
        return allAlerts.filter((alert: FatigueAlert) => !alert.is_resolved);
    }, [allAlerts]);

    /**
     * Filtrar alertas resueltas (historial)
     * Mostrar últimas 20 ordenadas por fecha de resolución descendente
     */
    const resolvedAlerts = useMemo(() => {
        const resolved = allAlerts
            .filter((alert: FatigueAlert) => alert.is_resolved)
            .sort((a, b) => {
                const dateA = a.resolved_at ? new Date(a.resolved_at).getTime() : 0;
                const dateB = b.resolved_at ? new Date(b.resolved_at).getTime() : 0;
                return dateB - dateA; // Más recientes primero
            });
        return resolved.slice(0, 20); // Limitar a últimas 20
    }, [allAlerts]);

    const handleMarkAsRead = useCallback(
        async (alertId: number) => {
            setMarkingAsReadId(alertId);
            try {
                await markAsRead(alertId);
                refetch();
            } catch (err) {
                console.error("Error marking alert as read:", err);
            } finally {
                setMarkingAsReadId(null);
            }
        },
        [markAsRead, refetch]
    );

    const handleResolve = useCallback(
        async (alertId: number, resolutionNotes?: string) => {
            setResolvingId(alertId);
            try {
                await resolveAlert(alertId, resolutionNotes);
                showSuccess("Alerta resuelta correctamente");
                refetch();
            } catch (err) {
                console.error("Error resolving alert:", err);
                showError("Error al resolver la alerta. Por favor, intenta de nuevo.");
            } finally {
                setResolvingId(null);
            }
        },
        [resolveAlert, refetch, showSuccess, showError]
    );

    // Loading state
    if (isLoading || isLoadingTrainer) {
        return (
            <div className="bg-card border border-border rounded-lg shadow p-6">
                <div className="flex justify-center items-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="bg-card border border-border rounded-lg shadow p-6">
                <Alert variant="error">
                    Error al cargar las alertas. Por favor, intenta de nuevo.
                </Alert>
            </div>
        );
    }

    // No trainer ID
    if (!trainerId) {
        return (
            <div className="bg-card border border-border rounded-lg shadow p-6">
                <Alert variant="warning">
                    No se pudo obtener el ID del entrenador. Por favor, inicia sesión como trainer.
                </Alert>
            </div>
        );
    }

    /**
     * Renderizar contenido según tab activo
     */
    const renderTabContent = () => {
        if (activeTab === "active") {
            if (unresolvedAlerts.length === 0) {
                return (
                    <div className="py-8 text-center text-muted-foreground">
                        <p className="text-base">No hay alertas pendientes</p>
                        <p className="mt-2 text-sm">
                            Todas las alertas han sido resueltas o no hay alertas activas para este cliente.
                        </p>
                    </div>
                );
            }

            return (
                <div className="space-y-3">
                    {unresolvedAlerts.map((alert) => (
                        <div key={alert.id}>
                            <FatigueAlertCard
                                alert={alert}
                                onMarkAsRead={handleMarkAsRead}
                                onResolve={handleResolve}
                                isMarkingAsRead={markingAsReadId === alert.id}
                                isResolving={resolvingId === alert.id}
                                readOnly={false}
                            />
                            {(() => {
                                const action = getFatigueAlertContextualAction(alert.alert_type);
                                const path = action.tab
                                    ? `/dashboard/clients/${clientId}?tab=${action.tab}`
                                    : `/dashboard/clients/${clientId}`;
                                return (
                                    <button
                                        type="button"
                                        onClick={() => navigate(path)}
                                        className="mt-1 text-sm font-medium text-primary hover:text-primary/80"
                                    >
                                        {action.label} →
                                    </button>
                                );
                            })()}
                        </div>
                    ))}
                </div>
            );
        }

        // Tab "Historial"
        if (resolvedAlerts.length === 0) {
            return (
                <div className="py-8 text-center text-muted-foreground">
                    <p className="text-base">No hay alertas resueltas</p>
                    <p className="mt-2 text-sm">El historial de alertas resueltas aparecerá aquí.</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {resolvedAlerts.map((alert) => (
                    <FatigueAlertCard
                        key={alert.id}
                        alert={alert}
                        readOnly={true}
                    />
                ))}
            </div>
        );
    };

    return (
        <div 
            ref={sectionRef}
            className="bg-card border border-border rounded-lg shadow p-6" 
            id="client-alerts-section"
        >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className={`text-lg font-semibold text-foreground mb-2`}>
                        Alertas
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Alertas persistentes que requieren tu atención. Al resolverlas, desaparecerán del dashboard.
                    </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(true)}>
                    Crear alerta
                </Button>
            </div>

            {/* Tabs: Activas / Historial */}
            <div className="mb-4 border-b border-border">
                <nav className="flex gap-4" aria-label="Tabs de alertas">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "active"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                        aria-selected={activeTab === "active"}
                        role="tab"
                    >
                        Activas
                        {unresolvedAlerts.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                {unresolvedAlerts.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === "history"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                        aria-selected={activeTab === "history"}
                        role="tab"
                    >
                        Historial
                        {resolvedAlerts.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                                {resolvedAlerts.length}
                            </span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Contenido del tab activo */}
            {renderTabContent()}

            <CreateFatigueAlertModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateAlert}
                isSubmitting={isCreating}
            />
        </div>
    );
};

