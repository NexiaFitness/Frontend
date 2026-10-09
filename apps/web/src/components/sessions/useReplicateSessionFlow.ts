/**
 * useReplicateSessionFlow.ts — Hook que orquesta el flujo completo de replicar sesion.
 *
 * Responsabilidades:
 * - Cargar el bloque de periodizacion asociado a la sesion.
 * - Obtener las semanas destino validas desde shared (ancladas al lunes, como el BE).
 * - Gestionar seleccion de semanas destino.
 * - Ejecutar la primera mutacion con force=false.
 * - Si hay huecos con sesion sustituible, abrir la confirmacion secundaria.
 * - Ejecutar la segunda mutacion con force=true solo para esos huecos.
 *
 * Notas de mantenimiento: reglas en @nexia/shared (sessionReplication.ts) y copy en
 * replicateSessionPresentation.ts. Las sesiones entrenadas nunca se ofrecen para
 * sustituir (D-REP-1).
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import { useState, useMemo, useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
    buildSessionReplicationWeekOptions,
    partitionReplicationSkips,
    useReplicateTrainingSessionMutation,
    useGetPeriodBlockQuery,
} from "@nexia/shared";
import { useToast } from "@/components/ui/feedback";

import {
    EMPTY_REPLICATE_CONFLICT_OUTCOME,
    buildReplicateOutcomeMessage,
    formatReplicationDate,
    type ReplicateConflictOutcome,
} from "./replicateSessionPresentation";

interface SessionInfo {
    id: number;
    session_date: string | null;
    session_name: string;
    training_plan_id: number | null;
    period_block_id: number | null;
}

interface WeekOption {
    ordinal: number;
    label: string;
    date: string;
}

export function useReplicateSessionFlow(session: SessionInfo) {
    const { showSuccess, showError } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [isConflictOpen, setIsConflictOpen] = useState(false);
    const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
    const [conflictOutcome, setConflictOutcome] = useState<ReplicateConflictOutcome>(
        EMPTY_REPLICATE_CONFLICT_OUTCOME
    );

    const blockQueryArg =
        session.training_plan_id && session.period_block_id
            ? { planId: session.training_plan_id, blockId: session.period_block_id }
            : skipToken;

    const { data: block, isLoading: isBlockLoading } = useGetPeriodBlockQuery(blockQueryArg);

    const [replicate, { isLoading: isReplicating }] = useReplicateTrainingSessionMutation();

    const weeks: WeekOption[] = useMemo(() => {
        if (!block || !session.session_date) return [];
        return buildSessionReplicationWeekOptions({
            blockStartISO: block.start_date,
            blockEndISO: block.end_date,
            sessionDateISO: session.session_date,
        }).map((option) => ({
            ordinal: option.ordinal,
            label: `Semana ${option.ordinal}`,
            date: formatReplicationDate(option.targetDate),
        }));
    }, [block, session.session_date]);

    const openModal = useCallback(() => {
        setSelectedWeeks(weeks.map((w) => w.ordinal));
        setIsOpen(true);
    }, [weeks]);

    const handleReplicate = useCallback(async () => {
        try {
            const result = await replicate({
                sessionId: session.id,
                body: { target_week_ordinals: selectedWeeks, force: false },
            }).unwrap();
            const skips = partitionReplicationSkips(result.conflicts_skipped);

            setIsOpen(false);
            if (skips.replaceable.length > 0) {
                setConflictOutcome({
                    createdCount: result.count,
                    replaceable: skips.replaceable,
                    protectedItems: skips.protectedItems,
                });
                setIsConflictOpen(true);
                return;
            }
            showSuccess(buildReplicateOutcomeMessage(result.count, skips, "replicate"));
        } catch {
            showError("No se pudieron replicar las sesiones. Intenta de nuevo.");
        }
    }, [replicate, session.id, selectedWeeks, showSuccess, showError]);

    const resetConflicts = useCallback(() => {
        setIsConflictOpen(false);
        setConflictOutcome(EMPTY_REPLICATE_CONFLICT_OUTCOME);
    }, []);

    const handleConfirmReplace = useCallback(async () => {
        try {
            const ordinals = conflictOutcome.replaceable.map((c) => c.week_ordinal);
            const result = await replicate({
                sessionId: session.id,
                body: { target_week_ordinals: ordinals, force: true },
            }).unwrap();
            const skips = partitionReplicationSkips(result.conflicts_skipped);
            resetConflicts();
            showSuccess(buildReplicateOutcomeMessage(result.count, skips, "replace"));
        } catch {
            showError("No se pudieron sustituir las sesiones. Intenta de nuevo.");
        }
    }, [replicate, session.id, conflictOutcome, resetConflicts, showSuccess, showError]);

    const toggleWeek = useCallback((ordinal: number) => {
        setSelectedWeeks((prev) =>
            prev.includes(ordinal) ? prev.filter((o) => o !== ordinal) : [...prev, ordinal]
        );
    }, []);

    return {
        isOpen,
        setIsOpen,
        isConflictOpen,
        weeks,
        selectedWeeks,
        toggleWeek,
        isBlockLoading,
        isReplicating,
        openModal,
        handleReplicate,
        handleConfirmReplace,
        handleCancelConflict: resetConflicts,
        conflictOutcome,
        hasBlock: !!block,
    };
}
