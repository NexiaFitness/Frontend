/**
 * useReplicateSessionFlow.ts — Hook que orquesta el flujo completo de replicar sesion.
 *
 * Responsabilidades:
 * - Cargar el bloque de periodizacion asociado a la sesion.
 * - Calcular las semanas disponibles para replicacion (excluyendo la origen).
 * - Gestionar seleccion de semanas destino.
 * - Ejecutar la primera mutacion con force=false.
 * - Si hay conflictos, abrir modal de confirmacion secundaria.
 * - Ejecutar la segunda mutacion con force=true y ordinales de conflictos.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import { useState, useMemo, useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
    useReplicateTrainingSessionMutation,
    useGetPeriodBlockQuery,
} from "@nexia/shared";
import type { SkippedConflictItem } from "@nexia/shared/types/trainingSessions";
import { useToast } from "@/components/ui/feedback";

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
    const [pendingConflicts, setPendingConflicts] = useState<SkippedConflictItem[]>([]);
    const [createdCount, setCreatedCount] = useState(0);

    const blockQueryArg =
        session.training_plan_id && session.period_block_id
            ? { planId: session.training_plan_id, blockId: session.period_block_id }
            : skipToken;

    const { data: block, isLoading: isBlockLoading } = useGetPeriodBlockQuery(blockQueryArg);

    const [replicate, { isLoading: isReplicating }] = useReplicateTrainingSessionMutation();

    const weeks: WeekOption[] = useMemo(() => {
        if (!block || !session.session_date) return [];

        const start = new Date(block.start_date);
        const end = new Date(block.end_date);
        const originDate = new Date(session.session_date);

        const daysSinceStart = Math.floor(
            (originDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        const originOrdinal = Math.floor(daysSinceStart / 7) + 1;

        const blockDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(blockDays / 7) + 1;

        const options: WeekOption[] = [];
        for (let o = 1; o <= totalWeeks; o++) {
            if (o === originOrdinal) continue;
            const monday = new Date(start);
            monday.setDate(start.getDate() + (o - 1) * 7);
            const dateStr = monday.toISOString().split("T")[0];
            options.push({
                ordinal: o,
                label: `Semana ${o}`,
                date: dateStr,
            });
        }
        return options;
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

            if (result.conflicts_skipped.length > 0) {
                setCreatedCount(result.count);
                setPendingConflicts(result.conflicts_skipped);
                setIsOpen(false);
                setIsConflictOpen(true);
            } else {
                setIsOpen(false);
                showSuccess(`${result.count} sesiones replicadas correctamente.`);
            }
        } catch {
            showError("No se pudieron replicar las sesiones. Intenta de nuevo.");
        }
    }, [replicate, session.id, selectedWeeks, showSuccess, showError]);

    const handleConfirmReplace = useCallback(async () => {
        try {
            const ordinals = pendingConflicts.map((c) => c.week_ordinal);
            const result = await replicate({
                sessionId: session.id,
                body: { target_week_ordinals: ordinals, force: true },
            }).unwrap();
            setIsConflictOpen(false);
            setPendingConflicts([]);
            showSuccess(`${result.count} sesiones reemplazadas correctamente.`);
        } catch {
            showError("No se pudieron reemplazar las sesiones. Intenta de nuevo.");
        }
    }, [replicate, session.id, pendingConflicts, showSuccess, showError]);

    const handleCancelConflict = useCallback(() => {
        setIsConflictOpen(false);
        setPendingConflicts([]);
    }, []);

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
        handleCancelConflict,
        pendingConflicts,
        createdCount,
        hasBlock: !!block,
    };
}
