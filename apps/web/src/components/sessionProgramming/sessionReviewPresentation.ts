/**
 * sessionReviewPresentation.ts — Revisión post guardar sesión (premium · tablet-first).
 *
 * @see DESIGN_PREMIUM.md · design/platform/05_ACTION_HIERARCHY.md
 */

import { cn } from "@/lib/utils";
import {
    PLATFORM_DASHBOARD_FOOTER_BTN,
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
} from "@/components/ui/forms/platformFormPresentation";
import {
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    PLATFORM_PAGE_SHELL,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
} from "@/components/ui/surface/glassSurfacePresentation";
import {
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_GREETING_NAME,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    SESSION_PROGRAMMING_FOOTER_SHELL,
    SESSION_PROGRAMMING_PANEL_BODY,
    SESSION_PROGRAMMING_PANEL_HEADER,
    SESSION_PROGRAMMING_PANEL_SUBTITLE,
    SESSION_PROGRAMMING_PANEL_TITLE,
} from "./sessionProgrammingPresentation";

export const SESSION_REVIEW_PAGE = cn(
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    PLATFORM_PAGE_SHELL,
    "relative space-y-5 px-4 sm:space-y-6 lg:px-8",
);

export const SESSION_REVIEW_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.09),transparent_70%)]";

export const SESSION_REVIEW_STACK = "relative space-y-5 sm:space-y-6";

export const SESSION_REVIEW_HERO = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-4 p-4 pt-5 sm:p-5 sm:pt-6",
);

export const SESSION_REVIEW_BREADCRUMB = cn(
    "flex min-h-touch flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:min-h-0",
);

export const SESSION_REVIEW_BREADCRUMB_LINK =
    "rounded-md px-0.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export const SESSION_REVIEW_BREADCRUMB_CURRENT = "truncate font-medium text-foreground";

export const SESSION_REVIEW_HERO_ROW = cn(
    "flex flex-col gap-4",
    "md:flex-row md:items-start md:gap-5",
);

export const SESSION_REVIEW_TITLE = cn(
    NEXIA_PORTAL_GREETING_NAME,
    "text-lg font-semibold leading-tight sm:text-xl",
);

export const SESSION_REVIEW_CLIENT_META = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "text-sm",
);

export const SESSION_REVIEW_HEADER_ACTIONS = cn(
    "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end md:w-auto md:shrink-0",
    "[&_button]:w-full sm:[&_button]:w-auto",
);

export function sessionReviewStatusBadgeClass(status: string): string {
    switch (status) {
        case "completed":
            return "border-success/30 bg-success/10 text-success";
        case "planned":
            return "border-primary/30 bg-primary/10 text-primary";
        case "skipped":
            return "border-destructive/30 bg-destructive/10 text-destructive";
        case "modified":
            return "border-warning/30 bg-warning/10 text-warning";
        default:
            return "border-border/60 bg-muted/30 text-muted-foreground";
    }
}

export const SESSION_REVIEW_STATUS_BADGE = cn(
    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold",
);

export const SESSION_REVIEW_SUMMARY_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-hidden",
);

export const SESSION_REVIEW_SUMMARY_HEADER = SESSION_PROGRAMMING_PANEL_HEADER;

export const SESSION_REVIEW_SUMMARY_TITLE = SESSION_PROGRAMMING_PANEL_TITLE;

export const SESSION_REVIEW_SUMMARY_SUBTITLE = SESSION_PROGRAMMING_PANEL_SUBTITLE;

export const SESSION_REVIEW_SUMMARY_BODY = SESSION_PROGRAMMING_PANEL_BODY;

export const SESSION_REVIEW_META_CHIP = cn(
    "inline-flex items-center rounded-md border border-border/45 bg-surface-2/50 px-2.5 py-1 text-xs text-foreground",
);

export const SESSION_REVIEW_TYPE_CHIP =
    "inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary";

export const SESSION_REVIEW_METRIC_CELL = cn(
    "flex min-w-0 flex-col gap-2 rounded-lg border border-border/45 bg-surface-2/40 p-3 backdrop-blur-sm",
);

export const SESSION_REVIEW_METRIC_LABEL = cn(
    NEXIA_PORTAL_PAGE_EYEBROW,
    "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
);

export const SESSION_REVIEW_METRIC_GRID = cn(
    "grid grid-cols-1 gap-3",
    "sm:grid-cols-3",
);

export const SESSION_REVIEW_METRIC_DURATION = "text-xs tabular-nums text-muted-foreground";

export const SESSION_REVIEW_NOTES_SHELL = cn(
    "rounded-lg border border-border/45 bg-surface-2/35 px-3 py-2.5",
);

export const SESSION_REVIEW_ALERT_PANEL = cn(
    NEXIA_GLASS_CARD,
    "relative overflow-hidden border-warning/25",
);

export const SESSION_REVIEW_ALERT_HEADER = cn(
    "relative z-[1] flex items-center gap-2 border-b border-warning/20 px-4 py-3 sm:px-5",
);

export const SESSION_REVIEW_ALERT_BODY = "relative z-[1] space-y-2 px-4 py-3 sm:px-5";

export const SESSION_REVIEW_ALERT_ITEM = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "text-sm leading-relaxed text-foreground before:mr-2 before:text-warning before:content-['•']",
);

export const SESSION_REVIEW_CONCLUSION_ITEM = cn(
    "rounded-xl border border-border/45 bg-surface-2/35 p-4 backdrop-blur-sm",
);

export function sessionReviewConclusionItemClass(tone: "neutral" | "info" | "caution" | "positive"): string {
    switch (tone) {
        case "positive":
            return cn(SESSION_REVIEW_CONCLUSION_ITEM, "border-success/25 bg-success/[0.06]");
        case "caution":
            return cn(SESSION_REVIEW_CONCLUSION_ITEM, "border-warning/25 bg-warning/[0.06]");
        case "info":
            return cn(SESSION_REVIEW_CONCLUSION_ITEM, "border-primary/25 bg-primary/[0.06]");
        default:
            return SESSION_REVIEW_CONCLUSION_ITEM;
    }
}

export const SESSION_REVIEW_FOOTER_ROW = cn(
    "pointer-events-auto flex w-full min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between",
);

export const SESSION_REVIEW_FOOTER_MGMT = cn(
    "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end md:w-auto",
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
);

export const SESSION_REVIEW_FOOTER_VIEW_ACTION = PLATFORM_DASHBOARD_FOOTER_BTN;

export const SESSION_REVIEW_FOOTER_SHELL = SESSION_PROGRAMMING_FOOTER_SHELL;
