/**
 * ExerciseDetailTrainerEssentials.tsx — Strip horizontal de metadata del detalle.
 *
 * Zonas: Equipamiento (+ etiquetas) · Biomecánica · Músculos secundarios.
 * Spec: docs/catalogo-ejercicios/03_VISTA_EJERCICIO_COMPLETA.md §5
 */

import React, { useMemo } from "react";
import { Activity, Dumbbell, Move } from "lucide-react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import {
    EXERCISE_DETAIL_EMPTY_VALUE,
    EXERCISE_DETAIL_METADATA_CHIP,
    EXERCISE_DETAIL_METADATA_CHIP_MUTED,
    EXERCISE_DETAIL_METADATA_CHIP_ROW,
    EXERCISE_DETAIL_METADATA_DIVIDER,
    EXERCISE_DETAIL_METADATA_EQUIP_CHIP,
    EXERCISE_DETAIL_METADATA_ROLE_BADGE,
    EXERCISE_DETAIL_METADATA_STRIP,
    EXERCISE_DETAIL_METADATA_SUBLABEL,
    EXERCISE_DETAIL_METADATA_VALUE,
    EXERCISE_DETAIL_METADATA_VALUE_MUTED,
    EXERCISE_DETAIL_METADATA_ZONE,
    EXERCISE_DETAIL_METADATA_ZONE_BODY,
    EXERCISE_DETAIL_METADATA_ZONE_HEADER,
    EXERCISE_DETAIL_METADATA_ZONE_ICON,
    EXERCISE_DETAIL_METADATA_ZONE_LABEL,
    EXERCISE_DETAIL_SECTION_LABELS,
} from "@/components/exercises/exerciseDetailPresentation";
import {
    EXERCISE_DETAIL_EMPTY_COPY,
    exerciseTagItems,
    jointActionDisplayLine,
} from "@/utils/exercises/exerciseDetailLabels";
import { exercisePatternLabels } from "@/utils/exercises";

export interface SecondaryMuscleChip {
    id: string;
    label: string;
    roleLabel?: string;
}

export interface ExerciseDetailTrainerEssentialsProps {
    exercise: Exercise;
    equipmentLabels: string[];
    secondaryMuscleItems: SecondaryMuscleChip[];
}

function formatPatternRole(role?: string | null): string | null {
    if (!role?.trim()) return null;
    const norm = role.trim().toLowerCase();
    if (norm === "primary") return "Principal";
    if (norm === "secondary") return "Secundario";
    return role.trim();
}

function MetadataZone({
    icon: Icon,
    label,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className={EXERCISE_DETAIL_METADATA_ZONE}>
            <div className={EXERCISE_DETAIL_METADATA_ZONE_HEADER}>
                <Icon className={EXERCISE_DETAIL_METADATA_ZONE_ICON} aria-hidden />
                <span className={EXERCISE_DETAIL_METADATA_ZONE_LABEL}>{label}</span>
            </div>
            <div className={EXERCISE_DETAIL_METADATA_ZONE_BODY}>{children}</div>
        </div>
    );
}

function ZoneDivider() {
    return <div className={EXERCISE_DETAIL_METADATA_DIVIDER} aria-hidden />;
}

export const ExerciseDetailTrainerEssentials: React.FC<ExerciseDetailTrainerEssentialsProps> = ({
    exercise,
    equipmentLabels,
    secondaryMuscleItems,
}) => {
    const patternItems = useMemo(() => {
        const patterns = exercise.movement_patterns ?? [];
        if (patterns.length === 0) {
            return exercisePatternLabels(exercise).map((name) => ({ name, role: null as string | null }));
        }
        return patterns.map((p) => ({
            name: (p.name_es?.trim() || p.name_en || "").trim(),
            role: formatPatternRole(p.role),
        }));
    }, [exercise]);

    const tagItems = useMemo(() => exerciseTagItems(exercise.tags), [exercise.tags]);

    const jointLines = useMemo(
        () =>
            (exercise.joint_action_details ?? [])
                .map(jointActionDisplayLine)
                .filter(Boolean),
        [exercise.joint_action_details]
    );

    const hasSecondaryMuscles = secondaryMuscleItems.length > 0;

    return (
        <div className={EXERCISE_DETAIL_METADATA_STRIP}>
            <MetadataZone icon={Dumbbell} label={EXERCISE_DETAIL_SECTION_LABELS.equipment}>
                {equipmentLabels.length > 0 ? (
                    <div className={EXERCISE_DETAIL_METADATA_CHIP_ROW}>
                        {equipmentLabels.map((eq) => (
                            <span key={`eq-${eq}`} className={EXERCISE_DETAIL_METADATA_EQUIP_CHIP}>
                                {eq}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className={EXERCISE_DETAIL_METADATA_VALUE_MUTED}>{EXERCISE_DETAIL_EMPTY_COPY}</p>
                )}
                {tagItems.length > 0 ? (
                    <div className="space-y-1.5">
                        <p className={EXERCISE_DETAIL_METADATA_SUBLABEL}>
                            {EXERCISE_DETAIL_SECTION_LABELS.tags}
                        </p>
                        <div className={EXERCISE_DETAIL_METADATA_CHIP_ROW}>
                            {tagItems.map((tag) => (
                                <span key={`tag-${tag.id}`} className={EXERCISE_DETAIL_METADATA_CHIP}>
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}
            </MetadataZone>

            <ZoneDivider />

            <MetadataZone icon={Move} label="Biomecánica">
                {patternItems.length > 0 ? (
                    <div className="space-y-1.5">
                        {patternItems.map((item) => (
                            <p key={`${item.name}-${item.role ?? "na"}`} className={EXERCISE_DETAIL_METADATA_VALUE}>
                                {item.name}
                                {item.role ? (
                                    <span className={EXERCISE_DETAIL_METADATA_ROLE_BADGE}>{item.role}</span>
                                ) : null}
                            </p>
                        ))}
                    </div>
                ) : (
                    <p className={EXERCISE_DETAIL_EMPTY_VALUE}>{EXERCISE_DETAIL_EMPTY_COPY}</p>
                )}
                {jointLines.length > 0 ? (
                    <div className={EXERCISE_DETAIL_METADATA_CHIP_ROW}>
                        {jointLines.map((line) => (
                            <span key={line} className={EXERCISE_DETAIL_METADATA_CHIP}>
                                {line}
                            </span>
                        ))}
                    </div>
                ) : null}
            </MetadataZone>

            {hasSecondaryMuscles ? (
                <>
                    <ZoneDivider />
                    <MetadataZone
                        icon={Activity}
                        label={EXERCISE_DETAIL_SECTION_LABELS.secondaryMuscles}
                    >
                        <div className={EXERCISE_DETAIL_METADATA_CHIP_ROW}>
                            {secondaryMuscleItems.map((muscle) => (
                                <span key={muscle.id} className={EXERCISE_DETAIL_METADATA_CHIP_MUTED}>
                                    {muscle.label}
                                    {muscle.roleLabel ? (
                                        <span className={EXERCISE_DETAIL_METADATA_ROLE_BADGE}>
                                            {muscle.roleLabel}
                                        </span>
                                    ) : null}
                                </span>
                            ))}
                        </div>
                    </MetadataZone>
                </>
            ) : null}
        </div>
    );
};
