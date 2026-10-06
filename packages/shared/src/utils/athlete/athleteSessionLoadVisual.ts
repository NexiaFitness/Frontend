/**
 * athleteSessionLoadVisual.ts — CARGA-1 tiers (volumen × intensidad), sin texto técnico en UI.
 */

export type AthleteLoadTier = "low" | "medium" | "high";

export interface AthleteSessionLoadVisualModel {
    volumeTier: AthleteLoadTier;
    intensityTier: AthleteLoadTier;
    volumeLabel: string;
    intensityLabel: string;
    ariaLabel: string;
    sessionCount: number;
}

const TIER_LABEL: Record<AthleteLoadTier, string> = {
    low: "baja",
    medium: "media",
    high: "alta",
};

export function loadTierFrom1to10(value: number | null | undefined): AthleteLoadTier {
    if (value == null || !Number.isFinite(value) || value <= 0) return "medium";
    const v = Math.round(value);
    if (v <= 3) return "low";
    if (v <= 7) return "medium";
    return "high";
}

export function buildSessionLoadVisualModel(input: {
    plannedVolume: number | null | undefined;
    plannedIntensity: number | null | undefined;
    sessionCount?: number;
}): AthleteSessionLoadVisualModel {
    const volumeTier = loadTierFrom1to10(input.plannedVolume);
    const intensityTier = loadTierFrom1to10(input.plannedIntensity);
    const sessionCount = Math.max(1, input.sessionCount ?? 1);
    const volumeLabel = TIER_LABEL[volumeTier];
    const intensityLabel = TIER_LABEL[intensityTier];
    const countSuffix = sessionCount > 1 ? `, ${sessionCount} sesiones` : "";
    return {
        volumeTier,
        intensityTier,
        volumeLabel,
        intensityLabel,
        ariaLabel: `Carga ${volumeLabel}, intensidad ${intensityLabel}${countSuffix}`,
        sessionCount,
    };
}

export function aggregateDayLoadFromSessions(
    sessions: Array<{ planned_volume?: number | null; planned_intensity?: number | null }>
): AthleteSessionLoadVisualModel {
    if (sessions.length === 0) {
        return buildSessionLoadVisualModel({
            plannedVolume: null,
            plannedIntensity: null,
            sessionCount: 0,
        });
    }
    const avg = (key: "planned_volume" | "planned_intensity") => {
        const values = sessions
            .map((s) => s[key])
            .filter((v): v is number => v != null && Number.isFinite(v));
        if (values.length === 0) return null;
        return values.reduce((a, b) => a + b, 0) / values.length;
    };
    return buildSessionLoadVisualModel({
        plannedVolume: avg("planned_volume"),
        plannedIntensity: avg("planned_intensity"),
        sessionCount: sessions.length,
    });
}
