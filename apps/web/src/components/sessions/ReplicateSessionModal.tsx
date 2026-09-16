/**
 * ReplicateSessionModal.tsx — Replicar sesión a otras semanas (NexiaPremiumModal).
 */

import React from "react";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/buttons";
import { Checkbox } from "@/components/ui/forms/Checkbox";
import {
    NexiaPremiumModal,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
    NEXIA_PREMIUM_MODAL_FORM_FOOTER_ACTIONS_CLASS,
    NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS,
    NEXIA_PREMIUM_MODAL_TITLE_ACCENT_CLASS,
} from "@/components/ui/modals";
import { cn } from "@/lib/utils";

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
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="lg"
            closeOnBackdrop={!isLoading}
            closeOnEsc={!isLoading}
            title={
                <>
                    Replicar{" "}
                    <span className={NEXIA_PREMIUM_MODAL_TITLE_ACCENT_CLASS}>
                        «{sessionName}»
                    </span>
                </>
            }
            description="Selecciona las semanas destino dentro del bloque."
            footer={
                <div className={NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS}>
                    <div className={NEXIA_PREMIUM_MODAL_FORM_FOOTER_ACTIONS_CLASS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={onReplicate}
                            disabled={!canSubmit}
                            isLoading={isLoading}
                            className={cn(NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS, "flex-1 sm:flex-none")}
                        >
                            <Copy className="mr-1.5 h-4 w-4" aria-hidden />
                            Replicar
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {!hasBlock && !isBlockLoading && (
                    <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
                        No se pudo cargar el bloque de periodización asociado.
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

                        <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-border/50 p-3">
                            {weeks.map((week) => (
                                <div
                                    key={week.ordinal}
                                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50"
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
            </div>
        </NexiaPremiumModal>
    );
};
