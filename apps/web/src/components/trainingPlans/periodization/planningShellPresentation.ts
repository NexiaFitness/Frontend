/**
 * planningShellPresentation.ts — Tokens layout shell F5 (explore · createWhen · analytics).
 */

import { cn } from "@/lib/utils";
import {
    NEXIA_GLASS_CARD,
} from "@/components/ui/surface/glassSurfacePresentation";
import {
    NEXIA_PORTAL_CARD_TITLE,
    NEXIA_PORTAL_GREETING_SUBTITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";

export const PLANNING_SHELL_SECTION_CLASS = "space-y-6";

export const PLANNING_SHELL_HEADER_CLASS =
    "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between";

export const PLANNING_SHELL_TITLE_CLASS = NEXIA_PORTAL_CARD_TITLE;

export const PLANNING_SHELL_SUBTITLE_CLASS = NEXIA_PORTAL_GREETING_SUBTITLE;

export const PLANNING_PROGRAM_SUMMARY_CLASS =
    "text-sm text-muted-foreground";

export const PLANNING_CHIP_STRIP_CLASS =
    "flex gap-2 overflow-x-auto pb-1 scrollbar-primary";

export const planningPhaseChipClass = (selected: boolean): string =>
    cn(
        "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        selected
            ? "border-primary bg-primary/15 text-primary shadow-[0_0_16px_-6px_hsl(var(--primary)/0.5)]"
            : "border-border/70 bg-surface-2/50 text-muted-foreground hover:border-primary/35 hover:text-foreground",
    );

export const PLANNING_ADD_PHASE_CHIP_CLASS = cn(
    "inline-flex shrink-0 items-center rounded-full border border-dashed border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10",
);

export const PLANNING_EXPLORE_GRID_CLASS =
    "flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:items-start";

export const PLANNING_CREATE_WHEN_GRID_CLASS =
    "flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,13fr)_minmax(0,7fr)] lg:items-start";

export const PLANNING_PANEL_CARD_CLASS = cn(NEXIA_GLASS_CARD, "min-w-0 p-5 sm:p-6");

export const PLANNING_FOOTER_ACTIONS_CLASS =
    "flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between";
