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
}

export const SessionTodayCard: React.FC<SessionTodayCardProps> = ({
    session,
    hero,
    planProgressPercent,
    onCta,
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

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border p-4",
                style.container,
                hero.cta ? "space-y-4" : "space-y-2"
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

            {style.showProgressBar && progressLabel && (
                <div className="relative space-y-1">
                    <div className="flex justify-between text-caption text-muted-foreground">
                        <span>Progreso del plan</span>
                        <span>{progressLabel}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{
                                width: `${Math.min(100, planProgressPercent ?? 0)}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            {hero.cta && (
                <Button
                    variant={style.ctaVariant}
                    className={cn(
                        "relative min-h-touch-athlete w-full gap-2 font-semibold",
                        style.ctaVariant === "primary" && "text-base",
                        style.ctaClass
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
