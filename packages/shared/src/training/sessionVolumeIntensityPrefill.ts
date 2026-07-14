/**
 * sessionVolumeIntensityPrefill.ts — Resolución volumen/intensidad para sliders de sesión
 *
 * Contexto:
 * - Prioridad: bloque activo (periodización) → perfil onboarding → default 5/5
 * - Usado por CreateSession y EditSession vía useSessionVolumeIntensityPrefill
 *
 * @author Frontend Team
 * @since Fase E volumen/intensidad unificado
 */

export type SessionVolumeIntensityPrefillSource = "block" | "profile" | "default";

const ONBOARDING_LEVEL_TO_SLIDER: Record<string, number> = {
    low: 3,
    Low: 3,
    medium: 6,
    Medium: 6,
    high: 8,
    High: 8,
};

export interface SessionVolumeIntensityBlockReference {
    volume: number;
    intensity: number;
}

export interface ResolveSessionVolumeIntensityPrefillInput {
    blockVolume: number | null | undefined;
    blockIntensity: number | null | undefined;
    onboardingVolumeLevel: string | null | undefined;
    onboardingIntensityLevel: string | null | undefined;
    defaults?: { volume: number; intensity: number };
}

export interface SessionVolumeIntensityPrefillResult {
    volume: number;
    intensity: number;
    source: SessionVolumeIntensityPrefillSource;
    blockReference: SessionVolumeIntensityBlockReference | null;
}

/** Escala entera 1–10 para sliders de sesión. */
export function clampVolumeIntensitySlider(value: number): number {
    if (Number.isNaN(value)) return 5;
    return Math.min(10, Math.max(1, Math.round(value)));
}

/** Mapeo motor Nexia (low/medium/high) → slider 1–10. */
export function onboardingLevelToSlider(level: string | null | undefined): number | null {
    if (!level) return null;
    const mapped = ONBOARDING_LEVEL_TO_SLIDER[level];
    return mapped != null ? mapped : null;
}

export function getVolumeIntensityPrefillSourceLabel(
    source: SessionVolumeIntensityPrefillSource
): string | undefined {
    switch (source) {
        case "block":
            return "Del bloque";
        case "profile":
            return "Del perfil";
        default:
            return undefined;
    }
}

export function resolveSessionVolumeIntensityPrefill(
    input: ResolveSessionVolumeIntensityPrefillInput
): SessionVolumeIntensityPrefillResult {
    const defaults = input.defaults ?? { volume: 5, intensity: 5 };

    const blockVol = input.blockVolume;
    const blockInt = input.blockIntensity;
    const hasBlock =
        blockVol != null &&
        blockInt != null &&
        !Number.isNaN(Number(blockVol)) &&
        !Number.isNaN(Number(blockInt));

    if (hasBlock) {
        const volume = clampVolumeIntensitySlider(Number(blockVol));
        const intensity = clampVolumeIntensitySlider(Number(blockInt));
        return {
            volume,
            intensity,
            source: "block",
            blockReference: { volume, intensity },
        };
    }

    const volFromProfile = onboardingLevelToSlider(input.onboardingVolumeLevel);
    const intFromProfile = onboardingLevelToSlider(input.onboardingIntensityLevel);

    if (volFromProfile != null || intFromProfile != null) {
        return {
            volume: volFromProfile ?? defaults.volume,
            intensity: intFromProfile ?? defaults.intensity,
            source: "profile",
            blockReference: null,
        };
    }

    return {
        volume: defaults.volume,
        intensity: defaults.intensity,
        source: "default",
        blockReference: null,
    };
}
