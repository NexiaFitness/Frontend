/**
 * ExerciseTechniqueText.tsx — Pinta la técnica de un ejercicio: descripción, ejecución y consejos.
 *
 * Contexto: extraído de ExerciseDetailReadingContent (SPEC_H10 §6.2) para que la ficha del
 * entrenador y la vista previa de la ficha admin enseñen el texto con el mismo componente.
 * Solo render, sin red: quien lo usa decide qué texto pasa y qué hace si está vacío.
 * Notas de mantenimiento: no pinta secciones vacías. Copy y clases en
 * exerciseDetailPresentation. Terminología única (D-H10-1): Descripción · Ejecución · Consejos.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React from "react";
import {
    EXERCISE_DETAIL_BODY_MUTED_PRESERVE,
    EXERCISE_DETAIL_READING_LIST,
    EXERCISE_DETAIL_READING_NOTE,
    EXERCISE_DETAIL_READING_STACK,
    EXERCISE_DETAIL_READING_TIPS,
    EXERCISE_DETAIL_SECTION_LABELS,
    EXERCISE_DETAIL_SPEC_LABEL,
} from "@/components/exercises/exerciseDetailPresentation";

export interface ExerciseTechniqueTextProps {
    description: string;
    steps: readonly string[];
    tips: readonly string[];
    /** Aviso de idioma cuando el texto llega en inglés de respaldo. */
    inEnglish?: boolean;
    /** Nivel de los títulos según la página donde se monta. */
    headingLevel?: "h2" | "h3" | "h4";
}

export const ExerciseTechniqueText: React.FC<ExerciseTechniqueTextProps> = ({
    description,
    steps,
    tips,
    inEnglish = false,
    headingLevel = "h2",
}) => {
    const Heading = headingLevel;
    return (
        <div className={EXERCISE_DETAIL_READING_STACK}>
            {inEnglish ? (
                <p className={EXERCISE_DETAIL_READING_NOTE}>{EXERCISE_DETAIL_SECTION_LABELS.inEnglish}</p>
            ) : null}
            {description ? (
                <section>
                    <Heading className={EXERCISE_DETAIL_SPEC_LABEL}>
                        {EXERCISE_DETAIL_SECTION_LABELS.description}
                    </Heading>
                    <p className={EXERCISE_DETAIL_BODY_MUTED_PRESERVE}>{description}</p>
                </section>
            ) : null}
            {steps.length > 0 ? (
                <section>
                    <Heading className={EXERCISE_DETAIL_SPEC_LABEL}>
                        {EXERCISE_DETAIL_SECTION_LABELS.execution}
                    </Heading>
                    <ol className={EXERCISE_DETAIL_READING_LIST}>
                        {steps.map((step, index) => (
                            <li key={`${index}-${step}`}>{step}</li>
                        ))}
                    </ol>
                </section>
            ) : null}
            {tips.length > 0 ? (
                <section>
                    <Heading className={EXERCISE_DETAIL_SPEC_LABEL}>
                        {EXERCISE_DETAIL_SECTION_LABELS.tips}
                    </Heading>
                    <ul className={EXERCISE_DETAIL_READING_TIPS}>
                        {tips.map((tip, index) => (
                            <li key={`${index}-${tip}`}>{tip}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
};
