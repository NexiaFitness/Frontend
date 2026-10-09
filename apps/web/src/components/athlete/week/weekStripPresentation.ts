/**
 * weekStripPresentation.ts — Tokens calendario semanal V01 (Esta semana).
 */

import { cn } from "@/lib/utils";
import { ATHLETE_SECTION_LABEL } from "@/components/athlete/account/athleteSettingsPresentation";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const WEEK_STRIP_SECTION_LABEL = ATHLETE_SECTION_LABEL;

export const WEEK_STRIP_SHELL = cn(NEXIA_GLASS_CARD, "relative p-3");

export function weekStripSectionAriaLabel(done: number, planned: number): string {
    if (planned === 0) {
        return "Esta semana, sin sesiones planificadas";
    }
    return `Esta semana, ${done} de ${planned} sesiones completadas`;
}
