/**
 * Referencia de volumen para periodización: capacidad cliente + objetivo por slider.
 */

import { useMemo, useCallback } from "react";
import { useGetTrainingPlanRecommendationsQuery } from "@nexia/shared/api/trainingPlansApi";
import {
    buildVolumeIntensityContext,
    type VolumeIntensityContext,
} from "@nexia/shared";
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

export interface UsePeriodizationVolumeRecommendationsResult {
    phase: PeriodizationVolumeNominalPhase;
    labelForVolumeLevel: (volumeLevel: number) => string | null;
    auxiliaryHint: string | null;
    buildContext: (volumeLevel: number, intensityLevel: number) => VolumeIntensityContext;
}

export function usePeriodizationVolumeRecommendations(
    clientId: number | undefined,
    planGoal: string | undefined | null,
    trainingFrequency: number = 3
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

    const buildContext = useCallback(
        (volumeLevel: number, intensityLevel: number) =>
            buildVolumeIntensityContext(data, volumeLevel, intensityLevel, trainingFrequency),
        [data, trainingFrequency]
    );

    const labelForVolumeLevel = useCallback(
        (volumeLevel: number): string | null => {
            return buildContext(volumeLevel, 5).result.weekly_target_label;
        },
        [buildContext]
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
            return "Completa la ficha del cliente (experiencia, frecuencia y duración de sesión) para calcular el objetivo en series.";
        }
        if (phase === "incomplete") {
            return "Referencia de volumen no disponible.";
        }
        return null;
    }, [clientId, phase, data]);

    return { phase, labelForVolumeLevel, auxiliaryHint, buildContext };
}
