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
                    <h2 className="text-2xl font-bold text-foreground">Lesiones del Cliente</h2>
                    <p className="text-muted-foreground mt-1">
                        Gestiona lesiones activas y consulta el historial completo.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasActiveInjuries && (
                        <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/20 px-3 py-1 text-sm font-semibold text-destructive">
                            {activeInjuries.length} activas
                        </span>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Registrar lesión
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
                        clientId={clientId}
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

            {/* Empty global fallback si no hay datos en absoluto — mismo estilo que banners de la app */}
            {!isLoading && !hasActiveInjuries && historyInjuries.length === 0 && (
                <Alert variant="warning">
                    Aún no hay lesiones registradas para este cliente.
                </Alert>
            )}
        </div>
    );
};


