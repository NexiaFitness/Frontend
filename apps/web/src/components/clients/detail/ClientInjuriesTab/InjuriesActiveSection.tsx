/**
 * InjuriesActiveSection.tsx — Sección de lesiones activas
 *
 * Muestra cards con detalle resumido y acciones: Editar, Resolver, Eliminar.
 *
 * @author Nelson Valero
 * @since v5.7.0
 * @updated v5.7.1 - Agregados botones Editar, Resolver, Eliminar
 */

import React, { useState } from "react";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { InjuryAlternativesModal } from "./InjuryAlternativesModal";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import {
    useUpdateInjuryMutation,
    useDeleteInjuryMutation,
} from "@nexia/shared/api/injuriesApi";

interface InjuriesActiveSectionProps {
    injuries: InjuryWithDetails[];
    isLoading: boolean;
    clientId: number;
    onEditClick: (injury: InjuryWithDetails) => void;
}

const painLevelColor = (level: number) => {
    if (level <= 2) return "bg-success/10 text-success border-success/30";
    if (level === 3) return "bg-warning/10 text-warning border-warning/30";
    return "bg-destructive/10 text-destructive border-destructive/30";
};

const statusColor = (status: string) => {
    switch (status) {
        case "resolved":
            return "bg-success/10 text-success border-success/30";
        case "monitoring":
            return "bg-warning/10 text-warning border-warning/30";
        default:
            return "bg-destructive/10 text-destructive border-destructive/30";
    }
};

export const InjuriesActiveSection: React.FC<InjuriesActiveSectionProps> = ({
    injuries,
    isLoading,
    clientId,
    onEditClick,
}) => {
    const [resolveModal, setResolveModal] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<number | null>(null);
    const [alternativesInjury, setAlternativesInjury] = useState<InjuryWithDetails | null>(null);

    const [updateInjury, { isLoading: isResolving }] = useUpdateInjuryMutation();
    const [deleteInjury, { isLoading: isDeleting }] = useDeleteInjuryMutation();

    const handleResolve = async () => {
        if (!resolveModal) return;

        try {
            await updateInjury({
                injuryId: resolveModal,
                data: {
                    status: "resolved",
                    resolution_date: new Date().toISOString().split("T")[0],
                },
            }).unwrap();

            setResolveModal(null);
        } catch (error) {
            console.error("Error al resolver lesión:", error);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;

        try {
            await deleteInjury(deleteModal).unwrap();
            setDeleteModal(null);
        } catch (error) {
            console.error("Error al eliminar lesión:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (!injuries || injuries.length === 0) {
        return (
            <div className="rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground">Lesiones activas</h3>
                <p className="text-muted-foreground mt-1">Sin lesiones activas registradas.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Lesiones activas</h3>
                    <span className="text-sm text-muted-foreground">{injuries.length} registros</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {injuries.map((injury) => (
                        <div
                            key={injury.id}
                            className="bg-card border border-destructive/20 rounded-lg shadow-sm p-4 flex flex-col gap-3"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Articulación</p>
                                    <p className="text-base font-semibold text-foreground">
                                        {injury.joint_name || "N/D"}
                                    </p>
                                    {injury.movement_name && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Movimiento: {injury.movement_name}
                                        </p>
                                    )}
                                    {injury.muscle_name && (
                                        <p className="text-sm text-muted-foreground">Músculo: {injury.muscle_name}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColor(
                                            injury.status
                                        )}`}
                                    >
                                        {injury.status === "active"
                                            ? "Activa"
                                            : injury.status === "resolved"
                                              ? "Resuelta"
                                              : "Monitoreo"}
                                    </span>
                                    <button
                                        onClick={() => onEditClick(injury)}
                                        className="px-2 py-1 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                        aria-label="Editar lesión"
                                        title="Editar lesión"
                                    >
                                        ✏️ Editar
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${painLevelColor(
                                        injury.pain_level
                                    )}`}
                                >
                                    Dolor {injury.pain_level}/5
                                </span>
                                {injury.injury_date && (
                                    <span className="text-xs text-muted-foreground">
                                        Desde {new Date(injury.injury_date).toLocaleDateString("es-ES")}
                                    </span>
                                )}
                            </div>

                            {injury.notes && (
                                <p className="text-sm text-muted-foreground line-clamp-3">{injury.notes}</p>
                            )}

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-auto pt-2 border-t border-border">
                                <button
                                    onClick={() => setResolveModal(injury.id)}
                                    disabled={isResolving}
                                    className="flex-1 px-3 py-1.5 text-sm text-success hover:text-success hover:bg-success/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Resolver lesión"
                                >
                                    ✅ Resolver
                                </button>
                                <button
                                    onClick={() => setDeleteModal(injury.id)}
                                    disabled={isDeleting}
                                    className="flex-1 px-3 py-1.5 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Eliminar lesión"
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de confirmación: Resolver */}
            {resolveModal && (
                <BaseModal
                    isOpen={true}
                    onClose={() => setResolveModal(null)}
                    title="¿Resolver esta lesión?"
                    description="La lesión se marcará como resuelta y se moverá al historial."
                    iconType="success"
                >
                    <div className="space-y-4">
                        <p className="text-foreground">
                            La lesión se marcará como resuelta y se moverá al historial. Esta acción puede revertirse
                            editando la lesión.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                onClick={() => setResolveModal(null)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors"
                                disabled={isResolving}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={isResolving}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-success text-success-foreground font-semibold hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isResolving ? "Resolviendo..." : "Resolver"}
                            </button>
                        </div>
                    </div>
                </BaseModal>
            )}

            {/* Modal de confirmación: Eliminar */}
            {deleteModal && (
                <BaseModal
                    isOpen={true}
                    onClose={() => setDeleteModal(null)}
                    title="¿Eliminar esta lesión?"
                    description="Esta acción no se puede deshacer."
                    iconType="danger"
                >
                    <div className="space-y-4">
                        <p className="text-foreground">
                            Esta acción no se puede deshacer. La lesión se eliminará permanentemente del sistema.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </BaseModal>
            )}

            {/* Modal Buscar alternativas (TICK-C04) */}
            {alternativesInjury && (
                <InjuryAlternativesModal
                    isOpen={true}
                    onClose={() => setAlternativesInjury(null)}
                    injury={alternativesInjury}
                    clientId={clientId}
                />
            )}
        </>
    );
};
