/**
 * ExerciseDetailCatalogSections.tsx — Secciones catálogo ampliadas (joint actions, tags, motor).
 *
 * Doc: docs/catalogo-ejercicios/03_VISTA_EJERCICIO_COMPLETA.md
 * Design: docs/design/01_PREMIUM_PLATFORM_MIGRATION.md
 */

import React, { useMemo } from "react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import {
    EXERCISE_DETAIL_CHIP_ROW,
    EXERCISE_DETAIL_EMPTY_VALUE,
    EXERCISE_DETAIL_GRID_SPAN_FULL,
    EXERCISE_DETAIL_JOINT_CHIP,
    EXERCISE_DETAIL_SECTION_BLOCK,
    EXERCISE_DETAIL_SECTION_HEADING,
    EXERCISE_DETAIL_SECTION_LABELS,
    EXERCISE_DETAIL_SPEC_GRID,
    EXERCISE_DETAIL_SPEC_LABEL,
    EXERCISE_DETAIL_SPEC_VALUE,
    EXERCISE_DETAIL_TAG_CHIP,
} from "@/components/exercises/exerciseDetailPresentation";
import {
    axialLoadLabel,
    EXERCISE_DETAIL_EMPTY_COPY,
    jointActionDisplayLine,
    lateralityLabel,
    mechanicalLoadLabel,
    stimulusTypeLabel,
    tagDisplayLabel,
    tipoCargaLabel,
} from "@/utils/exercises/exerciseDetailLabels";
import { exercisePatternLabels } from "@/utils/exercises";

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
    const patternLines = useMemo(() => {
        const patterns = exercise.movement_patterns ?? [];
        if (patterns.length === 0) return exercisePatternLabels(exercise);
        return patterns.map((p) => {
            const name = (p.name_es?.trim() || p.name_en || "").trim();
            const role = p.role?.trim();
            return role ? `${name} (${role})` : name;
        });
    }, [exercise]);

    const tagLabels = useMemo(
        () => (exercise.tags ?? []).map(tagDisplayLabel).filter(Boolean),
        [exercise.tags]
    );

    const jointLines = useMemo(
        () =>
            (exercise.joint_action_details ?? [])
                .map(jointActionDisplayLine)
                .filter(Boolean),
        [exercise.joint_action_details]
    );

    const tipoCarga = tipoCargaLabel(exercise.tipo_carga);
    const laterality = lateralityLabel(exercise.laterality);
    const mechanical = mechanicalLoadLabel(exercise.mechanical_load_level);
    const axial = axialLoadLabel(exercise.axial_load);
    const stimulus = stimulusTypeLabel(exercise.stimulus_type);

    return (
        <div className={EXERCISE_DETAIL_SECTION_BLOCK}>
            <section aria-labelledby="exercise-catalog-planning">
                <h3 id="exercise-catalog-planning" className={EXERCISE_DETAIL_SECTION_HEADING}>
                    {EXERCISE_DETAIL_SECTION_LABELS.catalogPlanning}
                </h3>
                <div className={`${EXERCISE_DETAIL_SPEC_GRID} mt-4`}>
                    <FieldCell
                        label={EXERCISE_DETAIL_SECTION_LABELS.loadType}
                        value={tipoCarga}
                    />
                    <FieldCell
                        label={EXERCISE_DETAIL_SECTION_LABELS.laterality}
                        value={laterality}
                    />
                    <FieldCell
                        label={EXERCISE_DETAIL_SECTION_LABELS.mechanicalLoad}
                        value={mechanical}
                    />
                    <FieldCell
                        label={EXERCISE_DETAIL_SECTION_LABELS.axialLoad}
                        value={axial}
                    />
                    <FieldCell
                        label={EXERCISE_DETAIL_SECTION_LABELS.stimulusType}
                        value={stimulus}
                    />
                </div>
            </section>

            <section aria-labelledby="exercise-catalog-biomechanics">
                <h3 id="exercise-catalog-biomechanics" className={EXERCISE_DETAIL_SECTION_HEADING}>
                    {EXERCISE_DETAIL_SECTION_LABELS.catalogBiomechanics}
                </h3>
                <div className={`${EXERCISE_DETAIL_SPEC_GRID} mt-4`}>
                    <div className={EXERCISE_DETAIL_GRID_SPAN_FULL}>
                        <p className={EXERCISE_DETAIL_SPEC_LABEL}>
                            {EXERCISE_DETAIL_SECTION_LABELS.movementPattern}
                        </p>
                        {patternLines.length > 0 ? (
                            <p className={EXERCISE_DETAIL_SPEC_VALUE}>{patternLines.join(", ")}</p>
                        ) : (
                            <p className={EXERCISE_DETAIL_EMPTY_VALUE}>{EXERCISE_DETAIL_EMPTY_COPY}</p>
                        )}
                    </div>

                    <div className={EXERCISE_DETAIL_GRID_SPAN_FULL}>
                        <p className={EXERCISE_DETAIL_SPEC_LABEL}>
                            {EXERCISE_DETAIL_SECTION_LABELS.jointActions}
                        </p>
                        {jointLines.length > 0 ? (
                            <div className={EXERCISE_DETAIL_CHIP_ROW}>
                                {jointLines.map((line) => (
                                    <span key={line} className={EXERCISE_DETAIL_JOINT_CHIP}>
                                        {line}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className={EXERCISE_DETAIL_EMPTY_VALUE}>{EXERCISE_DETAIL_EMPTY_COPY}</p>
                        )}
                    </div>

                    <div className={EXERCISE_DETAIL_GRID_SPAN_FULL}>
                        <p className={EXERCISE_DETAIL_SPEC_LABEL}>
                            {EXERCISE_DETAIL_SECTION_LABELS.tags}
                        </p>
                        {tagLabels.length > 0 ? (
                            <div className={EXERCISE_DETAIL_CHIP_ROW}>
                                {tagLabels.map((tag) => (
                                    <span key={tag} className={EXERCISE_DETAIL_TAG_CHIP}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className={EXERCISE_DETAIL_EMPTY_VALUE}>{EXERCISE_DETAIL_EMPTY_COPY}</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};
