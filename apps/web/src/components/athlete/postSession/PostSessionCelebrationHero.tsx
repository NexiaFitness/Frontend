/**
 * PostSessionCelebrationHero.tsx — Hero celebración post-sesión (F3d-FE-01).
 */

import React from "react";
import { Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import type { PostSessionCelebrationCopy } from "@nexia/shared/utils/athlete/athletePostSessionAiInsight";
import { AthleteSurfaceAccentRim } from "@/components/athlete/AthleteSurfaceAccentRim";
import { PostSessionCompletionRing } from "./PostSessionCompletionRing";
import { POST_SESSION_CELEBRATION_STYLES } from "./postSessionPresentation";

export interface PostSessionCelebrationHeroProps {
    celebration: PostSessionCelebrationCopy;
    completionPercent: number;
    actualSets: number;
    plannedSets: number;
    canShare: boolean;
    isSharing: boolean;
    onShare: () => void;
}

export const PostSessionCelebrationHero: React.FC<PostSessionCelebrationHeroProps> = ({
    celebration,
    completionPercent,
    actualSets,
    plannedSets,
    canShare,
    isSharing,
    onShare,
}) => {
    const style = POST_SESSION_CELEBRATION_STYLES[celebration.variant];

    return (
        <div className="relative">
            <div
                className={cn(
                    "relative overflow-hidden rounded-xl border p-4 pt-5",
                    style.heroContainer
                )}
            >
                <AthleteSurfaceAccentRim />
                <div
                    className={cn(
                        "pointer-events-none absolute -right-6 -top-6 size-20 rounded-full blur-2xl",
                        style.heroGlow
                    )}
                    aria-hidden
                />

                <div className="relative space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        {celebration.badge ? (
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "border px-2 py-0.5 text-[11px] ring-0",
                                    style.badgeClass
                                )}
                            >
                                {celebration.badge}
                            </Badge>
                        ) : (
                            <span />
                        )}
                        {canShare && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="-mr-1 -mt-1 size-9 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={onShare}
                                disabled={isSharing}
                                aria-label="Compartir resumen de sesión"
                            >
                                <Share2 className="size-4" aria-hidden />
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                            <h1
                                className={cn(
                                    "text-lg font-semibold leading-snug",
                                    style.headlineClass
                                )}
                            >
                                {celebration.headline}
                            </h1>
                            {celebration.subline && (
                                <p
                                    className={cn(
                                        "text-xs leading-relaxed",
                                        style.sublineClass
                                    )}
                                >
                                    {celebration.subline}
                                </p>
                            )}
                            <p className="pt-1 text-caption text-muted-foreground">
                                <span className="font-medium tabular-nums text-foreground/90">
                                    {actualSets}
                                </span>
                                /{plannedSets} series
                            </p>
                        </div>

                        <PostSessionCompletionRing
                            percent={completionPercent}
                            strokeClass={style.ringStroke}
                            trackClass={style.ringTrack}
                            valueClass={style.pctClass}
                            size="sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
