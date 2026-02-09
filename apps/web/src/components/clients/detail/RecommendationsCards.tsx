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
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[200px]">
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
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-2`}>
                    Recomendaciones de plan
                </h3>
                <p className="text-red-600 text-sm">{message}</p>
            </div>
        );
    }

    if (!data) return null;

    const response = data as TrainingPlanRecommendationsResponse;

    if (response.status === "incomplete") {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-2`}>
                    Recomendaciones de plan
                </h3>
                <p className="text-gray-600 text-sm mb-2">{response.message}</p>
                <p className="text-xs text-gray-500">
                    Completa en la ficha del cliente:{" "}
                    {response.missing_fields.join(", ")}.
                </p>
            </div>
        );
    }

    const { recommendations } = response;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-1`}>
                Recomendaciones de plan
            </h3>
            <p className="text-sm text-gray-500 mb-4">
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
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-primary-600 font-medium mt-0.5">{subtitle}</p>
        <div className="mt-3 text-sm text-gray-700">{content}</div>
    </div>
);

const VolumeCardContent: React.FC<{ rec: VolumeRecommendation }> = ({ rec }) => (
    <>
        <p className="font-medium text-gray-800">{rec.range}</p>
        <p className="mt-2 text-gray-600">{rec.explanation}</p>
    </>
);

const IntensityCardContent: React.FC<{
    rec: IntensityRecommendation;
}> = ({ rec }) => (
    <>
        {rec.rpe_range && (
            <p className="text-gray-800">
                <span className="text-gray-500">RPE:</span> {rec.rpe_range}
            </p>
        )}
        {rec.rir_range && (
            <p className="text-gray-800">
                <span className="text-gray-500">RIR:</span> {rec.rir_range}
            </p>
        )}
        {rec.percent_1rm_range && (
            <p className="text-gray-800">
                <span className="text-gray-500">%1RM:</span>{" "}
                {rec.percent_1rm_range}
            </p>
        )}
        <p className="mt-2 text-gray-600">{rec.explanation}</p>
    </>
);

const ExerciseSelectionCardContent: React.FC<{
    rec: ExerciseSelectionRecommendation;
}> = ({ rec }) => (
    <>
        {rec.categories && rec.categories.length > 0 && (
            <p className="text-gray-800">
                {rec.categories.join(", ")}
            </p>
        )}
        <p className="mt-2 text-gray-600">{rec.explanation}</p>
    </>
);
