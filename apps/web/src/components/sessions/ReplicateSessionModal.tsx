/**
 * ReplicateSessionModal.tsx — Modal principal para replicar una sesion a otras semanas.
 *
 * Responsabilidades:
 * - Mostrar checkboxes de semanas destino disponibles dentro del bloque.
 * - Permitir seleccionar/desseleccionar semanas.
 * - Ejecutar la primera replicacion con force=false.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { Copy } from "lucide-react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { Checkbox } from "@/components/ui/forms/Checkbox";

interface WeekOption {
    ordinal: number;
    label: string;
    date: string;
}

interface ReplicateSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    weeks: WeekOption[];
    selectedWeeks: number[];
    onToggleWeek: (ordinal: number) => void;
    onReplicate: () => void;
    isLoading: boolean;
    sessionName: string;
    hasBlock: boolean;
    isBlockLoading: boolean;
}

export const ReplicateSessionModal: React.FC<ReplicateSessionModalProps> = ({
    isOpen,
    onClose,
    weeks,
    selectedWeeks,
    onToggleWeek,
    onReplicate,
    isLoading,
    sessionName,
    hasBlock,
    isBlockLoading,
}) => {
    const allSelected = weeks.length > 0 && selectedWeeks.length === weeks.length;

    const handleSelectAll = () => {
        if (allSelected) {
            weeks.forEach((w) => {
                if (selectedWeeks.includes(w.ordinal)) {
                    onToggleWeek(w.ordinal);
                }
            });
        } else {
            weeks.forEach((w) => {
                if (!selectedWeeks.includes(w.ordinal)) {
                    onToggleWeek(w.ordinal);
                }
            });
        }
    };

    const canSubmit = selectedWeeks.length > 0 && !isLoading && !isBlockLoading;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Replicar "${sessionName}"`}
            description="Selecciona las semanas destino dentro del bloque."
            iconType="info"
            maxWidth="md"
            closeOnBackdrop={!isLoading}
            closeOnEsc={!isLoading}
            isLoading={isLoading}
        >
            <div className="space-y-4">
                {!hasBlock && !isBlockLoading && (
                    <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
                        No se pudo cargar el bloque de periodizacion asociado.
                    </div>
                )}

                {isBlockLoading && (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 w-full animate-pulse rounded-md bg-muted"
                            />
                        ))}
                    </div>
                )}

                {hasBlock && weeks.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No hay otras semanas disponibles en este bloque.
                    </p>
                )}

                {hasBlock && weeks.length > 0 && (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                {selectedWeeks.length} de {weeks.length} semanas seleccionadas
                            </span>
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                {allSelected ? "Desseleccionar todo" : "Seleccionar todo"}
                            </button>
                        </div>

                        <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                            {weeks.map((week) => (
                                <div
                                    key={week.ordinal}
                                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent"
                                >
                                    <Checkbox
                                        id={`week-${week.ordinal}`}
                                        label={week.label}
                                        checked={selectedWeeks.includes(week.ordinal)}
                                        onChange={() => onToggleWeek(week.ordinal)}
                                        disabled={isLoading}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {week.date}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onReplicate}
                        disabled={!canSubmit}
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        <Copy className="mr-1.5 h-4 w-4" />
                        Replicar
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
