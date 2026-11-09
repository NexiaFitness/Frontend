/**
 * ExerciseDetail.tsx — Ficha del ejercicio para el entrenador (GET /exercises/{id}).
 *
 * Contexto: H8-B retiró el alta local de la biblioteca (borradores ex-new-* sin servidor) y
 * el bloque de descripción, instrucciones y notas. El texto que se lee es el contenido del
 * ejercicio (ExerciseDetailReadingContent, exercise_content).
 *
 * Diseño: DESIGN_PREMIUM.md (raíz)
 */

import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlatformHeaderBackButton } from "@/components/ui/surface/PlatformHeaderBackButton";
import { useGetExerciseByIdQuery } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import {
    formatEquipmentLabelLine,
    getLevelLabel,
    equipmentDisplayLine,
    tipoLabelFromBackend,
    isComplexExerciseTipo,
    normalizeLevel,
    getLevelTextClass,
    getMuscleLabel,
} from "@/utils/exercises";
import { ExercisePrimeMoverBadges } from "@/components/exercises/ExercisePrimeMoverBadges";
import { tipoCargaLabel, catalogRoleLabel } from "@/utils/exercises/exerciseDetailLabels";

import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { ExerciseMediaEmptyState } from "@/components/exercises/ExerciseMediaEmptyState";
import { ExerciseAlternativesSection } from "@/components/exercises/ExerciseAlternativesSection";
import { ExerciseDetailCatalogSections } from "@/components/exercises/ExerciseDetailCatalogSections";
import { ExerciseDetailExpandableSection } from "@/components/exercises/ExerciseDetailExpandableSection";
import { ExerciseDetailTrainerEssentials } from "@/components/exercises/ExerciseDetailTrainerEssentials";
import { ExerciseDetailReadingContent } from "@/components/exercises/ExerciseDetailReadingContent";
import {
    EXERCISE_DETAIL_BADGE_MUTED,
    EXERCISE_DETAIL_BADGE_NEUTRAL,
    EXERCISE_DETAIL_BADGE_ROW,
    EXERCISE_DETAIL_COMPLEX_TYPE_BADGE,
    EXERCISE_DETAIL_BODY,
    EXERCISE_DETAIL_ERROR_ACTION,
    EXERCISE_DETAIL_ERROR_DETAIL,
    EXERCISE_DETAIL_HEADER,
    EXERCISE_DETAIL_LAYOUT,
    EXERCISE_DETAIL_LEVEL_BADGE,
    EXERCISE_DETAIL_LOADING_ROW,
    EXERCISE_DETAIL_LOADING_TEXT,
    EXERCISE_DETAIL_META_DIVIDER,
    EXERCISE_DETAIL_MUSCLE_BADGE,
    EXERCISE_DETAIL_PAGE,
    EXERCISE_DETAIL_SECTION_LABELS,
    EXERCISE_DETAIL_SHELL,
    EXERCISE_DETAIL_TITLE_WRAP,
} from "@/components/exercises/exerciseDetailPresentation";
import { cn } from "@/lib/utils";

export const ExerciseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const routeId = id ? decodeURIComponent(id) : "";
    const numericId = routeId ? parseInt(routeId, 10) : NaN;
    const hasValidNumericId = !Number.isNaN(numericId) && numericId > 0;

    const { data: exercise, isLoading, isError, error } = useGetExerciseByIdQuery(numericId, {
        skip: !hasValidNumericId,
    });

    const handleBack = () => {
        navigate("/dashboard/exercises");
    };

    const secondaryMuscleItems = useMemo(() => {
        if (!exercise) return [];
        const fromCatalog = (exercise.muscles || [])
            .filter((m) => {
                const role = (m.role || "").toLowerCase().replace(/\s+/g, "_");
                return role && role !== "prime_mover" && role !== "primary";
            })
            .map((m) => {
                const label = getMuscleLabel((m.name_es || m.name || m.name_en || "").trim());
                const roleLabel = catalogRoleLabel(m.role);
                return {
                    id: `${label}-${m.role ?? "na"}`,
                    label,
                    roleLabel: roleLabel || undefined,
                };
            })
            .filter((item) => item.label);
        if (fromCatalog.length > 0) return fromCatalog;
        if (!exercise.musculatura_secundaria) return [];
        return exercise.musculatura_secundaria
            .split(",")
            .map((m) => m.trim())
            .filter((m) => m.length > 0)
            .map((name, index) => ({
                id: `legacy-${name}-${index}`,
                label: getMuscleLabel(name),
            }));
    }, [exercise]);

    const equipmentLabels = useMemo(() => {
        if (!exercise) return [];
        const fromCatalog = (exercise.equipment || [])
            .map((item) => (item.name_es?.trim() || item.name_en || "").trim())
            .filter(Boolean);
        if (fromCatalog.length > 0) return fromCatalog;
        const legacy = (exercise.equipo || "").trim();
        if (legacy && legacy.toLowerCase() !== "none") {
            const legacyLine = formatEquipmentLabelLine(legacy);
            if (legacyLine) {
                return legacyLine.split(", ");
            }
        }
        return [];
    }, [exercise]);

    const levelNorm = normalizeLevel(exercise?.nivel || "");
    const levelClass = getLevelTextClass(levelNorm);
    const tipoLabel = tipoLabelFromBackend(exercise?.tipo || "");
    const tipoBadgeClass = isComplexExerciseTipo(exercise?.tipo || "")
        ? EXERCISE_DETAIL_COMPLEX_TYPE_BADGE
        : EXERCISE_DETAIL_BADGE_NEUTRAL;
    const tipoCarga = tipoCargaLabel(exercise?.tipo_carga);
    const equipLine = exercise ? equipmentDisplayLine(exercise) : "";

    if (!hasValidNumericId) {
        return (
            <div className={EXERCISE_DETAIL_PAGE}>
                <Alert variant="error">ID de ejercicio inválido</Alert>
                <Button onClick={handleBack} className={EXERCISE_DETAIL_ERROR_ACTION}>
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={EXERCISE_DETAIL_LOADING_ROW}>
                <LoadingSpinner size="lg" />
                <p className={EXERCISE_DETAIL_LOADING_TEXT}>Cargando ejercicio...</p>
            </div>
        );
    }

    if (isError || !exercise) {
        return (
            <div className={EXERCISE_DETAIL_PAGE}>
                <Alert variant="error">
                    Error al cargar el ejercicio. Por favor, intenta de nuevo.
                    {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data && (
                        <div className={EXERCISE_DETAIL_ERROR_DETAIL}>
                            {String((error.data as { detail?: unknown }).detail)}
                        </div>
                    )}
                </Alert>
                <Button onClick={handleBack} className={EXERCISE_DETAIL_ERROR_ACTION}>
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    const subtitleParts = [equipLine, exercise.nivel ? getLevelLabel(exercise.nivel) : ""]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className={EXERCISE_DETAIL_PAGE}>
            <div className={EXERCISE_DETAIL_HEADER}>
                <PageTitle
                    title={exerciseDisplayName(exercise)}
                    subtitle={subtitleParts || undefined}
                    className={EXERCISE_DETAIL_TITLE_WRAP}
                />
                <PlatformHeaderBackButton onClick={handleBack} label="Volver a Ejercicios" />
            </div>

            <article className={EXERCISE_DETAIL_SHELL}>
                <NexiaGlassAccentRim />
                <ExerciseMediaEmptyState />

                <div className={EXERCISE_DETAIL_BODY}>
                    <div className={cn(EXERCISE_DETAIL_BADGE_ROW, "flex-wrap")}>
                        <ExercisePrimeMoverBadges
                            exercise={exercise}
                            badgeClassName={EXERCISE_DETAIL_MUSCLE_BADGE}
                        />
                        {tipoLabel && (
                            <Badge variant="outline" className={tipoBadgeClass}>
                                {tipoLabel}
                            </Badge>
                        )}
                        {tipoCarga && (
                            <Badge variant="outline" className={EXERCISE_DETAIL_BADGE_MUTED}>
                                {tipoCarga}
                            </Badge>
                        )}
                        {exercise.nivel && (
                            <Badge variant="outline" className={cn(EXERCISE_DETAIL_LEVEL_BADGE, levelClass)}>
                                {getLevelLabel(exercise.nivel)}
                            </Badge>
                        )}
                    </div>

                    <div className={EXERCISE_DETAIL_META_DIVIDER}>
                        <ExerciseDetailTrainerEssentials
                            exercise={exercise}
                            equipmentLabels={equipmentLabels}
                            secondaryMuscleItems={secondaryMuscleItems}
                        />
                    </div>

                    <div className={EXERCISE_DETAIL_LAYOUT}>
                        <div className="order-2 min-w-0 lg:sticky lg:top-4 lg:col-start-2 lg:row-start-1 lg:self-start">
                            <ExerciseAlternativesSection exerciseId={numericId} variant="sidebar" />
                        </div>

                        <div className="order-3 min-w-0 space-y-5 lg:col-start-1 lg:row-start-1">
                            <ExerciseDetailReadingContent exerciseId={numericId} />
                            <ExerciseDetailExpandableSection
                                id="exercise-planning-section"
                                title={EXERCISE_DETAIL_SECTION_LABELS.advancedPlanning}
                            >
                                <ExerciseDetailCatalogSections exercise={exercise} />
                            </ExerciseDetailExpandableSection>

                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};
