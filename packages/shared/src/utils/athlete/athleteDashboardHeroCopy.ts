/**
 * athleteDashboardHeroCopy.ts — Modelo hero dashboard atleta V01 (F3b-FE-04).
 * Copy + tono semántico + CTA + meta. Sin DOM ni estilos (agent.md §5).
 */

import type { TrainingSession } from "../../types/trainingSessions";
import type { AthleteDashboardMode } from "./athleteDashboardMode";
import { dailyCopySeed, pickFromPool } from "./athleteCopyPools";
import {
    computeDaysUntilSession,
    formatAthleteDateLong,
    formatWeekdayForSession,
    formatWeekdayLong,
    getTrainingGoalLabel,
} from "./athleteSessionUtils";

export interface AthleteDashboardCopyContext {
    mode: AthleteDashboardMode;
    today?: Date;
    todaySession?: TrainingSession;
    nextSession?: TrainingSession;
    hasActivePlan: boolean;
    copySeed?: string;
    clientId?: number;
}

export interface DashboardHeaderCopy {
    subtitle: string;
}

/** Tono semántico — la capa web mapea a tokens visuales. */
export type SessionHeroTone =
    | "active"
    | "anticipation"
    | "prepare"
    | "neutral"
    | "success"
    | "celebration"
    | "recovery"
    | "empty";

export type SessionHeroCtaAction =
    | "start"
    | "preview"
    | "summary"
    | "progress"
    | "account"
    | "sessions";

export interface SessionHeroCta {
    label: string;
    action: SessionHeroCtaAction;
}

export interface SessionHeroMeta {
    durationMin: number | null;
    sessionType: string | null;
    proximityLabel: string | null;
}

export type SessionHeroVariant = "training" | "rest" | "no-plan" | "completed";

export interface SessionHeroCopy {
    badge: string | null;
    headline: string;
    subline: string | null;
    variant: SessionHeroVariant;
    tone: SessionHeroTone;
    cta: SessionHeroCta | null;
    targetSessionId: number | null;
    meta: SessionHeroMeta | null;
}

function resolveSeed(ctx: AthleteDashboardCopyContext): string {
    return ctx.copySeed ?? dailyCopySeed(ctx.today, ctx.clientId);
}

function buildProximityBadge(daysUntil: number, weekday: string): string {
    if (daysUntil === 1) return "Mañana";
    if (daysUntil === 2) return "Sesión en 2 días";
    if (daysUntil === 3) return "Sesión en 3 días";
    if (daysUntil > 3) return "En el radar";
    return weekday;
}

function buildProximityLabel(daysUntil: number): string | null {
    if (daysUntil <= 0) return null;
    if (daysUntil === 1) return "Mañana";
    return `Quedan ${daysUntil} días`;
}

function buildSessionDetailLine(
    session: TrainingSession,
    daysUntil?: number
): string {
    const parts: string[] = [];
    const name = session.session_name?.trim();
    if (name) parts.push(name);

    if (session.planned_duration != null) {
        parts.push(`${session.planned_duration} min`);
    }
    if (session.session_type) {
        parts.push(getTrainingGoalLabel(session.session_type));
    }

    if (parts.length > 0) return parts.join(" · ");

    return formatAthleteDateLong(session.session_date ?? "");
}

function buildSessionMeta(
    session: TrainingSession,
    daysUntil?: number
): SessionHeroMeta {
    return {
        durationMin: session.planned_duration ?? null,
        sessionType: session.session_type ?? null,
        proximityLabel:
            daysUntil != null ? buildProximityLabel(daysUntil) : null,
    };
}

function previewCtaLabel(session: TrainingSession, daysUntil: number): string {
    const weekday = formatWeekdayForSession(session.session_date ?? "").toLowerCase();
    if (daysUntil === 1) return "Ver sesión de mañana";
    if (daysUntil >= 2 && daysUntil <= 3) return `Ver sesión del ${weekday}`;
    return "Ver próxima sesión";
}

export function buildDashboardHeaderCopy(ctx: AthleteDashboardCopyContext): DashboardHeaderCopy {
    const today = ctx.today ?? new Date();
    const weekday = formatWeekdayLong(today);

    switch (ctx.mode) {
        case "no_plan":
            return { subtitle: "Tu espacio de entrenamiento" };
        case "train_today":
            return { subtitle: `${weekday} · sesión de hoy` };
        case "train_today_done":
            return { subtitle: `${weekday} · sesión hecha` };
        case "week_done":
            return { subtitle: `${weekday} · semana cerrada` };
        case "week_recovery":
            return { subtitle: `${weekday} · semana de recuperación` };
        case "rest_tomorrow":
            return { subtitle: `${weekday} · descanso activo` };
        case "rest_near":
            return { subtitle: `${weekday} · preparando la siguiente` };
        case "rest_far":
        case "week_partial":
        default:
            return { subtitle: `${weekday} · semana en marcha` };
    }
}

function buildRestHeroCopy(
    mode: AthleteDashboardMode,
    nextSession: TrainingSession | undefined,
    seed: string,
    today: Date
): SessionHeroCopy {
    if (!nextSession?.session_date) {
        return {
            badge: null,
            headline: "Semana tranquila por ahora",
            subline: "Cuando tu entrenador programe la siguiente sesión, la verás aquí.",
            variant: "rest",
            tone: "neutral",
            cta: { label: "Ver mis sesiones", action: "sessions" },
            targetSessionId: null,
            meta: null,
        };
    }

    const daysUntil = computeDaysUntilSession(nextSession.session_date, today);
    const weekday = formatWeekdayForSession(nextSession.session_date);
    const detailLine = buildSessionDetailLine(nextSession, daysUntil);
    const meta = buildSessionMeta(nextSession, daysUntil);
    const previewCta: SessionHeroCta = {
        label: previewCtaLabel(nextSession, daysUntil),
        action: "preview",
    };

    if (mode === "rest_tomorrow") {
        return {
            badge: buildProximityBadge(daysUntil, weekday),
            headline: pickFromPool("hero_rest_tomorrow", seed),
            subline: detailLine,
            variant: "rest",
            tone: "anticipation",
            cta: previewCta,
            targetSessionId: nextSession.id,
            meta,
        };
    }

    if (mode === "rest_near") {
        return {
            badge: buildProximityBadge(daysUntil, weekday),
            headline: pickFromPool("hero_rest_near", seed, {
                weekday: weekday.toLowerCase(),
            }),
            subline: detailLine,
            variant: "rest",
            tone: "prepare",
            cta: previewCta,
            targetSessionId: nextSession.id,
            meta,
        };
    }

    return {
        badge: buildProximityBadge(daysUntil, weekday),
        headline: pickFromPool("hero_rest_far", seed),
        subline: detailLine,
        variant: "rest",
        tone: "neutral",
        cta: previewCta,
        targetSessionId: nextSession.id,
        meta,
    };
}

export function buildSessionHeroCopy(ctx: AthleteDashboardCopyContext): SessionHeroCopy {
    const seed = resolveSeed(ctx);
    const today = ctx.today ?? new Date();

    if (!ctx.hasActivePlan || ctx.mode === "no_plan") {
        return {
            badge: null,
            headline: "Tu plan está en camino",
            subline: "Tu entrenador preparará tu programación. Mientras tanto, revisa tu perfil o escríbele.",
            variant: "no-plan",
            tone: "empty",
            cta: { label: "Ver mi cuenta", action: "account" },
            targetSessionId: null,
            meta: null,
        };
    }

    if (ctx.mode === "week_done") {
        return {
            badge: "Semana",
            headline: pickFromPool("hero_week_done", seed),
            subline: "Objetivo cumplido. Descansa y vuelve con ganas la próxima semana.",
            variant: "rest",
            tone: "celebration",
            cta: { label: "Ver mi progreso", action: "progress" },
            targetSessionId: null,
            meta: null,
        };
    }

    if (ctx.mode === "week_recovery") {
        return {
            badge: "Recuperación",
            headline: "Semana de descanso",
            subline: "Aprovecha para recargar. Tu entrenador ajustará la carga cuando toque.",
            variant: "rest",
            tone: "recovery",
            cta: { label: "Ver calendario", action: "sessions" },
            targetSessionId: null,
            meta: null,
        };
    }

    const todaySession = ctx.todaySession;

    if (ctx.mode === "train_today_done" && todaySession) {
        const name = todaySession.session_name?.trim() || "Sesión de hoy";
        const detailLine = buildSessionDetailLine(todaySession);
        return {
            badge: "Hecho",
            headline: pickFromPool("hero_train_done", seed),
            subline: detailLine || name,
            variant: "completed",
            tone: "success",
            cta: { label: "Ver cómo fue", action: "summary" },
            targetSessionId: todaySession.id,
            meta: buildSessionMeta(todaySession),
        };
    }

    if (ctx.mode === "train_today" && todaySession) {
        const name = todaySession.session_name?.trim() || "Sesión de hoy";
        const detailLine = buildSessionDetailLine(todaySession, 0);
        return {
            badge: "Hoy",
            headline: name,
            subline: pickFromPool("hero_train_today", seed),
            variant: "training",
            tone: "active",
            cta: { label: "Empezar sesión", action: "start" },
            targetSessionId: todaySession.id,
            meta: buildSessionMeta(todaySession, 0),
        };
    }

    return buildRestHeroCopy(ctx.mode, ctx.nextSession, seed, today);
}
