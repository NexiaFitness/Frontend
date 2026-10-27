/**
 * Copy del panel de volumen — programado vs registrado/ejecutado.
 * Regla: nunca mezclar métricas; etiquetar siempre la fuente de datos.
 * H4: `volumeNotesCopy` dice lo que el volumen excluye o no puede contar (nunca se oculta).
 */

import type { VolumeNoteExerciseOut, VolumeNotesOut } from "../types/sessionLoad";

export interface VolumeNoteCopy {
    key: "warmup" | "missing_sets" | "unmapped";
    tone: "info" | "warning";
    title: string;
    description?: string;
}

function names(items: VolumeNoteExerciseOut[]): string {
    return items.map((e) => e.name_es || e.exercise_code).join(", ");
}

function plural(n: number, one: string, many: string): string {
    return n === 1 ? one : many.replace("{n}", String(n));
}

/** Notas de volumen en orden de lectura: primero lo que hay que completar. */
export function volumeNotesCopy(notes: VolumeNotesOut | null | undefined): VolumeNoteCopy[] {
    if (!notes) return [];
    const out: VolumeNoteCopy[] = [];
    if (notes.lines_missing_sets.length > 0) {
        out.push({
            key: "missing_sets",
            tone: "warning",
            title: plural(
                notes.lines_missing_sets.length,
                "1 ejercicio sin series no suma volumen",
                "{n} ejercicios sin series no suman volumen"
            ),
            description: `Completa las series o la duración: ${names(notes.lines_missing_sets)}.`,
        });
    }
    if (notes.unmapped_exercises.length > 0) {
        out.push({
            key: "unmapped",
            tone: "warning",
            title: plural(
                notes.unmapped_exercises.length,
                "1 ejercicio no suma volumen muscular",
                "{n} ejercicios no suman volumen muscular"
            ),
            description: `Falta su musculatura en el catálogo: ${names(notes.unmapped_exercises)}. Lo corrige el administrador.`,
        });
    }
    if (notes.warmup_sets_excluded > 0) {
        out.push({
            key: "warmup",
            tone: "info",
            title: plural(
                notes.warmup_sets_excluded,
                "1 serie de calentamiento no cuenta como volumen",
                "{n} series de calentamiento no cuentan como volumen"
            ),
        });
    }
    return out;
}

/** Volumen muscular en constructor y validación de sesión (review). */
export const VOLUME_MUSCLE_PROGRAMMED_NOTE =
    "Series equivalentes programadas en el constructor. No refleja lo ejecutado por el atleta.";

export const VOLUME_REVIEW_SECTION_TITLE = "Volumen programado por grupo muscular";

export const VOLUME_REVIEW_GROUPS_HEADING = "Volumen programado en esta sesión";

export const VOLUME_REVIEW_KPI_ARIA = "Resumen de volumen programado de la sesión";

export const VOLUME_REVIEW_KPI_GROUPS_LABEL = "Grupos con series programadas";

export const VOLUME_REVIEW_KPI_SERIES_LABEL = "Series programadas hoy";

export const VOLUME_REVIEW_KPI_SERIES_HINT = "Programadas frente al objetivo del día";

export const VOLUME_CONSTRUCTOR_DRAFT_TITLE = "Series de hoy vs objetivo del día";

export const VOLUME_CONSTRUCTOR_DRAFT_SUBTITLE =
    "Series programadas en el borrador frente al objetivo de este día según la estructura semanal del plan";

export const VOLUME_WEEKLY_SAVED_SUBTITLE =
    "Acumulado semanal programado según sesiones guardadas y objetivos del plan";

/** Nota de método de conteo — copy para entrenador (sin jerga interna D1/D1b). */
export const VOLUME_COUNTING_METHOD_NOTE =
    "Series programadas por grupo muscular según el catálogo. Las series directas cuentan enteras; las de apoyo, la mitad. En ejercicios pliométricos (saltos, comba) cuentan la mitad de eso: es un criterio de producto, sin evidencia directa del porcentaje. Las series de calentamiento no cuentan. Solo muestra grupos previstos para este día en el plan y lo prescrito en esta sesión, no lo ejecutado por el atleta.";

export const VOLUME_COVERAGE_EMPTY_WEEK =
    "Semana vacía: no hay sesiones programadas guardadas en este rango.";

export const VOLUME_COVERAGE_NO_EVALUABLE =
    "Sin datos evaluables: hay sesiones pero ningún ejercicio aporta volumen muscular (revisa mapeo en catálogo).";

export const VOLUME_COVERAGE_PARTIAL_WEEK =
    "Semana incompleta: hay volumen evaluable pero menos sesiones guardadas que la frecuencia del cliente.";

export const VOLUME_PRIOR_WEEK_NONE = "Sin semana anterior comparable";
