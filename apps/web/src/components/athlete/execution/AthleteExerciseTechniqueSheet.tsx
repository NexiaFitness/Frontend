/**
 * AthleteExerciseTechniqueSheet.tsx — Hoja «Ver técnica» del run (V05, H8-A).
 *
 * Contexto: SPEC_H8 §6. Enseña la descripción, los pasos y los consejos del ejercicio
 * que decide `useAthleteTechniqueSheet` (servidor o caché propia sin red). Reutiliza
 * `BottomSheet`: diálogo modal, foco en el diálogo al abrir y de vuelta al disparador al
 * cerrar, Escape. Sin vídeo, sin imágenes y sin línea de procedencia.
 * Contratos: agent.md, DESIGN.md, DESIGN_MOBILE_FIRST_ATLETA.md.
 * Notas de mantenimiento: solo render; copy y tokens en `athleteTechniquePresentation`.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import React from "react";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { Button } from "@/components/ui/buttons";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import type {
    AthleteExerciseTechniqueTarget,
    AthleteTechniqueSheetState,
} from "./athleteExerciseTechniqueUtils";
import {
    ATHLETE_TECHNIQUE_BODY,
    ATHLETE_TECHNIQUE_COPY,
    ATHLETE_TECHNIQUE_HEADING,
    ATHLETE_TECHNIQUE_SECTION,
    ATHLETE_TECHNIQUE_SKELETON,
    ATHLETE_TECHNIQUE_SKELETON_LINES,
    ATHLETE_TECHNIQUE_STATE_BODY,
    ATHLETE_TECHNIQUE_STEPS,
    ATHLETE_TECHNIQUE_TEXT,
    ATHLETE_TECHNIQUE_TIPS,
} from "./athleteTechniquePresentation";

export type { AthleteExerciseTechniqueTarget } from "./athleteExerciseTechniqueUtils";

export interface AthleteExerciseTechniqueSheetProps {
    target: AthleteExerciseTechniqueTarget | null;
    state: AthleteTechniqueSheetState;
    onClose: () => void;
}

const COPY = ATHLETE_TECHNIQUE_COPY;

function subtitleFor(state: AthleteTechniqueSheetState): string | undefined {
    if (state.kind === "empty") return COPY.emptyTitle;
    if (state.kind === "unavailable") return COPY.unavailableTitle;
    if (state.kind === "content" && state.content.in_english) return COPY.inEnglish;
    return undefined;
}

const TechniqueBody: React.FC<{ state: AthleteTechniqueSheetState }> = ({ state }) => {
    if (state.kind === "loading") {
        return (
            <div className={ATHLETE_TECHNIQUE_SKELETON} aria-busy="true" aria-label={COPY.loading}>
                {ATHLETE_TECHNIQUE_SKELETON_LINES.map((line) => (
                    <div key={line} className={line} />
                ))}
            </div>
        );
    }
    if (state.kind === "empty") return <p className={ATHLETE_TECHNIQUE_STATE_BODY}>{COPY.emptyBody}</p>;
    if (state.kind === "unavailable") {
        return <p className={ATHLETE_TECHNIQUE_STATE_BODY}>{COPY.unavailableBody}</p>;
    }
    const { content } = state;
    return (
        <div className={ATHLETE_TECHNIQUE_BODY} lang={content.in_english ? "en" : undefined}>
            {content.description ? <p className={ATHLETE_TECHNIQUE_TEXT}>{content.description}</p> : null}
            {content.steps.length > 0 ? (
                <section className={ATHLETE_TECHNIQUE_SECTION}>
                    <h3 className={ATHLETE_TECHNIQUE_HEADING} lang="es">
                        {COPY.steps}
                    </h3>
                    <ol className={ATHLETE_TECHNIQUE_STEPS}>
                        {content.steps.map((step, index) => (
                            <li key={`${index}-${step}`}>{step}</li>
                        ))}
                    </ol>
                </section>
            ) : null}
            {content.tips.length > 0 ? (
                <section className={ATHLETE_TECHNIQUE_SECTION}>
                    <h3 className={ATHLETE_TECHNIQUE_HEADING} lang="es">
                        {COPY.tips}
                    </h3>
                    <ul className={ATHLETE_TECHNIQUE_TIPS}>
                        {content.tips.map((tip, index) => (
                            <li key={`${index}-${tip}`}>{tip}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
};

export const AthleteExerciseTechniqueSheet: React.FC<AthleteExerciseTechniqueSheetProps> = ({
    target,
    state,
    onClose,
}) => (
    <BottomSheet
        isOpen={target != null}
        onClose={onClose}
        title={target?.exerciseName ?? COPY.fallbackTitle}
        subtitle={subtitleFor(state)}
        footer={
            <Button variant="primary" className={ATHLETE_PRIMARY_CTA} onClick={onClose}>
                {COPY.close}
            </Button>
        }
    >
        <TechniqueBody state={state} />
    </BottomSheet>
);
