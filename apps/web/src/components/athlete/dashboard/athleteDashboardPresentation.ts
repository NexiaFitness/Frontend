/**
 * athleteDashboardPresentation.ts — Tokens V01 inicio (KPI, chips, campana).
 * Hero y WeekStrip tienen tokens propios — no duplicar aquí.
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_PAGE_HEADER_ICON,
    ATHLETE_SETTINGS_CARD,
} from "@/components/athlete/account/athleteSettingsPresentation";

export const ATHLETE_DASHBOARD_KPI_CARD = cn(
    ATHLETE_SETTINGS_CARD,
    "relative p-3 pt-4"
);

export const ATHLETE_DASHBOARD_KPI_CARD_INTERACTIVE = cn(
    ATHLETE_DASHBOARD_KPI_CARD,
    "text-left transition-colors",
    "hover:border-primary/35 hover:bg-surface-2/60 active:bg-surface-2",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const ATHLETE_DASHBOARD_KPI_LABEL =
    "flex items-center gap-1.5 text-caption font-medium uppercase tracking-wide text-muted-foreground";

export const ATHLETE_DASHBOARD_KPI_VALUE = "text-2xl font-bold tabular-nums text-foreground";

export const ATHLETE_DASHBOARD_KPI_HINT = "mt-0.5 text-caption text-muted-foreground";

export const ATHLETE_DASHBOARD_INSIGHT_CHIP_BASE = cn(
    "inline-flex min-h-touch-athlete items-center gap-1.5 rounded-full border px-3 py-1.5",
    "text-sm font-medium transition-colors",
    "motion-safe:active:scale-[0.98] motion-reduce:active:scale-100"
);

export const ATHLETE_DASHBOARD_INSIGHT_CHIP_PR = cn(
    ATHLETE_DASHBOARD_INSIGHT_CHIP_BASE,
    "border-warning/35 bg-warning/12 text-warning",
    "hover:bg-warning/18 hover:border-warning/45",
    "shadow-[0_0_18px_-8px] shadow-warning/35"
);

export const ATHLETE_DASHBOARD_INSIGHT_CHIP_TRAINER = cn(
    ATHLETE_DASHBOARD_INSIGHT_CHIP_BASE,
    "border-primary/30 bg-primary/10 text-primary",
    "hover:bg-primary/15 hover:border-primary/40"
);

export const ATHLETE_DASHBOARD_BELL_BUTTON = cn(
    ATHLETE_PAGE_HEADER_ICON,
    "relative min-h-touch-athlete min-w-touch-athlete rounded-full",
    "transition-colors hover:border-primary/45 hover:bg-primary/16 active:bg-primary/20"
);

export const ATHLETE_DASHBOARD_BELL_BADGE = cn(
    "absolute right-2 top-2 size-2 rounded-full bg-primary",
    "shadow-[0_0_8px] shadow-primary/60 ring-2 ring-card"
);
