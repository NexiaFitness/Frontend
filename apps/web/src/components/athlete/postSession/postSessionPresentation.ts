/**
 * postSessionPresentation.ts — Tokens visuales celebración post-sesión (F3d + §6.7 glass).
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_SECTION_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import type { PostSessionCelebrationVariant } from "@nexia/shared/utils/athlete/athletePostSessionAiInsight";

export interface PostSessionCelebrationStyle {
    heroContainer: string;
    heroGlow: string;
    ringStroke: string;
    ringTrack: string;
    pctClass: string;
    badgeClass: string;
    headlineClass: string;
    sublineClass: string;
}

const HERO_GLASS = NEXIA_GLASS_CARD;

export const POST_SESSION_CELEBRATION_STYLES: Record<
    PostSessionCelebrationVariant,
    PostSessionCelebrationStyle
> = {
    full: {
        heroContainer: cn(HERO_GLASS, "border-primary/20"),
        heroGlow: "bg-primary/10",
        ringStroke: "stroke-primary",
        ringTrack: "stroke-muted/25",
        pctClass: "text-primary",
        badgeClass: "border-primary/30 bg-primary/10 text-primary",
        headlineClass: "text-foreground",
        sublineClass: "text-muted-foreground",
    },
    partial: {
        heroContainer: cn(HERO_GLASS, "border-warning/25"),
        heroGlow: "bg-warning/8",
        ringStroke: "stroke-warning",
        ringTrack: "stroke-muted/25",
        pctClass: "text-warning",
        badgeClass: "border-warning/30 bg-warning/10 text-warning",
        headlineClass: "text-foreground",
        sublineClass: "text-muted-foreground",
    },
    week_closed: {
        heroContainer: cn(HERO_GLASS, "border-success/25"),
        heroGlow: "bg-success/8",
        ringStroke: "stroke-success",
        ringTrack: "stroke-muted/25",
        pctClass: "text-success",
        badgeClass: "border-success/30 bg-success/10 text-success",
        headlineClass: "text-foreground",
        sublineClass: "text-muted-foreground",
    },
    record: {
        heroContainer: cn(HERO_GLASS, "border-primary/25"),
        heroGlow: "bg-primary/12",
        ringStroke: "stroke-primary",
        ringTrack: "stroke-muted/25",
        pctClass: "text-primary",
        badgeClass: "border-primary/30 bg-primary/10 text-primary",
        headlineClass: "text-foreground",
        sublineClass: "text-muted-foreground",
    },
};

export const POST_SESSION_AI_INSIGHT_STYLE = {
    container: cn(NEXIA_GLASS_CARD, "px-4 py-4"),
    titleClass: ATHLETE_SECTION_LABEL,
    bodyClass: "text-sm leading-relaxed text-foreground/90",
    footnoteClass: "text-caption text-muted-foreground/80",
};

export const POST_SESSION_EXERCISES_LIST = NEXIA_GLASS_CARD;

export const POST_SESSION_HIGHLIGHT_ITEM = cn(
    NEXIA_GLASS_CARD,
    "flex items-start gap-2.5 px-3.5 py-3 text-sm"
);
