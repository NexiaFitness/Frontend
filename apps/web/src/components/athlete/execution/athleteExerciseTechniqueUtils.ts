/**
 * athleteExerciseTechniqueUtils.ts — Helpers media/técnica ejercicio (V05, F3e).
 *
 * `instruction` = notas de técnica del catálogo (F3e), nunca copy de grupo del run
 * («Completa cuatro ejercicios…», etc.).
 */

export interface AthleteExerciseTechniqueTarget {
    exerciseId: number;
    exerciseName: string;
    videoUrl?: string | null;
    /** Solo instrucciones del catálogo (F3e). No reutilizar copy de ronda/grupo. */
    instruction?: string | null;
}

export function resolveTechniqueActionLabel(target: AthleteExerciseTechniqueTarget): string {
    if (target.videoUrl?.trim()) return "Ver vídeo";
    return "Ver técnica";
}

/** Contenido real en sheet (vídeo o notas catálogo). Sin vídeo → stub «próximamente». */
export function hasTechniqueSheetContent(target: AthleteExerciseTechniqueTarget): boolean {
    return Boolean(target.videoUrl?.trim() || target.instruction?.trim());
}
