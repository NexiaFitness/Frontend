/**
 * FatigueAlertCard.tsx — Card individual de alerta de fatiga
 *
 * Contexto:
 * - Muestra información de una alerta de fatiga
 * - Permite marcar como leída y resolver (si no es readOnly)
 * - Colores según severidad
 * - Soporta modo readOnly para historial (solo lectura)
 *
 * @author Frontend Team
 * @since v5.0.0
 * @updated v6.3.0 - Agregado modo readOnly y modal para resolver
 */

import React, { useState, useCallback } from "react";
import type { FatigueAlert } from "@nexia/shared/types/training";
import { ResolveAlertModal } from "./ResolveAlertModal";

interface FatigueAlertCardProps {
    alert: FatigueAlert;
    onMarkAsRead?: (alertId: number) => void;
    onResolve?: (alertId: number, resolutionNotes?: string) => void;
    isMarkingAsRead?: boolean;
    isResolving?: boolean;
    /**
     * Si es true, el card es de solo lectura (para historial)
     * No muestra botones de acción
     */
    readOnly?: boolean;
}

/**
 * Obtiene el color de fondo y borde según la severidad de la alerta
 */
const getSeverityColor = (severity: string): string => {
    switch (severity) {
        case "critical":
            return "bg-red-100 border-red-500 text-red-800";
        case "high":
            return "bg-orange-100 border-orange-500 text-orange-800";
        case "medium":
            return "bg-yellow-100 border-yellow-500 text-yellow-800";
        case "low":
            return "bg-blue-100 border-blue-500 text-blue-800";
        default:
            return "bg-gray-100 border-gray-500 text-gray-800";
    }
};

/**
 * Obtiene la etiqueta traducida del tipo de alerta
 */
const getAlertTypeLabel = (type: string): string => {
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

export const FatigueAlertCard: React.FC<FatigueAlertCardProps> = ({
    alert,
    onMarkAsRead,
    onResolve,
    isMarkingAsRead = false,
    isResolving = false,
    readOnly = false,
}) => {
    const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false);

    /**
     * Handler para abrir modal de resolución
     */
    const handleResolveClick = useCallback(() => {
        if (readOnly || !onResolve) {
            return;
        }
        setIsResolveModalOpen(true);
    }, [readOnly, onResolve]);

    /**
     * Handler para resolver desde modal
     */
    const handleResolveFromModal = useCallback(
        async (resolutionNotes?: string) => {
            if (!onResolve) {
                return;
            }
            await onResolve(alert.id, resolutionNotes);
            setIsResolveModalOpen(false);
        },
        [alert.id, onResolve]
    );

    const severityColor = getSeverityColor(alert.severity);
    const isResolved = alert.is_resolved;
    const isRead = alert.is_read;

    /**
     * Estilos para modo readOnly (historial)
     */
    const cardClassName = readOnly
        ? `border-l-4 p-4 rounded-lg mb-3 ${severityColor} opacity-60`
        : `border-l-4 p-4 rounded-lg mb-3 ${severityColor} ${isResolved ? "opacity-60" : ""}`;

    return (
        <>
            <div className={cardClassName}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm uppercase">
                                {getAlertTypeLabel(alert.alert_type)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                                {alert.severity}
                            </span>
                            {isResolved && (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
                                    Resuelta
                                </span>
                            )}
                            {!isRead && !isResolved && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-200 text-blue-800">
                                    No leída
                                </span>
                            )}
                        </div>
                        <h4 className="font-bold text-base mb-1">{alert.title}</h4>
                        <p className="text-sm mb-2">{alert.message}</p>
                        {alert.recommendations && (
                            <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                                <strong>Recomendaciones:</strong> {alert.recommendations}
                            </div>
                        )}
                        {alert.resolution_notes && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                                <strong>Notas de resolución:</strong> {alert.resolution_notes}
                            </div>
                        )}
                        <p className="text-xs mt-2 opacity-75">
                            {new Date(alert.created_at).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                        {isResolved && alert.resolved_at && (
                            <p className="text-xs mt-1 opacity-75">
                                Resuelta:{" "}
                                {new Date(alert.resolved_at).toLocaleDateString("es-ES", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions - Solo mostrar si no es readOnly y no está resuelta */}
                {!readOnly && !isResolved && onMarkAsRead && onResolve && (
                    <div className="flex gap-2 mt-3">
                        {!isRead && (
                            <button
                                onClick={() => onMarkAsRead(alert.id)}
                                disabled={isMarkingAsRead}
                                className="px-3 py-1 text-xs bg-white/70 hover:bg-white rounded transition-colors disabled:opacity-50"
                            >
                                {isMarkingAsRead ? "Marcando..." : "Marcar como leída"}
                            </button>
                        )}
                        <button
                            onClick={handleResolveClick}
                            disabled={isResolving}
                            className="px-3 py-1 text-xs bg-white/70 hover:bg-white rounded transition-colors disabled:opacity-50"
                        >
                            {isResolving ? "Resolviendo..." : "Resolver"}
                        </button>
                    </div>
                )}
            </div>

            {/* Modal para resolver alerta */}
            {!readOnly && onResolve && (
                <ResolveAlertModal
                    isOpen={isResolveModalOpen}
                    onClose={() => setIsResolveModalOpen(false)}
                    onResolve={handleResolveFromModal}
                    isResolving={isResolving}
                    alertTitle={alert.title}
                />
            )}
        </>
    );
};
