/**
 * templateEditorPresentation.ts — Editor plantilla (premium · tokens canónicos).
 *
 * Doc: DESIGN_PREMIUM.md (raíz) · design/platform/01_PREMIUM_MIGRATION.md
 * Patrón: exerciseDetailPresentation.ts + athleteSessionsPresentation.ts
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_PRIMARY_CTA,
    ATHLETE_SECTION_LABEL,
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_EMPTY_STATE_ACTION,
    ATHLETE_EMPTY_STATE_CARD,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_GLOW,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import { ATHLETE_PLAN_QUALITY_ROW } from "@/components/athlete/plan/athletePlanPresentation";
import {
    ATHLETE_SESSION_EXERCISE_NAME,
    ATHLETE_SESSION_LIST_ITEM,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import {
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    PLATFORM_BADGE_ROW,
    PLATFORM_BODY_MUTED,
    PLATFORM_ICON_BACK_GAP,
    PLATFORM_ICON_SM,
    PLATFORM_PAGE_SHELL,
} from "@/components/ui/surface/platformPremiumPresentation";
import { labelSessionType } from "@nexia/shared";
import type {
    TemplateProgramBlock,
    TemplateProgramSessionListItem,
} from "@nexia/shared/types/templateProgram";

export {
    PLATFORM_BACK_BUTTON as TEMPLATE_EDITOR_BACK_BUTTON,
    PLATFORM_PAGE_HEADER as TEMPLATE_EDITOR_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as TEMPLATE_EDITOR_TITLE_WRAP,
} from "@/components/ui/surface/platformPremiumPresentation";

export const TEMPLATE_EDITOR_COPY = {
    pageSubtitle: "Diseña el programa semana a semana y publícalo cuando esté listo",
    temporalHint:
        "Las plantillas usan semanas 1, 2, 3… Al asignar, eliges la fecha de inicio y NEXIA arma el calendario.",
    programHeroEyebrow: "Programa",
    programHeroSessions: (n: number) =>
        n === 1 ? "1 sesión programada" : `${n} sesiones programadas`,
    programHeroExercises: (n: number) =>
        n === 1 ? "1 ejercicio en total" : `${n} ejercicios en total`,
    timelineTitle: "Tu programa",
    timelineHint: "Toca una sesión para editar ejercicios y series",
    weekLabel: (week: number) => `Semana ${week}`,
    phasesTitle: "Fases de periodización",
    phasesHint: "Agrupa semanas con volumen e intensidad similares (opcional avanzado)",
    phasesToggle: "Ver fases de periodización",
    phasesHide: "Ocultar fases",
    addSession: "Añadir sesión",
    addPhase: "Añadir fase",
    emptyProgramTitle: "Monta tu programa",
    emptyProgramBody:
        "Añade la primera sesión de la semana 1. Cuando termines, publica la plantilla para poder asignarla a un cliente.",
    emptyProgramCta: "Añadir primera sesión",
    weeklyDaysLink: "Días de entrenamiento",
    editPhase: "Editar fase",
    deletePhase: "Eliminar fase",
    sessionEditAria: (title: string) => `Editar sesión ${title}`,
    sessionDeleteAria: (title: string) => `Eliminar sesión ${title}`,
    phasesEmptyHelper:
        "Si tu programa es lineal, basta con añadir sesiones arriba. Usa fases solo si cambias volumen o intensidad entre tramos de semanas.",
} as const;

export const TEMPLATE_EDITOR_PAGE = cn(PLATFORM_PAGE_SHELL, "relative space-y-6 py-5 lg:py-6");

export const TEMPLATE_EDITOR_HINT = cn(
    "border-l-2 border-primary/30 pl-3",
    NEXIA_PORTAL_CARD_DESCRIPTION,
);

export const TEMPLATE_EDITOR_HERO_SHELL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-2 p-4 pt-5 sm:p-5",
);

export const TEMPLATE_EDITOR_HERO_EYEBROW = NEXIA_PORTAL_PAGE_EYEBROW;
export const TEMPLATE_EDITOR_HERO_TITLE = NEXIA_PORTAL_CARD_TITLE;
export const TEMPLATE_EDITOR_HERO_STATS = NEXIA_PORTAL_CARD_DESCRIPTION;

export const TEMPLATE_EDITOR_STATUS_ROW = cn(PLATFORM_BADGE_ROW, "mt-2 text-sm");

export const TEMPLATE_EDITOR_SECTION_EYEBROW = ATHLETE_SECTION_LABEL;
export const TEMPLATE_EDITOR_SECTION_HINT = NEXIA_PORTAL_CARD_DESCRIPTION;

export const TEMPLATE_EDITOR_SECTION = "space-y-3";
export const TEMPLATE_EDITOR_SECTION_HEAD =
    "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between";

export const TEMPLATE_EDITOR_TIMELINE_STACK = "space-y-5";
export const TEMPLATE_EDITOR_WEEK_GROUP = "space-y-2";
export const TEMPLATE_EDITOR_WEEK_LIST = "space-y-2";

export const TEMPLATE_EDITOR_WEEK_HEADER = cn(
    ATHLETE_SECTION_LABEL,
    "sticky top-0 z-[1] -mx-1 bg-background/80 px-1 py-1 backdrop-blur-sm",
);

export const TEMPLATE_EDITOR_SESSION_LIST_ITEM = "flex items-stretch gap-1";

export const TEMPLATE_EDITOR_SESSION_ROW = cn(ATHLETE_SESSION_LIST_ITEM, "group");

export const TEMPLATE_EDITOR_SESSION_MAIN = "min-w-0 flex-1";

export const TEMPLATE_EDITOR_SESSION_TITLE = ATHLETE_SESSION_EXERCISE_NAME;

export const TEMPLATE_EDITOR_SESSION_META = cn(NEXIA_PORTAL_CARD_DESCRIPTION, "mt-0.5");

export const TEMPLATE_EDITOR_SESSION_CHEVRON = cn(
    PLATFORM_ICON_SM,
    "shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary",
);

export const TEMPLATE_EDITOR_SESSION_DELETE = "shrink-0 self-center";

export const TEMPLATE_EDITOR_EMPTY = cn(ATHLETE_EMPTY_STATE_CARD, "relative");
export const TEMPLATE_EDITOR_EMPTY_GLOW = ATHLETE_EMPTY_STATE_GLOW;
export const TEMPLATE_EDITOR_EMPTY_TITLE = ATHLETE_EMPTY_STATE_TITLE;
export const TEMPLATE_EDITOR_EMPTY_BODY = ATHLETE_EMPTY_STATE_DESCRIPTION;
export const TEMPLATE_EDITOR_EMPTY_ACTION = ATHLETE_EMPTY_STATE_ACTION;
export const TEMPLATE_EDITOR_EMPTY_CTA = cn(ATHLETE_PRIMARY_CTA, "w-full sm:w-auto");

export const TEMPLATE_EDITOR_DETAILS = cn(NEXIA_GLASS_CARD, "overflow-hidden");
export const TEMPLATE_EDITOR_DETAILS_SUMMARY = cn(
    "flex list-none cursor-pointer items-center justify-between gap-3 px-4 py-3",
    "[&::-webkit-details-marker]:hidden",
);
export const TEMPLATE_EDITOR_DETAILS_TOGGLE = "text-xs font-medium text-primary";
export const TEMPLATE_EDITOR_DETAILS_SUBTITLE = cn(NEXIA_PORTAL_CARD_DESCRIPTION, "mt-0.5 block");
export const TEMPLATE_EDITOR_DETAILS_BODY = cn(
    "space-y-3 border-t border-border/60 px-4 py-4",
);
export const TEMPLATE_EDITOR_DETAILS_HELPER = PLATFORM_BODY_MUTED.replace("mt-2", "mt-0");

export const TEMPLATE_EDITOR_PHASE_CARD = cn(ATHLETE_PLAN_QUALITY_ROW, "relative pt-5");
export const TEMPLATE_EDITOR_PHASE_TITLE = NEXIA_PORTAL_CARD_TITLE;
export const TEMPLATE_EDITOR_PHASE_META = NEXIA_PORTAL_CARD_DESCRIPTION;
export const TEMPLATE_EDITOR_PHASE_LIST = "space-y-3";
export const TEMPLATE_EDITOR_PHASE_BADGES = "mt-2 flex flex-wrap gap-3";
export const TEMPLATE_EDITOR_PHASE_ACTIONS = "mt-3 flex flex-wrap items-center gap-2";

export const TEMPLATE_EDITOR_ICON_BACK = PLATFORM_ICON_BACK_GAP;

export const TEMPLATE_PROGRAM_DAY_LABELS: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
};

export function labelTemplateProgramDay(dayOfWeek: number): string {
    return TEMPLATE_PROGRAM_DAY_LABELS[dayOfWeek] ?? `Día ${dayOfWeek}`;
}

export function formatTemplateProgramWeeks(count: number | null | undefined): string | null {
    if (count == null || count <= 0) return null;
    return count === 1 ? "Programa de 1 semana" : `Programa de ${count} semanas`;
}

function isInternalSessionName(name: string): boolean {
    const n = name.trim();
    if (!n) return true;
    if (/^(source|test|qa|e2e|untitled)/i.test(n)) return true;
    if (n === n.toUpperCase() && n.length > 10 && /[_-]/.test(n)) return true;
    return false;
}

export function displayTemplateSessionTitle(session: TemplateProgramSessionListItem): string {
    if (!isInternalSessionName(session.session_name)) {
        return session.session_name.trim();
    }
    return labelTemplateProgramDay(session.day_of_week);
}

export function displayTemplateSessionSubtitle(session: TemplateProgramSessionListItem): string {
    const day = labelTemplateProgramDay(session.day_of_week);
    const typeLabel = labelSessionType(session.session_type);
    const ex =
        session.exercise_count === 1
            ? "1 ejercicio"
            : `${session.exercise_count} ejercicios`;

    if (!isInternalSessionName(session.session_name)) {
        return `${day} · ${typeLabel} · ${ex}`;
    }
    return `${typeLabel} · ${ex}`;
}

export interface TemplateProgramWeekGroup {
    week: number;
    sessions: TemplateProgramSessionListItem[];
}

export function groupTemplateSessionsByWeek(
    sessions: TemplateProgramSessionListItem[],
): TemplateProgramWeekGroup[] {
    const map = new Map<number, TemplateProgramSessionListItem[]>();
    for (const session of sessions) {
        const bucket = map.get(session.program_week) ?? [];
        bucket.push(session);
        map.set(session.program_week, bucket);
    }
    return [...map.entries()]
        .sort(([a], [b]) => a - b)
        .map(([week, weekSessions]) => ({
            week,
            sessions: [...weekSessions].sort(
                (a, b) => a.day_of_week - b.day_of_week || a.slot_order - b.slot_order,
            ),
        }));
}

export function displayTemplatePhaseTitle(block: TemplateProgramBlock): string {
    if (block.name?.trim()) return block.name.trim();
    return `Semanas ${block.program_week_start}–${block.program_week_end}`;
}

export function templateProgramExerciseTotal(
    sessions: TemplateProgramSessionListItem[],
): number {
    return sessions.reduce((acc, s) => acc + (s.exercise_count ?? 0), 0);
}
