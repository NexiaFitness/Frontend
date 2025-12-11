/**
 * ClientInjuriesTab.tsx — Tab de Lesiones del cliente
 *
 * Responsabilidades:
 * - Mostrar lesiones activas y historial completo
 * - Acceso al formulario de registro (create)
 * - Loading/empty states coherentes con Testing/Progress
 *
 * @author Nelson Valero
 * @since v5.7.0
 */

import React, { useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { InjuriesActiveSection } from "./InjuriesActiveSection";
import { InjuriesHistorySection } from "./InjuriesHistorySection";
import { InjuryFormModal } from "./InjuryFormModal";

interface ClientInjuriesTabProps {
    clientId: number;
}

export const ClientInjuriesTab: React.FC<ClientInjuriesTabProps> = ({ clientId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInjury, setSelectedInjury] = useState<InjuryWithDetails | null>(null);

    const {
        activeInjuries,
        historyInjuries,
        isLoadingActive,
        isLoadingHistory,
        hasActiveInjuries,
        totalInjuries,
    } = useClientInjuries({
        clientId,
        includeHistory: true,
    });

    const isLoading = useMemo(
        () => isLoadingActive || isLoadingHistory,
        [isLoadingActive, isLoadingHistory]
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Lesiones del Cliente</h2>
                    <p className="text-gray-600 mt-1">
                        Gestiona lesiones activas y consulta el historial completo.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasActiveInjuries && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
                            {activeInjuries.length} activas
                        </span>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        ➕ Registrar lesión
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {/* Sección lesiones activas */}
                    <InjuriesActiveSection
                        injuries={activeInjuries}
                        isLoading={isLoadingActive}
                        onAddClick={() => {
                            setSelectedInjury(null);
                            setIsModalOpen(true);
                        }}
                        onEditClick={(injury) => {
                            setSelectedInjury(injury);
                            setIsModalOpen(true);
                        }}
                    />

                    {/* Historial */}
                    <InjuriesHistorySection
                        injuries={historyInjuries}
                        totalCount={totalInjuries}
                        isLoading={isLoadingHistory}
                    />
                </>
            )}

            {/* Modal registro/edición */}
            <InjuryFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedInjury(null);
                }}
                clientId={clientId}
                injury={selectedInjury}
            />

            {/* Empty global fallback si no hay datos en absoluto */}
            {!isLoading && !hasActiveInjuries && historyInjuries.length === 0 && (
                <Alert variant="info">
                    Aún no hay lesiones registradas para este cliente.
                </Alert>
            )}
        </div>
    );
};


