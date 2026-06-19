/**
 * athleteExerciseTechniqueUtils.ts — Helpers media/técnica ejercicio (V05, F3e).
 */

export interface AthleteExerciseTechniqueTarget {
    exerciseId: number;
    exerciseName: string;
    videoUrl?: string | null;
    instruction?: string | null;
}

export function resolveTechniqueActionLabel(target: AthleteExerciseTechniqueTarget): string {
    if (target.videoUrl?.trim()) return "Ver vídeo";
    if (target.instruction?.trim()) return "Ver instrucciones";
    return "Ver técnica";
}

export function hasTechniqueSheetContent(target: AthleteExerciseTechniqueTarget): boolean {
    return Boolean(target.videoUrl?.trim() || target.instruction?.trim());
}
