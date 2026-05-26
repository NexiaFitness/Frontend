/**
 * useSessionVolumeIntensityPrefill.ts — Prefill volumen/intensidad sesión (bloque → perfil)
 *
 * Contexto:
 * - Combina GET /training-sessions/recommendations y GET /training-plans/recommendations
 * - Expone valores resueltos para sliders en Create/Edit Session
 *
 * @author Frontend Team
 * @since Fase E volumen/intensidad unificado
 */

import { useMemo } from "react";
import { useGetTrainingPlanRecommendationsQuery } from "../../api/trainingPlansApi";
import { useGetSessionRecommendationsQuery } from "../../api/trainingSessionsApi";
import {
    resolveSessionVolumeIntensityPrefill,
    type SessionVolumeIntensityBlockReference,
    type SessionVolumeIntensityPrefillSource,
} from "../../training/sessionVolumeIntensityPrefill";
import type { SessionRecommendationsResponse } from "../../types/sessionRecommendations";
import type { TrainingPlanRecommendationsResponse } from "../../types/trainingRecommendations";

export interface UseSessionVolumeIntensityPrefillParams {
    clientId: number | null | undefined;
    sessionDate: string;
    trainerId: number;
    enabled?: boolean;
}

export interface UseSessionVolumeIntensityPrefillResult {
    volume: number;
    intensity: number;
    source: SessionVolumeIntensityPrefillSource;
    blockReference: SessionVolumeIntensityBlockReference | null;
    isLoading: boolean;
}

function extractBlockScales(
    sessionRec: SessionRecommendationsResponse | undefined
): { volume: number | null; intensity: number | null } {
    if (
        !sessionRec ||
        !("has_planned_values" in sessionRec) ||
        !sessionRec.has_planned_values ||
        !sessionRec.recommendations
    ) {
        return { volume: null, intensity: null };
    }
    const rec = sessionRec.recommendations;
    return {
        volume: rec.planned_volume_scale ?? null,
        intensity: rec.planned_intensity_scale ?? null,
    };
}

function extractOnboardingLevels(
    planRec: TrainingPlanRecommendationsResponse | undefined
): { volumeLevel: string | null; intensityLevel: string | null } {
    if (!planRec || planRec.status !== "complete" || !planRec.recommendations) {
        return { volumeLevel: null, intensityLevel: null };
    }
    return {
        volumeLevel: planRec.recommendations.volume?.level ?? null,
        intensityLevel: planRec.recommendations.intensity?.level ?? null,
    };
}

export function useSessionVolumeIntensityPrefill({
    clientId,
    sessionDate,
    trainerId,
    enabled = true,
}: UseSessionVolumeIntensityPrefillParams): UseSessionVolumeIntensityPrefillResult {
    const hasClient = enabled && !!clientId && clientId > 0;
    const hasDate = !!sessionDate;
    const hasTrainer = trainerId > 0;

    const skipSessionRec = !hasClient || !hasDate || !hasTrainer;

    const {
        data: sessionRec,
        isLoading: isLoadingSessionRec,
    } = useGetSessionRecommendationsQuery(
        {
            client_id: clientId ?? 0,
            session_date: sessionDate,
            trainer_id: trainerId,
        },
        { skip: skipSessionRec }
    );

    const {
        data: planRec,
        isLoading: isLoadingPlanRec,
    } = useGetTrainingPlanRecommendationsQuery(
        { clientId: clientId ?? 0 },
        { skip: !hasClient }
    );

    const resolved = useMemo(() => {
        const { volume, intensity } = extractBlockScales(sessionRec);
        const { volumeLevel, intensityLevel } = extractOnboardingLevels(planRec);
        return resolveSessionVolumeIntensityPrefill({
            blockVolume: volume,
            blockIntensity: intensity,
            onboardingVolumeLevel: volumeLevel,
            onboardingIntensityLevel: intensityLevel,
        });
    }, [sessionRec, planRec]);

    const isLoading =
        (hasClient && hasDate && hasTrainer && isLoadingSessionRec) ||
        (hasClient && isLoadingPlanRec);

    return {
        ...resolved,
        isLoading,
    };
}
