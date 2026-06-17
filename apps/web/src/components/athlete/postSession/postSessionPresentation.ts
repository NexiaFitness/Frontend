/**
 * postSessionPresentation.ts — Tokens visuales celebración post-sesión (F3d-FE-01).
 * Premium sobrio: acentos mínimos, sin saturación de color.
 */

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

export const POST_SESSION_CELEBRATION_STYLES: Record<
    PostSessionCelebrationVariant,
    PostSessionCelebrationStyle
> = {
    full: {
        heroContainer:
            "border-border/80 bg-card/60 shadow-[0_4px_20px_-12px] shadow-black/25",
        heroGlow: "bg-primary/8",
        ringStroke: "stroke-primary",
        ringTrack: "stroke-muted/30",
        pctClass: "text-foreground",
        badgeClass: "border-border/70 bg-foreground/5 text-muted-foreground",
        headlineClass: "text-foreground",
        sublineClass: "text-muted-foreground",
    },
    partial: {
        heroContainer:
            "border-warning/25 bg-card/60 shadow-[0_4px_20px_-12px] shadow-black/25",
        heroGlow: "bg-warning/6",
        ringStroke: "stroke-warning",
        ringTrack: "stroke-muted/30",
        pctClass: "text-foreground",
        badgeClass: "border-warning/25 bg-warning/8 text-warning/90",
        headlineClass: "text-foreground",
        sublineClass: "text-muted-foreground",
    },
    week_closed: {
        heroContainer:
            "border-success/25 bg-card/60 shadow-[0_4px_20px_-12px] shadow-black/25",
        heroGlow: "bg-success/8",
        ringStroke: "stroke-success",
        ringTrack: "stroke-muted/30",
        pctClass: "text-foreground",
        badgeClass: "border-success/25 bg-success/8 text-success",
        headlineClass: "text-foreground",
        sublineClass: "text-muted-foreground",
    },
    record: {
        heroContainer:
            "border-border/80 bg-card/60 shadow-[0_4px_20px_-12px] shadow-black/25",
        heroGlow: "bg-primary/6",
        ringStroke: "stroke-primary",
        ringTrack: "stroke-muted/30",
        pctClass: "text-foreground",
        badgeClass: "border-border/70 bg-foreground/5 text-muted-foreground",
        headlineClass: "text-foreground",
        sublineClass: "text-muted-foreground",
    },
};

export const POST_SESSION_AI_INSIGHT_STYLE = {
    container:
        "rounded-xl border border-border/80 border-l-2 border-l-foreground/10 bg-card/40 px-4 py-4",
    titleClass: "text-caption font-medium uppercase tracking-wider text-muted-foreground",
    bodyClass: "text-sm leading-relaxed text-foreground/90",
    footnoteClass: "text-caption text-muted-foreground/80",
};
