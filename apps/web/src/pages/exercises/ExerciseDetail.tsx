/**
 * ExerciseDetail.tsx — Detalle de ejercicio (API) o borrador local (ex-new-* + location.state)
 *
 * Diseño: docs/design/00_LEEME_PRIMERO.md
 */

import React, { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useGetExerciseByIdQuery } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import {
    formatEquipmentLabelLine,
    getLevelLabel,
    localViewToExercise,
    equipmentDisplayLine,
    tipoLabelFromBackend,
    isComplexExerciseTipo,
    normalizeLevel,
    getLevelTextClass,
    getMuscleLabel,
} from "@/utils/exercises";
import { ExercisePrimeMoverBadges } from "@/components/exercises/ExercisePrimeMoverBadges";
import { tipoCargaLabel, catalogRoleLabel } from "@/utils/exercises/exerciseDetailLabels";
import type { LocalExerciseView } from "@/types/exerciseLocal";

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
import {
    EXERCISE_DETAIL_ALERT_SPACING,
    EXERCISE_DETAIL_BACK_BUTTON,
    EXERCISE_DETAIL_BADGE_MUTED,
    EXERCISE_DETAIL_BADGE_NEUTRAL,
    EXERCISE_DETAIL_BADGE_ROW,
    EXERCISE_DETAIL_COMPLEX_TYPE_BADGE,
    EXERCISE_DETAIL_BODY,
    EXERCISE_DETAIL_BODY_MUTED,
    EXERCISE_DETAIL_BODY_MUTED_PRESERVE,
    EXERCISE_DETAIL_ERROR_ACTION,
    EXERCISE_DETAIL_ERROR_DETAIL,
    EXERCISE_DETAIL_HEADER,
    EXERCISE_DETAIL_ICON_BACK_GAP,
    EXERCISE_DETAIL_ICON_SM,
    EXERCISE_DETAIL_ICON_XS,
    EXERCISE_DETAIL_LAYOUT,
    EXERCISE_DETAIL_LEVEL_BADGE,
    EXERCISE_DETAIL_LOADING_ROW,
    EXERCISE_DETAIL_LOADING_TEXT,
    EXERCISE_DETAIL_META_DIVIDER,
    EXERCISE_DETAIL_MUSCLE_BADGE,
    EXERCISE_DETAIL_PAGE,
    EXERCISE_DETAIL_SECTION_LABELS,
    EXERCISE_DETAIL_SHELL,
    EXERCISE_DETAIL_SPEC_LABEL,
    EXERCISE_DETAIL_TITLE_WRAP,
    EXERCISE_DETAIL_VIDEO_HERO,
    EXERCISE_DETAIL_VIDEO_LINK_CENTERED,
} from "@/components/exercises/exerciseDetailPresentation";
import { cn } from "@/lib/utils";

interface LocationState {
    localExercise?: LocalExerciseView;
}

export const ExerciseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const routeId = id ? decodeURIComponent(id) : "";
    const isLocalRoute = routeId.startsWith("ex-new");
    const locationState = location.state as LocationState | null;

    const numericId = routeId ? parseInt(routeId, 10) : NaN;
    const hasValidNumericId = !Number.isNaN(numericId) && numericId > 0;

    const { data: apiExercise, isLoading, isError, error } = useGetExerciseByIdQuery(numericId, {
        skip: isLocalRoute || !hasValidNumericId,
    });

    const localPayload = useMemo(() => {
        if (!isLocalRoute) return undefined;
        const l = locationState?.localExercise;
        if (l && l.rowId === routeId) return l;
        return undefined;
    }, [isLocalRoute, locationState?.localExercise, routeId]);

    const exercise: Exercise | undefined = useMemo(() => {
        if (isLocalRoute) {
            if (!localPayload) return undefined;
            return localViewToExercise(localPayload);
        }
        return apiExercise;
    }, [isLocalRoute, localPayload, apiExercise]);

    const exerciseIdForApi = hasValidNumericId ? numericId : null;

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
    const hasVideo = Boolean(localPayload?.videoUrl);

    const contentFieldCount = [
        exercise?.descripcion,
        exercise?.instrucciones,
        exercise?.notas,
    ].filter(Boolean).length;

    if (!routeId) {
        return (
            <div className={EXERCISE_DETAIL_PAGE}>
                <Alert variant="error">ID de ejercicio inválido</Alert>
                <Button onClick={handleBack} className={EXERCISE_DETAIL_ERROR_ACTION}>
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    if (isLocalRoute && !localPayload) {
        return (
            <div className={EXERCISE_DETAIL_PAGE}>
                <Alert variant="error">
                    Este ejercicio solo estaba disponible en la navegación anterior. Abre de nuevo el
                    listado y selecciónalo desde ahí, o recarga la página de ejercicios.
                </Alert>
                <Button onClick={handleBack} className={EXERCISE_DETAIL_ERROR_ACTION}>
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    if (!isLocalRoute && !hasValidNumericId) {
        return (
            <div className={EXERCISE_DETAIL_PAGE}>
                <Alert variant="error">ID de ejercicio inválido</Alert>
                <Button onClick={handleBack} className={EXERCISE_DETAIL_ERROR_ACTION}>
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    if (!isLocalRoute && isLoading) {
        return (
            <div className={EXERCISE_DETAIL_LOADING_ROW}>
                <LoadingSpinner size="lg" />
                <p className={EXERCISE_DETAIL_LOADING_TEXT}>Cargando ejercicio...</p>
            </div>
        );
    }

    if (!isLocalRoute && (isError || !exercise)) {
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

    if (!exercise) {
        return null;
    }

    const subtitleParts = [equipLine, exercise.nivel ? getLevelLabel(exercise.nivel) : ""]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className={EXERCISE_DETAIL_PAGE}>
            {isLocalRoute && (
                <Alert variant="warning" className={EXERCISE_DETAIL_ALERT_SPACING}>
                    Ejercicio solo en esta sesión (no guardado en el servidor).
                </Alert>
            )}

            <div className={EXERCISE_DETAIL_HEADER}>
                <PageTitle
                    title={exerciseDisplayName(exercise)}
                    subtitle={subtitleParts || undefined}
                    className={EXERCISE_DETAIL_TITLE_WRAP}
                />
                <Button
                    variant="ghost-primary"
                    size="sm"
                    className={EXERCISE_DETAIL_BACK_BUTTON}
                    onClick={handleBack}
                >
                    <ArrowLeft className={cn(EXERCISE_DETAIL_ICON_BACK_GAP, EXERCISE_DETAIL_ICON_SM)} aria-hidden />
                    Volver a Ejercicios
                </Button>
            </div>

            <article className={EXERCISE_DETAIL_SHELL}>
                <NexiaGlassAccentRim />
                {hasVideo ? (
                    <div className={EXERCISE_DETAIL_VIDEO_HERO}>
                        <p className={EXERCISE_DETAIL_SPEC_LABEL}>{EXERCISE_DETAIL_SECTION_LABELS.video}</p>
                        <a
                            href={localPayload?.videoUrl ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={EXERCISE_DETAIL_VIDEO_LINK_CENTERED}
                        >
                            Abrir enlace de video
                            <ExternalLink className={EXERCISE_DETAIL_ICON_XS} aria-hidden />
                        </a>
                    </div>
                ) : (
                    <ExerciseMediaEmptyState />
                )}

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
                        {!isLocalRoute && exerciseIdForApi ? (
                            <div className="order-2 min-w-0 lg:sticky lg:top-4 lg:col-start-2 lg:row-start-1 lg:self-start">
                                <ExerciseAlternativesSection
                                    exerciseId={exerciseIdForApi}
                                    variant="sidebar"
                                />
                            </div>
                        ) : null}

                        <div className="order-3 min-w-0 space-y-5 lg:col-start-1 lg:row-start-1">
                            <ExerciseDetailExpandableSection
                                id="exercise-planning-section"
                                title={EXERCISE_DETAIL_SECTION_LABELS.advancedPlanning}
                            >
                                <ExerciseDetailCatalogSections exercise={exercise} />
                            </ExerciseDetailExpandableSection>

                            {contentFieldCount > 0 ? (
                                <ExerciseDetailExpandableSection
                                    id="exercise-content-section"
                                    title={EXERCISE_DETAIL_SECTION_LABELS.exerciseContent}
                                    badge={String(contentFieldCount)}
                                    defaultOpen
                                >
                                    <div className="space-y-5">
                                        {exercise.descripcion ? (
                                            <div>
                                                <p className={EXERCISE_DETAIL_SPEC_LABEL}>
                                                    {EXERCISE_DETAIL_SECTION_LABELS.description}
                                                </p>
                                                <p className={EXERCISE_DETAIL_BODY_MUTED}>
                                                    {exercise.descripcion}
                                                </p>
                                            </div>
                                        ) : null}
                                        {exercise.instrucciones ? (
                                            <div>
                                                <p className={EXERCISE_DETAIL_SPEC_LABEL}>
                                                    {EXERCISE_DETAIL_SECTION_LABELS.instructions}
                                                </p>
                                                <p className={EXERCISE_DETAIL_BODY_MUTED_PRESERVE}>
                                                    {exercise.instrucciones}
                                                </p>
                                            </div>
                                        ) : null}
                                        {exercise.notas ? (
                                            <div>
                                                <p className={EXERCISE_DETAIL_SPEC_LABEL}>
                                                    {EXERCISE_DETAIL_SECTION_LABELS.notes}
                                                </p>
                                                <p className={EXERCISE_DETAIL_BODY_MUTED}>
                                                    {exercise.notas}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                </ExerciseDetailExpandableSection>
                            ) : null}
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};
