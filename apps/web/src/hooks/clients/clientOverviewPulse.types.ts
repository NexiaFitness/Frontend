/**
 * clientOverviewPulse.types.ts — View-model del cockpit tab Resumen (UX-OVERVIEW).
 * Contexto: contrato entre useClientOverviewPulse y componentes Zona A/B/C.
 */

import type { ClientRatingOut } from "@nexia/shared/types/client";
import type { ClientLoadInsights } from "@nexia/shared/types/clientLoadInsights";
import type { HabitInsightsOut } from "@nexia/shared/types/habits";
import type { TrainingSession } from "@nexia/shared/types/training";

export type OverviewStatChipId =
    | "adherence"
    | "monotony"
    | "weight"
    | "fatigue"
    | "risk"
    | "next_session";

export type OverviewStatChipTone = "neutral" | "success" | "warning" | "destructive";

export type OverviewPulseRowKind =
    | "last_session"
    | "signal"
    | "injury"
    | "last_test"
    | "last_progress"
    | "empty";

export type OverviewRecommendationsMode = "hidden" | "incomplete" | "compact_ok";

export interface OverviewStatChip {
    id: OverviewStatChipId;
    label: string;
    value: string;
    tone: OverviewStatChipTone;
    href?: string;
    hidden?: boolean;
}

export interface OverviewPulseRow {
    id: string;
    kind: OverviewPulseRowKind;
    title: string;
    detail: string;
    href?: string;
    severity?: "info" | "warning" | "destructive";
}

export interface OverviewPlanCompact {
    kind: "none" | "active" | "multiple";
    activePlanName?: string;
    activePlanDateRange?: string;
    activePlanId?: number;
    planCount?: number;
}

export interface ClientOverviewPulseLoadingFlags {
    coherence: boolean;
    progress: boolean;
    fatigue: boolean;
    sessions: boolean;
    loadInsights: boolean;
    injuries: boolean;
    tests: boolean;
    plans: boolean;
    recommendations: boolean;
}

export interface ClientOverviewPulseViewModel {
    isLoading: boolean;
    isError: boolean;
    planCompact: OverviewPlanCompact;
    lastCompletedSession: TrainingSession | null;
    loadInsights: ClientLoadInsights | null;
    pulseRows: OverviewPulseRow[];
    hasPulseContent: boolean;
    statChips: OverviewStatChip[];
    recommendationsMode: OverviewRecommendationsMode;
    recommendationsClientId: number;
    showExpediente: boolean;
    showRelationBlock: boolean;
    habitInsights: HabitInsightsOut | null;
    lastRating: ClientRatingOut | null;
    loadingFlags: ClientOverviewPulseLoadingFlags;
    refetch: () => void;
}
