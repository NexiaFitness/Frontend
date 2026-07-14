/**
 * SessionTodayCard.tsx — Hero sesión / preparación / celebración (F3b-FE-04).
 * Presentacional: tono y CTA vienen del modelo shared.
 */

import React from "react";
import {
    ArrowRight,
    Clock,
    Dumbbell,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import { cn } from "@/lib/utils";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import type {
    SessionHeroCopy,
    SessionHeroCtaAction,
} from "@nexia/shared/utils/athlete/athleteDashboardHeroCopy";
import { SESSION_HERO_TONE_STYLES } from "@/components/athlete/sessionHeroPresentation";

export interface SessionTodayCardProps {
    session: TrainingSession | undefined;
    hero: SessionHeroCopy;
    planProgressPercent: number | null;
    onCta: (action: SessionHeroCtaAction, sessionId: number | null) => void;
    /** Móvil: el footer sticky ya muestra «Empezar sesión» — evitar CTA duplicado en card. */
    hideStartCtaOnMobile?: boolean;
}

export const SessionTodayCard: React.FC<SessionTodayCardProps> = ({
    session,
    hero,
    planProgressPercent,
    onCta,
    hideStartCtaOnMobile = false,
}) => {
    const style = SESSION_HERO_TONE_STYLES[hero.tone];
    const progressLabel =
        planProgressPercent != null ? `${Math.round(planProgressPercent)}% del plan` : null;

    const handleCta = () => {
        if (!hero.cta) return;
        onCta(hero.cta.action, hero.targetSessionId);
    };

    const showSessionMeta =
        style.showMetaRow &&
        session &&
        (session.planned_duration != null || session.session_type);

    const suppressStartCtaMobile =
        hideStartCtaOnMobile && hero.cta?.action === "start";

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border p-4",
                style.container,
                hero.cta
                    ? cn("space-y-4", suppressStartCtaMobile && "max-lg:space-y-3")
                    : "space-y-2"
            )}
        >
            <div
                className={cn(
                    "pointer-events-none absolute -right-6 -top-6 size-28 rounded-full blur-2xl",
                    style.glow,
                    hero.tone === "active" && "motion-safe:animate-pulse motion-reduce:animate-none"
                )}
                aria-hidden
            />

            <div className="relative space-y-2">
                {hero.badge && (
                    <Badge
                        variant={style.badgeVariant}
                        className={style.badgeClass}
                    >
                        {hero.badge}
                    </Badge>
                )}
                <h2
                    className={cn(
                        "font-bold leading-snug text-foreground",
                        style.headlineClass
                    )}
                >
                    {hero.headline}
                </h2>
                {hero.subline && (
                    <p
                        className={cn(
                            "text-sm leading-relaxed",
                            style.sublineClass
                        )}
                    >
                        {hero.subline}
                    </p>
                )}
            </div>

            {showSessionMeta && (
                <div className="relative flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {session.planned_duration != null && (
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-4 text-primary" aria-hidden />
                            {session.planned_duration} min
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <Dumbbell className="size-4 text-primary" aria-hidden />
                        {session.session_type}
                    </span>
                </div>
            )}

            {style.showProgressBar && progressLabel && planProgressPercent != null && (
                <div className="relative space-y-1.5">
                    <div className="flex justify-between text-caption text-muted-foreground">
                        <span>Progreso del plan</span>
                        <span className="tabular-nums">{progressLabel}</span>
                    </div>
                    <AthleteProgressBar
                        value={planProgressPercent}
                        tone="primary"
                        aria-label={`Progreso del plan ${Math.round(planProgressPercent)} por ciento`}
                    />
                </div>
            )}

            {hero.cta && (
                <Button
                    variant={style.ctaVariant}
                    className={cn(
                        "relative w-full gap-2 font-semibold",
                        style.ctaVariant === "primary"
                            ? ATHLETE_PRIMARY_CTA
                            : cn("min-h-touch-athlete", style.ctaClass),
                        suppressStartCtaMobile && "max-lg:hidden"
                    )}
                    onClick={handleCta}
                >
                    {hero.cta.label}
                    {hero.cta.action === "start" && (
                        <ArrowRight className="size-4 shrink-0" aria-hidden />
                    )}
                </Button>
            )}
        </div>
    );
};
