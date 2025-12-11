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
import { BaseModal } from "@/components/ui/modals/BaseModal";
import {
    useUpdateInjuryMutation,
    useDeleteInjuryMutation,
} from "@nexia/shared/api/injuriesApi";

interface InjuriesActiveSectionProps {
    injuries: InjuryWithDetails[];
    isLoading: boolean;
    onAddClick: () => void;
    onEditClick: (injury: InjuryWithDetails) => void;
}

const painLevelColor = (level: number) => {
    if (level <= 2) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (level === 3) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
};

const statusColor = (status: string) => {
    switch (status) {
        case "resolved":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "monitoring":
            return "bg-amber-50 text-amber-700 border-amber-200";
        default:
            return "bg-red-50 text-red-700 border-red-200";
    }
};

export const InjuriesActiveSection: React.FC<InjuriesActiveSectionProps> = ({
    injuries,
    isLoading,
    onAddClick,
    onEditClick,
}) => {
    const [resolveModal, setResolveModal] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<number | null>(null);

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
            <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Lesiones activas</h3>
                    <p className="text-gray-600 mt-1">Sin lesiones activas registradas.</p>
                </div>
                <button
                    onClick={onAddClick}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    Registrar lesión
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Lesiones activas</h3>
                    <span className="text-sm text-gray-500">{injuries.length} registros</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {injuries.map((injury) => (
                        <div
                            key={injury.id}
                            className="bg-white rounded-lg shadow-sm border border-red-100 p-4 flex flex-col gap-3"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Articulación</p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {injury.joint_name || "N/D"}
                                    </p>
                                    {injury.movement_name && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Movimiento: {injury.movement_name}
                                        </p>
                                    )}
                                    {injury.muscle_name && (
                                        <p className="text-sm text-gray-600">Músculo: {injury.muscle_name}</p>
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
                                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
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
                                    <span className="text-xs text-gray-500">
                                        Desde {new Date(injury.injury_date).toLocaleDateString("es-ES")}
                                    </span>
                                )}
                            </div>

                            {injury.notes && (
                                <p className="text-sm text-gray-600 line-clamp-3">{injury.notes}</p>
                            )}

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-auto pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => setResolveModal(injury.id)}
                                    disabled={isResolving}
                                    className="flex-1 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Resolver lesión"
                                >
                                    ✅ Resolver
                                </button>
                                <button
                                    onClick={() => setDeleteModal(injury.id)}
                                    disabled={isDeleting}
                                    className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <p className="text-gray-700">
                            La lesión se marcará como resuelta y se moverá al historial. Esta acción puede revertirse
                            editando la lesión.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                onClick={() => setResolveModal(null)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                disabled={isResolving}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={isResolving}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        <p className="text-gray-700">
                            Esta acción no se puede deshacer. La lesión se eliminará permanentemente del sistema.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </BaseModal>
            )}
        </>
    );
};
