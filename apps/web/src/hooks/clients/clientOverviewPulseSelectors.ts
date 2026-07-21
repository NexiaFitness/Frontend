/**
 * clientOverviewPulseSelectors.ts — Selectores puros view-model cockpit Resumen (UX-OVERVIEW).
 */

import type { Client } from "@nexia/shared/types/client";
import type { ClientLoadInsights } from "@nexia/shared/types/clientLoadInsights";
import type { CoherenceData } from "@nexia/shared/types/coherence";
import type { ClientProgress } from "@nexia/shared/types/progress";
import type { PhysicalTestResultOut } from "@nexia/shared/types/testing";
import type {
    ActivePlanByClientOut,
    TrainingPlan,
    TrainingSession,
} from "@nexia/shared/types/training";
import type { TrainingPlanRecommendationsResponse } from "@nexia/shared/types/trainingRecommendations";
import type { RiskLevel } from "@nexia/shared/types/training";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import type { ClientRatingOut } from "@nexia/shared/types/client";
import type { HabitInsightsOut } from "@nexia/shared/types/habits";
import {
    OVERVIEW_ACTIVITY_LABELS,
    OVERVIEW_STAT_CHIP_LABELS,
    clientTabPath,
} from "@/components/clients/detail/clientOverviewPresentation";
import type {
    ClientOverviewPulseViewModel,
    OverviewPlanCompact,
    OverviewPulseRow,
    OverviewRecommendationsMode,
    OverviewStatChip,
    OverviewStatChipTone,
} from "./clientOverviewPulse.types";

const MAX_SIGNALS = 2;

export interface BuildOverviewViewModelInput {
    clientId: number;
    client?: Client | null;
    coherence?: CoherenceData | null;
    latestWeight?: number | null;
    weightChange?: number | null;
    trend?: string | null;
    avgPreFatigue?: number | null;
    avgPostFatigue?: number | null;
    currentRiskLevel?: RiskLevel | null;
    sessions?: TrainingSession[];
    loadInsights?: ClientLoadInsights | null;
    activeInjuries?: InjuryWithDetails[];
    testResults?: PhysicalTestResultOut[];
    progressHistory?: ClientProgress[];
    activePlan?: ActivePlanByClientOut | null;
    trainingPlans?: TrainingPlan[];
    recommendations?: TrainingPlanRecommendationsResponse | null;
    habitInsights?: HabitInsightsOut | null;
    ratings?: ClientRatingOut[];
    isError?: boolean;
}

function formatDateShort(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
    });
}

function formatPlanDateRange(start: string, end: string): string {
    const fmt = (d: string) =>
        new Date(d).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    return `${fmt(start)} – ${fmt(end)}`;
}

function startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

export function findUpcomingSession(
    sessions: TrainingSession[],
): TrainingSession | null {
    const today = startOfToday();
    const filtered = sessions.filter(
        (s) =>
            s.session_date &&
            new Date(s.session_date) >= today &&
            s.status !== "cancelled",
    );
    if (!filtered.length) return null;
    return [...filtered].sort(
        (a, b) =>
            new Date(a.session_date!).getTime() -
            new Date(b.session_date!).getTime(),
    )[0];
}

export function findLastCompletedSession(
    sessions: TrainingSession[],
): TrainingSession | null {
    const today = startOfToday();
    const filtered = sessions.filter(
        (s) =>
            s.status === "completed" &&
            s.session_date &&
            new Date(s.session_date) < today,
    );
    if (!filtered.length) return null;
    return [...filtered].sort(
        (a, b) =>
            new Date(b.session_date!).getTime() -
            new Date(a.session_date!).getTime(),
    )[0];
}

export function findLastTest(
    testResults: PhysicalTestResultOut[],
): PhysicalTestResultOut | null {
    if (!testResults.length) return null;
    return [...testResults].sort(
        (a, b) =>
            new Date(b.test_date).getTime() - new Date(a.test_date).getTime(),
    )[0];
}

export function findLastProgressRecord(
    progressHistory: ClientProgress[],
): ClientProgress | null {
    if (!progressHistory.length) return null;
    return [...progressHistory].sort(
        (a, b) =>
            new Date(b.fecha_registro).getTime() -
            new Date(a.fecha_registro).getTime(),
    )[0];
}

export function buildPlanCompact(
    activePlan: ActivePlanByClientOut | null | undefined,
    trainingPlans: TrainingPlan[],
): OverviewPlanCompact {
    const planCount = trainingPlans.length;
    if (!activePlan?.id) {
        return { kind: "none", planCount };
    }
    const name = activePlan.display_name ?? activePlan.name ?? "Plan activo";
    const range =
        activePlan.start_date && activePlan.end_date
            ? formatPlanDateRange(activePlan.start_date, activePlan.end_date)
            : undefined;
    if (planCount > 1) {
        return {
            kind: "multiple",
            activePlanName: name,
            activePlanDateRange: range,
            activePlanId: activePlan.id,
            planCount,
        };
    }
    return {
        kind: "active",
        activePlanName: name,
        activePlanDateRange: range,
        activePlanId: activePlan.id,
        planCount,
    };
}

function riskLabel(level: RiskLevel | null | undefined): string {
    if (!level) return "—";
    if (level === "high") return "Alto";
    if (level === "medium") return "Medio";
    return "Bajo";
}

function riskTone(level: RiskLevel | null | undefined): OverviewStatChipTone {
    if (level === "high") return "destructive";
    if (level === "medium") return "warning";
    if (level === "low") return "success";
    return "neutral";
}

function adherenceTone(pct: number): OverviewStatChipTone {
    if (pct >= 80) return "success";
    if (pct >= 60) return "warning";
    return "destructive";
}

export function buildStatChips(input: BuildOverviewViewModelInput): OverviewStatChip[] {
    const { clientId, coherence, latestWeight, weightChange, avgPreFatigue, avgPostFatigue, currentRiskLevel, sessions = [] } = input;
    const upcoming = findUpcomingSession(sessions);
    const adherence = coherence?.adherence_percentage ?? null;
    const monotony = coherence?.monotony ?? null;

    const weightValue =
        latestWeight != null
            ? weightChange != null
              ? `${latestWeight} kg (${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)})`
              : `${latestWeight} kg`
            : "—";

    const fatigueValue =
        avgPreFatigue != null && avgPostFatigue != null
            ? `${avgPreFatigue.toFixed(1)} / ${avgPostFatigue.toFixed(1)}`
            : avgPreFatigue != null
              ? avgPreFatigue.toFixed(1)
              : "—";

    const nextSessionValue =
        upcoming?.session_date != null
            ? formatDateShort(upcoming.session_date)
            : "No programada";

    return [
        {
            id: "adherence",
            label: OVERVIEW_STAT_CHIP_LABELS.adherence,
            value: adherence != null ? `${adherence.toFixed(0)}%` : "—",
            tone: adherence != null ? adherenceTone(adherence) : "neutral",
            href: clientTabPath(clientId, "daily-coherence"),
        },
        {
            id: "monotony",
            label: OVERVIEW_STAT_CHIP_LABELS.monotony,
            value: monotony != null ? monotony.toFixed(1) : "—",
            tone:
                monotony != null && monotony > 2
                    ? "warning"
                    : "neutral",
            href:
                monotony != null && monotony > 2
                    ? clientTabPath(clientId, "daily-coherence")
                    : undefined,
        },
        {
            id: "weight",
            label: OVERVIEW_STAT_CHIP_LABELS.weight,
            value: weightValue,
            tone: "neutral",
            href: clientTabPath(clientId, "progress", { subtab: "body" }),
        },
        {
            id: "fatigue",
            label: OVERVIEW_STAT_CHIP_LABELS.fatigue,
            value: fatigueValue,
            tone: "neutral",
            href: clientTabPath(clientId, "progress", { subtab: "body" }),
        },
        {
            id: "risk",
            label: OVERVIEW_STAT_CHIP_LABELS.risk,
            value: riskLabel(currentRiskLevel),
            tone: riskTone(currentRiskLevel),
            href:
                currentRiskLevel && currentRiskLevel !== "low"
                    ? clientTabPath(clientId, "progress", { subtab: "body" })
                    : undefined,
        },
        {
            id: "next_session",
            label: OVERVIEW_STAT_CHIP_LABELS.nextSession,
            value: nextSessionValue,
            tone: "neutral",
            href: clientTabPath(clientId, "sessions"),
        },
    ];
}

export function buildPulseRows(input: BuildOverviewViewModelInput): OverviewPulseRow[] {
    const {
        clientId,
        sessions = [],
        loadInsights,
    } = input;

    const rows: OverviewPulseRow[] = [];
    const lastSession = findLastCompletedSession(sessions);

    if (lastSession?.id && lastSession.session_date) {
        rows.push({
            id: `session-${lastSession.id}`,
            kind: "last_session",
            title: OVERVIEW_ACTIVITY_LABELS.lastSession,
            detail: `${lastSession.session_type || lastSession.session_name || "Sesión"} · ${formatDateShort(lastSession.session_date)}`,
            href: `/dashboard/session-programming/sessions/${lastSession.id}`,
        });
    }

    const signals = loadInsights?.signals?.slice(0, MAX_SIGNALS) ?? [];
    for (const signal of signals) {
        rows.push({
            id: `signal-${signal.signal_type}-${signal.exercise_id}`,
            kind: "signal",
            title: OVERVIEW_ACTIVITY_LABELS.signal,
            detail: `${signal.exercise_name}: ${signal.message}`,
            href: clientTabPath(clientId, "progress", { subtab: "performance" }),
            severity: signal.severity === "warning" ? "warning" : "info",
        });
    }

    if (rows.length === 0) {
        rows.push({
            id: "empty",
            kind: "empty",
            title: OVERVIEW_ACTIVITY_LABELS.emptyTitle,
            detail: OVERVIEW_ACTIVITY_LABELS.emptyDetail,
            href: clientTabPath(clientId, "sessions"),
        });
    }

    return rows;
}

export function buildRecommendationsMode(
    recommendations: TrainingPlanRecommendationsResponse | null | undefined,
): OverviewRecommendationsMode {
    if (!recommendations) return "hidden";
    if (recommendations.status === "incomplete") return "incomplete";
    if (recommendations.status === "complete") return "compact_ok";
    return "hidden";
}

export function clientHasExpedienteData(client: Client | null | undefined): boolean {
    if (!client) return false;
    return Boolean(
        client.mail ||
            client.telefono ||
            client.sexo ||
            client.id_passport ||
            client.fecha_definicion_objetivo ||
            client.descripcion_objetivos ||
            client.lesiones_relevantes ||
            hasAnthropometricProfile(client),
    );
}

function hasAnthropometricProfile(client: Client): boolean {
    return Boolean(
        client.skinfold_triceps ||
            client.skinfold_subscapular ||
            client.girth_waist_minimum ||
            client.diameter_humerus_biepicondylar,
    );
}

export function buildLastRating(
    ratings: ClientRatingOut[] | undefined,
): ClientRatingOut | null {
    if (!ratings?.length) return null;
    return [...ratings].sort(
        (a, b) =>
            new Date(b.rating_date).getTime() -
            new Date(a.rating_date).getTime(),
    )[0];
}

export function buildOverviewViewModel(
    input: BuildOverviewViewModelInput,
): Pick<
    ClientOverviewPulseViewModel,
    | "planCompact"
    | "lastCompletedSession"
    | "loadInsights"
    | "pulseRows"
    | "hasPulseContent"
    | "statChips"
    | "recommendationsMode"
    | "recommendationsClientId"
    | "showExpediente"
    | "showRelationBlock"
    | "habitInsights"
    | "lastRating"
    | "isError"
> {
    const { clientId, client, habitInsights, recommendations, ratings, sessions = [] } = input;
    const pulseRows = buildPulseRows(input);
    const hasRealPulse = pulseRows.some((r) => r.kind !== "empty");

    return {
        isError: Boolean(input.isError),
        planCompact: buildPlanCompact(input.activePlan, input.trainingPlans ?? []),
        lastCompletedSession: findLastCompletedSession(sessions),
        loadInsights: input.loadInsights ?? null,
        pulseRows,
        hasPulseContent: hasRealPulse,
        statChips: buildStatChips(input),
        recommendationsMode: buildRecommendationsMode(recommendations),
        recommendationsClientId: clientId,
        showExpediente: clientHasExpedienteData(client),
        showRelationBlock: true,
        habitInsights: habitInsights ?? null,
        lastRating: buildLastRating(ratings),
    };
}
