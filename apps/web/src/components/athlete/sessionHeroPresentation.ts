/**
 * sessionHeroPresentation.ts — Tokens visuales del hero (solo web, agent.md §6).
 */

import type { BadgeVariant } from "@/components/ui/Badge";
import type { SessionHeroTone } from "@nexia/shared/utils/athlete/athleteDashboardHeroCopy";

export interface SessionHeroToneStyle {
    container: string;
    glow: string;
    badgeVariant: BadgeVariant;
    badgeClass: string;
    headlineClass: string;
    sublineClass: string;
    ctaVariant: "primary" | "secondary" | "outline";
    ctaClass: string;
    showMetaRow: boolean;
    showProgressBar: boolean;
}

export const SESSION_HERO_TONE_STYLES: Record<SessionHeroTone, SessionHeroToneStyle> = {
    active: {
        container:
            "border-primary/50 bg-gradient-to-br from-primary/20 via-[#0c1829] to-card shadow-[0_8px_28px_-14px] shadow-primary/40",
        glow: "bg-primary/25",
        badgeVariant: "default",
        badgeClass: "",
        headlineClass: "text-xl",
        sublineClass: "text-muted-foreground",
        ctaVariant: "primary",
        ctaClass: "shadow-lg shadow-primary/25",
        showMetaRow: true,
        showProgressBar: true,
    },
    anticipation: {
        container:
            "border-[#1e3a5f] bg-gradient-to-br from-[#0d1a2e] via-[#101c32] to-[#0a0f18]",
        glow: "bg-sky-500/20",
        badgeVariant: "secondary",
        badgeClass:
            "border border-sky-400/30 bg-sky-500/15 text-sky-200 ring-0 hover:bg-sky-500/20",
        headlineClass: "text-lg",
        sublineClass: "text-sky-100/70",
        ctaVariant: "outline",
        ctaClass:
            "border-sky-400/35 bg-sky-500/10 text-sky-100 hover:bg-sky-500/18 hover:border-sky-400/50",
        showMetaRow: false,
        showProgressBar: false,
    },
    prepare: {
        container:
            "border-violet-500/45 bg-gradient-to-br from-violet-950/50 via-[#1a1228] to-[#0a0f18]",
        glow: "bg-violet-500/22",
        badgeVariant: "secondary",
        badgeClass:
            "border border-violet-400/30 bg-violet-500/15 text-violet-200 ring-0 hover:bg-violet-500/20",
        headlineClass: "text-lg",
        sublineClass: "text-violet-100/70",
        ctaVariant: "outline",
        ctaClass:
            "border-violet-400/35 bg-violet-500/10 text-violet-100 hover:bg-violet-500/18 hover:border-violet-400/50",
        showMetaRow: false,
        showProgressBar: false,
    },
    neutral: {
        container:
            "border-border/70 bg-gradient-to-br from-card/90 via-card to-primary/5",
        glow: "bg-primary/10",
        badgeVariant: "secondary",
        badgeClass: "",
        headlineClass: "text-lg",
        sublineClass: "text-muted-foreground",
        ctaVariant: "outline",
        ctaClass: "border-border/80 bg-foreground/5 text-foreground hover:bg-foreground/8",
        showMetaRow: false,
        showProgressBar: false,
    },
    success: {
        container:
            "border-success/40 bg-gradient-to-br from-success/15 via-[#0c1a14] to-card shadow-[0_8px_24px_-14px] shadow-success/30",
        glow: "bg-success/18",
        badgeVariant: "subtle-success",
        badgeClass:
            "border border-success/30 bg-success/15 text-success ring-0",
        headlineClass: "text-lg",
        sublineClass: "text-success/80",
        ctaVariant: "outline",
        ctaClass:
            "border-success/35 bg-success/10 text-success hover:bg-success/15",
        showMetaRow: false,
        showProgressBar: false,
    },
    celebration: {
        container:
            "border-warning/35 bg-gradient-to-br from-warning/12 via-[#1a1608] to-success/5",
        glow: "bg-warning/15",
        badgeVariant: "subtle-warning",
        badgeClass:
            "border border-warning/30 bg-warning/12 text-warning ring-0",
        headlineClass: "text-lg",
        sublineClass: "text-warning/90",
        ctaVariant: "outline",
        ctaClass:
            "border-warning/35 bg-warning/10 text-warning hover:bg-warning/15",
        showMetaRow: false,
        showProgressBar: false,
    },
    recovery: {
        container:
            "border-teal-500/30 bg-gradient-to-br from-teal-950/35 via-card to-card",
        glow: "bg-teal-500/12",
        badgeVariant: "subtle-secondary",
        badgeClass:
            "border border-teal-400/25 bg-teal-500/10 text-teal-200 ring-0",
        headlineClass: "text-lg",
        sublineClass: "text-teal-100/65",
        ctaVariant: "outline",
        ctaClass:
            "border-teal-400/30 bg-teal-500/8 text-teal-100 hover:bg-teal-500/14",
        showMetaRow: false,
        showProgressBar: false,
    },
    empty: {
        container: "border-border/70 bg-card/60",
        glow: "bg-muted/20",
        badgeVariant: "outline",
        badgeClass: "",
        headlineClass: "text-lg",
        sublineClass: "text-muted-foreground",
        ctaVariant: "secondary",
        ctaClass: "",
        showMetaRow: false,
        showProgressBar: false,
    },
};
