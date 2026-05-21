/**
 * PeriodizationWeeklyStructureModal.tsx — Modal legacy de estructura semanal.
 *
 * El flujo principal en ClientPlanningTab usa el editor inline en PeriodizationPanel.
 * Este modal se conserva para otros consumidores que aún lo invoquen.
 */

import React from "react";

import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";

import {
    PeriodizationWeeklyStructureEditor,
    computeWeeklyStructureMetrics,
} from "./PeriodizationWeeklyStructureEditor";

export interface PeriodizationWeeklyStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    startDate: string;
    endDate: string;
    trainingDays?: readonly string[] | null;
    patternsCatalog: MovementPattern[];
    patternsLoading?: boolean;
    patternsError?: boolean;
    value: WeeklyStructureWeekCreate[];
    onChange: (draft: WeeklyStructureWeekCreate[]) => void;
}

export const PeriodizationWeeklyStructureModal: React.FC<
    PeriodizationWeeklyStructureModalProps
> = ({
    isOpen,
    onClose,
    startDate,
    endDate,
    trainingDays,
    patternsCatalog,
    patternsLoading,
    patternsError,
    value,
    onChange,
}) => {
    const metrics = computeWeeklyStructureMetrics(
        startDate,
        endDate,
        trainingDays,
        value,
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Estructura semanal"
            maxWidth="3xl"
        >
            <div className="space-y-4">
                <PeriodizationWeeklyStructureEditor
                    startDate={startDate}
                    endDate={endDate}
                    trainingDays={trainingDays}
                    patternsCatalog={patternsCatalog}
                    patternsLoading={patternsLoading}
                    patternsError={patternsError}
                    value={value}
                    onChange={onChange}
                    showRangeHeader={false}
                />
                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {metrics.withPatterns} / {metrics.totalTrainable} días
                        configurados
                    </span>
                    <Button variant="primary" size="sm" onClick={onClose}>
                        Listo
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
