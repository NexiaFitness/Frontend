/**
 * Capacidad cliente → modulación bloque → objetivo en series (sin UI).
 * Alineado con backend/app/crud/planning/volume_context.py
 */

import type { TrainingPlanRecommendationsResponse } from "../types/trainingRecommendations";
import { computeTargetWeeklySets } from "./weeklyVolumeTarget";

export interface VolumeIntensityClientCapacity {
    volume_level_es: string;
    max_sets: number;
    min_sets: number | null;
    based_on: {
        experience?: string | null;
        frequency?: number | null;
        session_duration?: string | null;
        objective?: string | null;
    };
}

export interface VolumeIntensityBlockModulation {
    volume_level: number;
    volume_level_es: string;
    intensity_level: number;
    intensity_level_es: string;
}

export interface VolumeIntensityResult {
    weekly_target_sets: number | null;
    daily_target_sets: number | null;
    weekly_target_label: string | null;
    daily_target_label: string | null;
}

export interface VolumeIntensityContext {
    client_capacity: VolumeIntensityClientCapacity | null;
    block_modulation: VolumeIntensityBlockModulation;
    result: VolumeIntensityResult;
}

export function sliderLevelLabelEs(level: number): string {
    const n = Math.round(level);
    if (n <= 2) return "Muy bajo";
    if (n <= 4) return "Bajo";
    if (n <= 6) return "Medio";
    if (n <= 8) return "Medio-alto";
    return "Alto";
}

export function computeDailyTargetSets(
    weeklyTarget: number,
    trainingFrequency: number
): number {
    const freq = Math.max(1, Math.min(7, Math.round(trainingFrequency)));
    return Math.max(1, Math.floor(weeklyTarget / freq));
}

export function buildVolumeIntensityContext(
    planRecs: TrainingPlanRecommendationsResponse | undefined,
    volumeLevel: number,
    intensityLevel: number,
    trainingFrequency: number
): VolumeIntensityContext {
    const volLevel = Math.max(1, Math.min(10, Math.round(volumeLevel)));
    const intLevel = Math.max(1, Math.min(10, Math.round(intensityLevel)));
    const freq = Math.max(1, Math.min(7, Math.round(trainingFrequency)));

    const block_modulation: VolumeIntensityBlockModulation = {
        volume_level: volLevel,
        volume_level_es: sliderLevelLabelEs(volLevel),
        intensity_level: intLevel,
        intensity_level_es: sliderLevelLabelEs(intLevel),
    };

    let client_capacity: VolumeIntensityClientCapacity | null = null;
    let weekly_target_sets: number | null = null;
    let daily_target_sets: number | null = null;

    if (planRecs?.status === "complete" && planRecs.recommendations) {
        const vol = planRecs.recommendations.volume;
        const based = planRecs.based_on;
        const maxSets = vol.max_sets;
        if (Number.isInteger(maxSets) && maxSets >= 1) {
            weekly_target_sets = computeTargetWeeklySets(maxSets, volLevel);
            if (weekly_target_sets != null) {
                daily_target_sets = computeDailyTargetSets(weekly_target_sets, freq);
            }
            client_capacity = {
                volume_level_es: vol.level_es ?? vol.level,
                max_sets: maxSets,
                min_sets:
                    typeof vol.min_sets === "number" && Number.isFinite(vol.min_sets)
                        ? vol.min_sets
                        : null,
                based_on: {
                    experience: based?.experience ?? null,
                    frequency: based?.training_frequency ?? null,
                    session_duration: based?.session_duration ?? null,
                    objective: based?.objective ?? null,
                },
            };
        }
    }

    const result: VolumeIntensityResult = {
        weekly_target_sets,
        daily_target_sets,
        weekly_target_label:
            weekly_target_sets != null
                ? `${weekly_target_sets} series por grupo muscular / semana`
                : null,
        daily_target_label:
            daily_target_sets != null
                ? `${daily_target_sets} series por día de entreno (referencia global)`
                : null,
    };

    return { client_capacity, block_modulation, result };
}
