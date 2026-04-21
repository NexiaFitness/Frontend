/**
 * usePeriodizationVolumeRecommendations.ts — Referencia nominal de volumen (series/músculo/semana) para periodización.
 *
 * Consume GET /training-plans/recommendations y la función pura computeTargetWeeklySets (shared).
 * Contexto: SPEC_TRADUCCION_VOLUMEN_SLIDER_A_SERIES_SEMANALES.md Fase 3.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { useMemo, useCallback } from "react";
import { useGetTrainingPlanRecommendationsQuery } from "@nexia/shared/api/trainingPlansApi";
import { computeTargetWeeklySets } from "@nexia/shared";
import type { TrainingPlanRecommendationsResponse } from "@nexia/shared/types/trainingRecommendations";

export type PeriodizationVolumeNominalPhase =
    | "loading"
    | "complete"
    | "incomplete"
    | "error";

function maxSetsFromCompleteResponse(data: TrainingPlanRecommendationsResponse): number | null {
    if (data.status !== "complete" || data.recommendations == null) {
        return null;
    }
    const raw = data.recommendations.volume.max_sets;
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
        return null;
    }
    const rounded = Math.round(raw);
    if (rounded < 1) {
        return null;
    }
    return rounded;
}

function labelForVolume(maxSets: number, volumeLevel: number): string | null {
    const n = computeTargetWeeklySets(maxSets, volumeLevel);
    if (n == null) {
        return null;
    }
    return `Objetivo nominal: ~${n} series por grupo muscular / semana`;
}

export interface UsePeriodizationVolumeRecommendationsResult {
    phase: PeriodizationVolumeNominalPhase;
    /** Etiqueta para el nivel de volumen indicado; null si no debe mostrarse número nominal. */
    labelForVolumeLevel: (volumeLevel: number) => string | null;
    /** Mensaje corto para estados degradados (incompleto / error), no es cifra nominal. */
    auxiliaryHint: string | null;
}

export function usePeriodizationVolumeRecommendations(
    clientId: number | undefined,
    planGoal: string | undefined | null
): UsePeriodizationVolumeRecommendationsResult {
    const goalParam = planGoal?.trim() || undefined;

    const { data, isLoading, isError } = useGetTrainingPlanRecommendationsQuery(
        { clientId: clientId!, planGoal: goalParam },
        { skip: clientId == null || clientId <= 0 }
    );

    const maxSets = useMemo(() => (data ? maxSetsFromCompleteResponse(data) : null), [data]);

    const phase = useMemo((): PeriodizationVolumeNominalPhase => {
        if (clientId == null || clientId <= 0) {
            return "incomplete";
        }
        if (isLoading) {
            return "loading";
        }
        if (isError) {
            return "error";
        }
        if (!data) {
            return "incomplete";
        }
        if (data.status === "incomplete") {
            return "incomplete";
        }
        if (data.status === "complete" && maxSets != null) {
            return "complete";
        }
        return "incomplete";
    }, [clientId, isLoading, isError, data, maxSets]);

    const labelForVolumeLevel = useCallback(
        (volumeLevel: number): string | null => {
            if (phase !== "complete" || maxSets == null) {
                return null;
            }
            return labelForVolume(maxSets, volumeLevel);
        },
        [phase, maxSets]
    );

    const auxiliaryHint = useMemo((): string | null => {
        if (clientId == null || clientId <= 0) {
            return "Asigna un cliente al plan para ver el objetivo en series.";
        }
        if (phase === "loading") {
            return null;
        }
        if (phase === "error") {
            return "No se pudo cargar la referencia de volumen. Reintenta más tarde.";
        }
        if (phase === "incomplete" && data?.status === "incomplete") {
            return "Completa la ficha del cliente para ver el objetivo nominal en series.";
        }
        if (phase === "incomplete") {
            return "Referencia de volumen no disponible.";
        }
        return null;
    }, [clientId, phase, data]);

    return { phase, labelForVolumeLevel, auxiliaryHint };
}
