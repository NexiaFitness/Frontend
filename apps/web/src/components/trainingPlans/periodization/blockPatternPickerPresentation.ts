/**
 * blockPatternPickerPresentation.ts — Contenido modal selector de patrones (wizard D-PAP).
 *
 * Shell modal: NexiaPremiumModal + nexiaPremiumModalPresentation.ts
 */

import type { UiBucketTailwindKey } from "@nexia/shared";
import { uiBucketToTailwindKey } from "@nexia/shared";

import { cn } from "@/lib/utils";
import {
    NEXIA_PORTAL_CARD_DESCRIPTION,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    PLATFORM_LINK_PRIMARY,
    PLATFORM_SECTION_LABEL,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
    NEXIA_PREMIUM_MODAL_TITLE_ACCENT_CLASS,
} from "@/components/ui/modals/nexiaPremiumModalPresentation";

/** Re-export acento título — paridad con modal canónico. */
export const BLOCK_PATTERN_PICKER_DAY_ACCENT_CLASS =
    NEXIA_PREMIUM_MODAL_TITLE_ACCENT_CLASS;

export const BLOCK_PATTERN_PICKER_CATALOG_CLASS = "space-y-3 pb-1";

const PATTERN_PICKER_SECTION_PANEL_BASE = cn(
    "rounded-xl border border-border/45 p-3 backdrop-blur-sm",
);

const PATTERN_PICKER_SECTION_PANEL_BUCKET_CLASS: Record<
    UiBucketTailwindKey,
    string
> = {
    lower:
        "bg-gradient-to-br from-bucket-lower/[0.09] via-surface-2/20 to-transparent",
    upper:
        "bg-gradient-to-br from-bucket-upper/[0.09] via-surface-2/20 to-transparent",
    core: "bg-gradient-to-br from-bucket-core/[0.09] via-surface-2/20 to-transparent",
    power:
        "bg-gradient-to-br from-bucket-power/[0.09] via-surface-2/20 to-transparent",
    accessory:
        "bg-gradient-to-br from-bucket-accessory/[0.09] via-surface-2/20 to-transparent",
};

export function patternPickerSectionPanelClass(bucket: string): string {
    const key = uiBucketToTailwindKey(bucket);
    return cn(
        PATTERN_PICKER_SECTION_PANEL_BASE,
        PATTERN_PICKER_SECTION_PANEL_BUCKET_CLASS[key],
    );
}

export const BLOCK_PATTERN_PICKER_SECTION_CLASS = "space-y-2";

export const BLOCK_PATTERN_PICKER_SECTION_LABEL_CLASS = PLATFORM_SECTION_LABEL;

export const BLOCK_PATTERN_PICKER_CHIP_ROW_CLASS =
    "flex flex-wrap gap-1.5 sm:gap-2";

export const BLOCK_PATTERN_PICKER_CHIP_CLASS =
    "rounded-lg px-3 py-1.5 shadow-[0_1px_0_0] shadow-black/20";

export const BLOCK_PATTERN_PICKER_FOOTER_ROW_CLASS =
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS;

export const BLOCK_PATTERN_PICKER_COUNT_EMPTY_CLASS =
    "text-sm font-medium text-primary animate-pulse";

export const BLOCK_PATTERN_PICKER_COUNT_ACTIVE_CLASS =
    "text-sm font-medium text-foreground";

export const BLOCK_PATTERN_PICKER_COUNT_NUMBER_CLASS =
    "font-semibold tabular-nums text-primary";

export const BLOCK_PATTERN_PICKER_DESCRIPTION_ROW_CLASS = cn(
    "mt-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
    "max-w-none text-left leading-relaxed",
);

export const BLOCK_PATTERN_PICKER_INSTRUCTION_CLASS = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "min-w-0 shrink-0",
);

export const BLOCK_PATTERN_PICKER_COPY_ROW_CLASS =
    "flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-sm";

export const BLOCK_PATTERN_PICKER_COPY_LABEL_CLASS =
    "shrink-0 text-muted-foreground";

export const BLOCK_PATTERN_PICKER_COPY_SEPARATOR_CLASS =
    "text-muted-foreground/70";

export const BLOCK_PATTERN_PICKER_COPY_DAY_BTN_CLASS = cn(
    PLATFORM_LINK_PRIMARY,
    "inline p-0 text-sm font-medium",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
);
