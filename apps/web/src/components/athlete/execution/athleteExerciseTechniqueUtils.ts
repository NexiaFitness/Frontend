/**
 * athleteExerciseTechniqueUtils.ts — Destino y estado de «Ver técnica» (V05, H8-A).
 *
 * Contexto: SPEC_H8 §6. La hoja enseña el texto de lectura del ejercicio (descripción,
 * pasos, consejos) que llega del servidor o, sin red, de la caché propia de técnica.
 * Aquí solo hay funciones puras: qué estado toca y si el texto tiene algo que leer.
 * Contratos: agent.md, DESIGN_MOBILE_FIRST_ATLETA.md, RUN_TIPOS_DE_SERIE.md.
 * Notas de mantenimiento: sin vídeo ni imágenes (D-H8-4). `videoUrl` e `instruction`
 * siguen en el tipo porque los rellenan los pasos del run (`buildAthleteRunSteps`, por
 * encima del límite de líneas); su retirada es deuda del run (plan H8-A §9, A3). La
 * hoja no los usa.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import type { ExerciseContentOut } from "@nexia/shared/types/exerciseContent";
import { ATHLETE_TECHNIQUE_COPY } from "./athleteTechniquePresentation";

export interface AthleteExerciseTechniqueTarget {
    exerciseId: number;
    exerciseName: string;
    /** @deprecated Retirado de la hoja en H8-A (sin vídeo, D-H8-4). Deuda A3. */
    videoUrl?: string | null;
    /** @deprecated Copy de grupo del run; la hoja no lo usa. Deuda A3. */
    instruction?: string | null;
}

/** Lo que la hoja puede enseñar para un ejercicio. */
export type AthleteTechniqueSheetState =
    | { kind: "loading" }
    | { kind: "content"; content: ExerciseContentOut }
    | { kind: "empty" }
    | { kind: "unavailable" };

/** Siempre «Ver técnica»: la hoja no enseña vídeo (D-H8-4). */
export function resolveTechniqueActionLabel(): string {
    return ATHLETE_TECHNIQUE_COPY.action;
}

/** Toda fila con ejercicio real puede abrir la hoja: el estado se decide al abrirla. */
export function canOpenTechnique(target: AthleteExerciseTechniqueTarget): boolean {
    return target.exerciseId > 0;
}

export function hasReadingText(content: ExerciseContentOut): boolean {
    return Boolean(content.description?.trim()) || content.steps.length > 0 || content.tips.length > 0;
}

/**
 * Estado de la hoja para un ejercicio.
 * - `fresh`: texto del servidor para la sesión (undefined si no llegó o no cubre el ejercicio).
 * - `cached`: texto de la caché de esta sesión y este atleta (undefined si no lo cubre).
 * Sin ninguno: cargando mientras la petición sigue en curso; si no, «Disponible con conexión».
 */
export function resolveTechniqueSheetState(input: {
    fresh: ExerciseContentOut | undefined;
    cached: ExerciseContentOut | undefined;
    requestPending: boolean;
}): AthleteTechniqueSheetState {
    const content = input.fresh ?? input.cached;
    if (content) {
        return hasReadingText(content) ? { kind: "content", content } : { kind: "empty" };
    }
    return input.requestPending ? { kind: "loading" } : { kind: "unavailable" };
}
