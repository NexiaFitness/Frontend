/**
 * FatigueAlertsSection.tsx — Sección de alertas de fatiga del cliente
 *
 * Contexto:
 * - Muestra todas las alertas de fatiga del cliente
 * - Permite crear nuevas alertas
 * - Integra hook useFatigueAlerts para lógica
 * - Componente separado para mantener arquitectura limpia
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React, { useState, useCallback } from "react";
import { useFatigueAlerts } from "@nexia/shared/hooks/clients/useFatigueAlerts";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";
import { FatigueAlertCard } from "./FatigueAlertCard";
import { CreateFatigueAlertModal } from "./CreateFatigueAlertModal";

interface FatigueAlertsSectionProps {
    clientId: number;
}

export const FatigueAlertsSection: React.FC<FatigueAlertsSectionProps> = ({ clientId }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [markingAsReadId, setMarkingAsReadId] = useState<number | null>(null);
    const [resolvingId, setResolvingId] = useState<number | null>(null);

    const {
        alerts,
        unreadCount,
        activeCount,
        trainerId,
        isLoadingTrainer,
        createAlert,
        markAsRead,
        resolveAlert,
        isLoading,
        isCreating,
        isError,
        error,
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
                refetch();
            } catch (err) {
                console.error("Error creating alert:", err);
                throw err;
            }
        },
        [createAlert, refetch]
    );

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
                refetch();
            } catch (err) {
                console.error("Error resolving alert:", err);
            } finally {
                setResolvingId(null);
            }
        },
        [resolveAlert, refetch]
    );

    // Loading state
    if (isLoading || isLoadingTrainer) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-center items-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <Alert variant="error">
                    Error al cargar las alertas de fatiga. Por favor, intenta de nuevo.
                </Alert>
            </div>
        );
    }

    // No trainer ID
    if (!trainerId) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <Alert variant="warning">
                    No se pudo obtener el ID del entrenador. Por favor, inicia sesión como trainer.
                </Alert>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900`}>
                            Alertas de Fatiga
                        </h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span>
                                <strong>{activeCount}</strong> activas
                            </span>
                            <span>
                                <strong>{unreadCount}</strong> no leídas
                            </span>
                            <span>
                                <strong>{alerts.length}</strong> total
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        + Crear Alerta
                    </Button>
                </div>

                {/* Lista de alertas */}
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay alertas de fatiga para este cliente.</p>
                        <p className="text-sm mt-2">
                            Crea una alerta si detectas signos de sobreentrenamiento o necesidad de
                            recuperación.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alerts.map((alert) => (
                            <FatigueAlertCard
                                key={alert.id}
                                alert={alert}
                                onMarkAsRead={handleMarkAsRead}
                                onResolve={handleResolve}
                                isMarkingAsRead={markingAsReadId === alert.id}
                                isResolving={resolvingId === alert.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para crear alerta */}
            <CreateFatigueAlertModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateAlert}
                isSubmitting={isCreating}
            />
        </>
    );
};

