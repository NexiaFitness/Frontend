/**
 * RecommendationsCards.tsx — Bloque 3-card: Volume, Intensidad, Selección de ejercicios
 *
 * Contexto:
 * - Consume GET /training-plans/recommendations/{client_id}
 * - Muestra recomendaciones automáticas del sistema (solo lectura)
 * - Estados: loading, error, incompleto (ficha cliente), completo (3 cards)
 *
 * @author Frontend Team
 * @since Fase 2 - Alineación documento canónico
 */

import React from "react";
import { useGetTrainingPlanRecommendationsQuery } from "@nexia/shared/api/trainingPlansApi";
import type {
    TrainingPlanRecommendationsResponse,
    VolumeRecommendation,
    IntensityRecommendation,
    ExerciseSelectionRecommendation,
} from "@nexia/shared/types/trainingRecommendations";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { TYPOGRAPHY } from "@/utils/typography";

interface RecommendationsCardsProps {
    clientId: number;
}

export const RecommendationsCards: React.FC<RecommendationsCardsProps> = ({
    clientId,
}) => {
    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetTrainingPlanRecommendationsQuery(clientId, {
        skip: !clientId || clientId <= 0,
    });

    if (!clientId || clientId <= 0) return null;

    if (isLoading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border bg-surface p-6">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (isError) {
        const message =
            error && typeof error === "object" && "data" in error
                ? String((error as { data?: unknown }).data)
                : "Error al cargar las recomendaciones.";
        return (
            <div className="rounded-lg border border-border bg-surface p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} mb-2 text-foreground`}>
                    Recomendaciones de plan
                </h3>
                <p className="text-sm text-destructive">{message}</p>
            </div>
        );
    }

    if (!data) return null;

    const response = data as TrainingPlanRecommendationsResponse;

    if (response.status === "incomplete") {
        return (
            <div className="rounded-lg border border-border bg-surface p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} mb-2 text-foreground`}>
                    Recomendaciones de plan
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">{response.message}</p>
                <p className="text-xs text-muted-foreground">
                    Completa en la ficha del cliente:{" "}
                    {response.missing_fields.join(", ")}.
                </p>
            </div>
        );
    }

    const { recommendations } = response;

    return (
        <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className={`${TYPOGRAPHY.sectionTitle} mb-1 text-foreground`}>
                Recomendaciones de plan
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
                Salida automática según experiencia, frecuencia y duración de sesión.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RecommendationCard
                    title="Volumen"
                    subtitle={recommendations.volume.level_es}
                    content={<VolumeCardContent rec={recommendations.volume} />}
                />
                <RecommendationCard
                    title="Intensidad"
                    subtitle={recommendations.intensity.level_es}
                    content={<IntensityCardContent rec={recommendations.intensity} />}
                />
                <RecommendationCard
                    title="Selección de ejercicios"
                    subtitle={`${recommendations.exercise_selection.total_exercises_per_session} ejercicios/sesión`}
                    content={
                        <ExerciseSelectionCardContent
                            rec={recommendations.exercise_selection}
                        />
                    }
                />
            </div>
        </div>
    );
};

// ========================================
// HELPERS
// ========================================

interface RecommendationCardProps {
    title: string;
    subtitle: string;
    content: React.ReactNode;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
    title,
    subtitle,
    content,
}) => (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="mt-0.5 text-xs font-medium text-primary">{subtitle}</p>
        <div className="mt-3 text-sm text-muted-foreground">{content}</div>
    </div>
);

const VolumeCardContent: React.FC<{ rec: VolumeRecommendation }> = ({ rec }) => (
    <>
        <p className="font-medium text-foreground">{rec.range}</p>
        <p className="mt-2 text-muted-foreground">{rec.explanation}</p>
    </>
);

const IntensityCardContent: React.FC<{
    rec: IntensityRecommendation;
}> = ({ rec }) => (
    <>
        {rec.rpe_range && (
            <p className="text-foreground">
                <span className="text-muted-foreground">RPE:</span> {rec.rpe_range}
            </p>
        )}
        {rec.rir_range && (
            <p className="text-foreground">
                <span className="text-muted-foreground">RIR:</span> {rec.rir_range}
            </p>
        )}
        {rec.percent_1rm_range && (
            <p className="text-foreground">
                <span className="text-muted-foreground">%1RM:</span> {rec.percent_1rm_range}
            </p>
        )}
        <p className="mt-2 text-muted-foreground">{rec.explanation}</p>
    </>
);

const ExerciseSelectionCardContent: React.FC<{
    rec: ExerciseSelectionRecommendation;
}> = ({ rec }) => (
    <>
        {rec.categories && rec.categories.length > 0 && (
            <p className="text-foreground">{rec.categories.join(", ")}</p>
        )}
        <p className="mt-2 text-muted-foreground">{rec.explanation}</p>
    </>
);
