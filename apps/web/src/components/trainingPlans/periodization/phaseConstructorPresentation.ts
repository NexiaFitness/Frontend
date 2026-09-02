/**
 * phaseConstructorPresentation.ts — Tokens visuales del shell de autoría de fase (F2).
 *
 * Contexto: clases Tailwind y helpers de estilo para PhaseAuthoringShell,
 * PhaseSectionNav y chips de estado UX de fase.
 *
 * Notas de mantenimiento: sin lógica de negocio; ver design/platform/02_PRESENTATION_LAYER.md.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import {
    PLATFORM_SECTION_LABEL,
    NEXIA_SEGMENTED_SHELL,
    NEXIA_SEGMENTED_SCROLL,
    NEXIA_SEGMENTED_TRACK_CONTENT,
    nexiaSegmentedItemClass,
} from "@/components/ui/surface/platformPremiumPresentation";
import type { PhaseUxLabel } from "@nexia/shared";

export const PHASE_UX_LABEL_ES: Record<PhaseUxLabel, string> = {
    borrador: "Borrador",
    incompleta: "Incompleta",
    lista: "Lista",
};

export const PHASE_UX_CHIP_CLASS: Record<PhaseUxLabel, string> = {
    borrador: "bg-muted/60 text-muted-foreground border-border",
    incompleta: "bg-warning/10 text-warning border-warning/30",
    lista: "bg-success/10 text-success border-success/30",
};

export const PHASE_SHELL_LAYOUT_CLASS =
    "flex flex-col gap-4 lg:flex-row lg:items-start";

export const PHASE_SHELL_MASTER_CLASS =
    "w-full lg:w-[28%] min-w-0 shrink-0 flex flex-col gap-3";

export const PHASE_SHELL_DETAIL_CLASS =
    "w-full lg:flex-1 min-w-0 flex flex-col gap-4";

export const PHASE_SECTION_NAV_CLASS = cn(
    NEXIA_SEGMENTED_SHELL,
    "border-b-0 pb-0",
);

export const PHASE_SECTION_NAV_SCROLL_CLASS = NEXIA_SEGMENTED_SCROLL;

export const PHASE_SECTION_NAV_TRACK_CLASS = NEXIA_SEGMENTED_TRACK_CONTENT;

export const phaseSectionNavItemClass = (active: boolean): string =>
    nexiaSegmentedItemClass(active, "content");

export const PHASE_SUMMARY_PANEL_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-3 p-4",
);

export const PHASE_SUMMARY_TITLE_CLASS = PLATFORM_SECTION_LABEL;

export const PHASE_CONSTRUCTOR_PANEL_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative min-w-0 p-5",
);

export const WEEK_KIND_BADGE_CLASS = {
    heredada: "bg-primary/10 text-primary border-primary/25",
    personalizada: "bg-warning/10 text-warning border-warning/25",
} as const;

export const WEEK_KIND_LABEL_ES = {
    heredada: "Heredada",
    personalizada: "Personalizada",
} as const;
