/**
 * athleteTechniquePresentation.ts — Copy y tokens de la hoja «Ver técnica» (V05, H8-A).
 *
 * Contexto: SPEC_H8 §6 y §11.1. Antes el copy y los className vivían dentro de
 * `AthleteExerciseTechniqueSheet`. Base 375 px; tipografía y color con los tokens del
 * portal atleta (DESIGN_MOBILE_FIRST_ATLETA §5, §11; DESIGN_PREMIUM §2.2). Sin vídeo ni
 * bloque 16:9 (RUN_TIPOS_DE_SERIE, «Vídeo demostrativo»).
 * Contratos: agent.md, DESIGN.md, DESIGN_MOBILE_FIRST_ATLETA.md.
 * Notas de mantenimiento: vive aparte porque `athleteRunPresentation.ts` supera el límite
 * de 600 líneas. Sin línea de procedencia: la atribución a RepDB vive en /creditos.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { cn } from "@/lib/utils";

export const ATHLETE_TECHNIQUE_COPY = {
    action: "Ver técnica",
    fallbackTitle: "Técnica",
    close: "Cerrar",
    inEnglish: "(en inglés)",
    steps: "Pasos",
    tips: "Consejos",
    loading: "Cargando la técnica",
    emptyTitle: "Contenido próximamente",
    emptyBody: "Este ejercicio todavía no tiene explicación en el catálogo.",
    unavailableTitle: "Disponible con conexión",
    unavailableBody: "Vuelve a abrir la técnica cuando tengas conexión.",
} as const;

export const ATHLETE_TECHNIQUE_BODY = "space-y-5";

export const ATHLETE_TECHNIQUE_SECTION = "space-y-2";

export const ATHLETE_TECHNIQUE_HEADING = "text-sm font-semibold uppercase tracking-[0.08em] text-primary";

export const ATHLETE_TECHNIQUE_TEXT = "text-base leading-relaxed text-foreground/90";

export const ATHLETE_TECHNIQUE_STEPS = cn(ATHLETE_TECHNIQUE_TEXT, "list-decimal space-y-2 pl-5");

export const ATHLETE_TECHNIQUE_TIPS = cn(ATHLETE_TECHNIQUE_TEXT, "list-disc space-y-2 pl-5");

export const ATHLETE_TECHNIQUE_STATE_BODY = "text-sm leading-relaxed text-muted-foreground";

export const ATHLETE_TECHNIQUE_SKELETON = "space-y-3";

const SKELETON_LINE = "h-4 rounded-md bg-surface-2/80 motion-safe:animate-pulse motion-reduce:animate-none";

export const ATHLETE_TECHNIQUE_SKELETON_LINES = [
    cn(SKELETON_LINE, "w-full"),
    cn(SKELETON_LINE, "w-11/12"),
    cn(SKELETON_LINE, "w-2/3"),
] as const;
