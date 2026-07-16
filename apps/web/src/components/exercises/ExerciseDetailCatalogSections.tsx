/**
 * ExerciseDetailCatalogSections.tsx — Campos de planificación avanzada (motor / carga).
 *
 * Biomecánica esencial vive en ExerciseDetailTrainerEssentials.
 * Design: docs/design/01_PREMIUM_PLATFORM_MIGRATION.md
 */

import React from "react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import {
    EXERCISE_DETAIL_EMPTY_VALUE,
    EXERCISE_DETAIL_SECTION_LABELS,
    EXERCISE_DETAIL_SPEC_GRID,
    EXERCISE_DETAIL_SPEC_LABEL,
    EXERCISE_DETAIL_SPEC_VALUE,
} from "@/components/exercises/exerciseDetailPresentation";
import {
    axialLoadLabel,
    EXERCISE_DETAIL_EMPTY_COPY,
    lateralityLabel,
    mechanicalLoadLabel,
    stimulusTypeLabel,
    tipoCargaLabel,
} from "@/utils/exercises/exerciseDetailLabels";

interface ExerciseDetailCatalogSectionsProps {
    exercise: Exercise;
}

function FieldCell({
    label,
    value,
    empty = EXERCISE_DETAIL_EMPTY_COPY,
}: {
    label: string;
    value: string;
    empty?: string;
}) {
    const display = value.trim() || empty;
    const isEmpty = !value.trim();
    return (
        <div>
            <p className={EXERCISE_DETAIL_SPEC_LABEL}>{label}</p>
            <p className={isEmpty ? EXERCISE_DETAIL_EMPTY_VALUE : EXERCISE_DETAIL_SPEC_VALUE}>
                {display}
            </p>
        </div>
    );
}

export const ExerciseDetailCatalogSections: React.FC<ExerciseDetailCatalogSectionsProps> = ({
    exercise,
}) => {
    const tipoCarga = tipoCargaLabel(exercise.tipo_carga);
    const laterality = lateralityLabel(exercise.laterality);
    const mechanical = mechanicalLoadLabel(exercise.mechanical_load_level);
    const axial = axialLoadLabel(exercise.axial_load);
    const stimulus = stimulusTypeLabel(exercise.stimulus_type);

    return (
        <div className={EXERCISE_DETAIL_SPEC_GRID}>
            <FieldCell label={EXERCISE_DETAIL_SECTION_LABELS.loadType} value={tipoCarga} />
            <FieldCell label={EXERCISE_DETAIL_SECTION_LABELS.laterality} value={laterality} />
            <FieldCell label={EXERCISE_DETAIL_SECTION_LABELS.mechanicalLoad} value={mechanical} />
            <FieldCell label={EXERCISE_DETAIL_SECTION_LABELS.axialLoad} value={axial} />
            <FieldCell label={EXERCISE_DETAIL_SECTION_LABELS.stimulusType} value={stimulus} />
        </div>
    );
};
