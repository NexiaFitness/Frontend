/**
 * ReplicateSessionConflictModal.tsx — Confirmacion secundaria ante conflictos de replicacion.
 *
 * Contexto:
 * - Se abre cuando la primera replicacion (force=false) detecta sesiones existentes
 *   en algunas semanas destino.
 * - Permite al usuario decidir si mantiene las sesiones existentes o las reemplaza.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { TriangleAlert } from "lucide-react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import type { SkippedConflictItem } from "@nexia/shared/types/trainingSessions";

interface ReplicateSessionConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmReplace: () => void;
    conflicts: SkippedConflictItem[];
    createdCount: number;
    isLoading: boolean;
}

export const ReplicateSessionConflictModal: React.FC<
    ReplicateSessionConflictModalProps
> = ({ isOpen, onClose, onConfirmReplace, conflicts, createdCount, isLoading }) => {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Sesiones con conflicto"
            description={`Se replicaron ${createdCount} sesiones correctamente. Algunas semanas destino ya tienen una sesion activa:`}
            iconType="warning"
            maxWidth="md"
            closeOnBackdrop={!isLoading}
            closeOnEsc={!isLoading}
            isLoading={isLoading}
        >
            <div className="space-y-4">
                <div className="space-y-2 rounded-lg border border-border p-3">
                    {conflicts.map((conflict, index) => (
                        <div
                            key={`${conflict.week_ordinal}-${index}`}
                            className="flex items-center gap-2 rounded-md bg-warning/5 px-2 py-1.5"
                        >
                            <TriangleAlert
                                className="h-4 w-4 shrink-0 text-warning"
                                aria-hidden
                            />
                            <span className="text-sm font-medium text-foreground">
                                Semana {conflict.week_ordinal}
                            </span>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {conflict.session_date}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-sm text-muted-foreground">
                    Puedes mantener las sesiones existentes o reemplazarlas con la version
                    replicada.
                </p>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Mantener existentes
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirmReplace}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        Reemplazar
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
