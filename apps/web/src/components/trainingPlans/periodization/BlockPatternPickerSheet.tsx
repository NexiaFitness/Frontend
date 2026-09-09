/**
 * BlockPatternPickerSheet.tsx — Picker focal de patrones (modal premium por breakpoint).
 */

import React, { useMemo } from "react";

import type { MovementPattern } from "@nexia/shared/types/exercise";

import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";

import { PatternSelectorPanel } from "./PatternSelectorPanel";

interface Props {
    open: boolean;
    onClose: () => void;
    dayLabel: string;
    catalog: MovementPattern[];
    catalogLoading?: boolean;
    catalogError?: boolean;
    selectedPatternIds: readonly number[];
    onToggle: (patternId: number) => void;
}

export const BlockPatternPickerSheet: React.FC<Props> = ({
    open,
    onClose,
    dayLabel,
    catalog,
    catalogLoading,
    catalogError,
    selectedPatternIds,
    onToggle,
}) => {
    const countLabel = useMemo(() => {
        const n = selectedPatternIds.length;
        return n === 1 ? "1 patrón seleccionado" : `${n} patrones seleccionados`;
    }, [selectedPatternIds.length]);

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title={`Patrones — ${dayLabel}`}
            description="Selecciona manualmente los patrones de movimiento para este día."
            maxWidth="3xl"
            closeOnBackdrop
        >
            <div className="space-y-4">
                <PatternSelectorPanel
                    catalog={catalog}
                    catalogLoading={catalogLoading}
                    catalogError={catalogError}
                    selectedPatternIds={selectedPatternIds}
                    onToggle={onToggle}
                    className="max-h-[min(60vh,28rem)] overflow-y-auto scrollbar-primary pr-1"
                />
                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">{countLabel}</p>
                    <Button type="button" variant="primary" onClick={onClose}>
                        Listo
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
