/**
 * ExerciseDetail.tsx — Detalle de ejercicio (API) o borrador local (ex-new-* + location.state)
 */

import React, { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useGetExerciseByIdQuery } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import {
    getMuscleLabel,
    getEquipmentLabel,
    getLevelLabel,
    getLevelBadgeColor,
    getMuscleGradient,
    localViewToExercise,
    equipmentParts,
} from "@/utils/exercises";
import type { LocalExerciseView } from "@/types/exerciseLocal";

import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { ExerciseAlternativesSection } from "@/components/exercises/ExerciseAlternativesSection";

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

    const primaryMuscle = useMemo(() => {
        if (!exercise?.musculatura_principal) return "";
        return exercise.musculatura_principal.split(",")[0].trim();
    }, [exercise?.musculatura_principal]);

    const secondaryMuscles = useMemo(() => {
        if (!exercise?.musculatura_secundaria) return [];
        return exercise.musculatura_secundaria
            .split(",")
            .map((m) => m.trim())
            .filter((m) => m.length > 0);
    }, [exercise?.musculatura_secundaria]);

    const equipmentList = useMemo(
        () => equipmentParts(exercise?.equipo),
        [exercise?.equipo]
    );

    if (!routeId) {
        return (
            <div className="px-4 lg:px-8">
                <Alert variant="error">ID de ejercicio inválido</Alert>
                <Button onClick={handleBack} className="mt-4">
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    if (isLocalRoute && !localPayload) {
        return (
            <div className="px-4 lg:px-8">
                <Alert variant="error">
                    Este ejercicio solo estaba disponible en la navegación anterior. Abre de nuevo el
                    listado y selecciónalo desde ahí, o recarga la página de ejercicios.
                </Alert>
                <Button onClick={handleBack} className="mt-4">
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    if (!isLocalRoute && !hasValidNumericId) {
        return (
            <div className="px-4 lg:px-8">
                <Alert variant="error">ID de ejercicio inválido</Alert>
                <Button onClick={handleBack} className="mt-4">
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    if (!isLocalRoute && isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-muted-foreground">Cargando ejercicio...</p>
            </div>
        );
    }

    if (!isLocalRoute && (isError || !exercise)) {
        return (
            <div className="px-4 lg:px-8">
                <Alert variant="error">
                    Error al cargar el ejercicio. Por favor, intenta de nuevo.
                    {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data && (
                        <div className="mt-2 text-sm">
                            {String((error.data as { detail?: unknown }).detail)}
                        </div>
                    )}
                </Alert>
                <Button onClick={handleBack} className="mt-4">
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    if (!exercise) {
        return null;
    }

    return (
        <>
            <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                <Button variant="outline" size="sm" onClick={handleBack} className="mb-4">
                    ← Volver a Ejercicios
                </Button>
                {isLocalRoute && (
                    <Alert variant="warning" className="mb-4">
                        Ejercicio solo en esta sesión (no guardado en el servidor).
                    </Alert>
                )}
                <h2 className="text-2xl font-bold text-foreground md:text-3xl mb-2">{exerciseDisplayName(exercise)}</h2>
            </div>

            <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl backdrop-blur-sm lg:p-8">
                    <div
                        className={`mb-6 flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br ${getMuscleGradient(primaryMuscle)}`}
                    >
                        <div className="text-6xl font-bold text-white opacity-50">💪</div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Grupo Muscular Principal
                            </p>
                            {primaryMuscle ? (
                                <p className="text-base font-semibold text-foreground">
                                    {getMuscleLabel(primaryMuscle)}
                                </p>
                            ) : (
                                <p className="text-base text-muted-foreground">No especificado</p>
                            )}
                        </div>

                        <div>
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Nivel
                            </p>
                            {exercise.nivel ? (
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${getLevelBadgeColor(exercise.nivel)}`}
                                >
                                    {getLevelLabel(exercise.nivel)}
                                </span>
                            ) : (
                                <p className="text-base text-muted-foreground">No especificado</p>
                            )}
                        </div>
                    </div>

                    {secondaryMuscles.length > 0 && (
                        <div className="mb-6">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Músculos Secundarios
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {secondaryMuscles.map((muscle, index) => (
                                    <span
                                        key={`${muscle}-${index}`}
                                        className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-foreground"
                                    >
                                        {getMuscleLabel(muscle)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {exercise.equipo && (
                        <div className="mb-6">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Equipamiento
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {equipmentList.length > 0 ? (
                                    equipmentList.map((eq) => (
                                        <span
                                            key={eq}
                                            className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary"
                                        >
                                            {getEquipmentLabel(eq)}
                                        </span>
                                    ))
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                                        {getEquipmentLabel(exercise.equipo)}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {localPayload?.videoUrl ? (
                        <div className="mb-6">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Video
                            </p>
                            <a
                                href={localPayload.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                            >
                                Abrir enlace de video
                            </a>
                        </div>
                    ) : null}

                    {exercise.descripcion && (
                        <div className="mb-6">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Descripción
                            </p>
                            <p className="text-base leading-relaxed text-muted-foreground">{exercise.descripcion}</p>
                        </div>
                    )}

                    {exercise.instrucciones && (
                        <div className="mb-6">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Instrucciones
                            </p>
                            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                                {exercise.instrucciones}
                            </p>
                        </div>
                    )}

                    {exercise.notas && (
                        <div className="mb-6">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Notas
                            </p>
                            <p className="text-base leading-relaxed text-muted-foreground">{exercise.notas}</p>
                        </div>
                    )}

                    {!isLocalRoute && exerciseIdForApi ? (
                        <ExerciseAlternativesSection exerciseId={exerciseIdForApi} />
                    ) : null}
                </div>
            </div>
        </>
    );
};
