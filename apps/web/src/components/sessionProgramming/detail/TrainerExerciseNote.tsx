/**
 * TrainerExerciseNote — Indicación del entrenador en detalle de sesión (B10).
 *
 * @author Frontend Team
 * @since 2026-10-02
 */

export function TrainerExerciseNote({ text }: { text: string }): JSX.Element {
    return (
        <div className="mt-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Indicación del entrenador
            </p>
            <p className="mt-0.5 text-sm whitespace-pre-wrap text-foreground">{text}</p>
        </div>
    );
}
