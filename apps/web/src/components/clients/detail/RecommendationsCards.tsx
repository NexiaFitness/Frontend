/**
 * RecommendationsCards.tsx — Bloque 3-card: Volume, Intensidad, Selección de ejercicios
 *
 * Contexto:
 * - Consume GET /training-plans/recommendations/{client_id}
 * - Muestra recomendaciones automáticas del sistema (solo lectura)
 * - Estados: loading, error, incompleto (ficha cliente), completo (3 cards)
 * - Diseño Lovable: Zap header, Dumbbell/Flame/Zap por card
 *
 * @author Frontend Team
 * @since Fase 2 - Alineación documento canónico
 */

import React from "react";
import { Zap, Dumbbell, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTrainingPlanRecommendationsQuery } from "@nexia/shared/api/trainingPlansApi";
import type {
    TrainingPlanRecommendationsResponse,
    VolumeRecommendation,
    IntensityRecommendation,
    ExerciseSelectionRecommendation,
} from "@nexia/shared/types/trainingRecommendations";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";

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
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-primary/20 bg-primary/10 p-6">
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
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" aria-hidden />
                    <h3 className="text-sm font-semibold text-foreground">Recomendaciones de plan</h3>
                </div>
                <p className="text-sm text-destructive">{message}</p>
            </div>
        );
    }

    if (!data) return null;

    const response = data as TrainingPlanRecommendationsResponse;

    if (response.status === "incomplete") {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" aria-hidden />
                    <h3 className="text-sm font-semibold text-foreground">Recomendaciones de plan</h3>
                </div>
                <p className="text-sm text-muted-foreground">{response.message}</p>
                <p className="text-xs text-muted-foreground">
                    Completa en la ficha del cliente:{" "}
                    {response.missing_fields.join(", ")}.
                </p>
            </div>
        );
    }

    const { recommendations } = response;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" aria-hidden />
                <h3 className="text-sm font-semibold text-foreground">Recomendaciones de plan</h3>
            </div>
            <p className="text-xs text-muted-foreground">
                Salida automática según experiencia, frecuencia y duración de sesión.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <RecommendationCard
                    variant="primary"
                    icon={<Dumbbell className="h-3.5 w-3.5 text-primary" aria-hidden />}
                    title="Volumen"
                    subtitle={recommendations.volume.level_es}
                    content={<VolumeCardContent rec={recommendations.volume} />}
                />
                <RecommendationCard
                    variant="warning"
                    icon={<Flame className="h-3.5 w-3.5 text-warning" aria-hidden />}
                    title="Intensidad"
                    subtitle={recommendations.intensity.level_es}
                    content={<IntensityCardContent rec={recommendations.intensity} />}
                />
                <RecommendationCard
                    variant="info"
                    icon={<Zap className="h-3.5 w-3.5 text-info" aria-hidden />}
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

type RecommendationCardVariant = "primary" | "warning" | "info";

const recommendationCardTone: Record<
    RecommendationCardVariant,
    { shell: string; title: string; subtitle: string }
> = {
    primary: {
        shell: "border-primary/20 bg-primary/10",
        title: "text-primary/70",
        subtitle: "text-primary",
    },
    warning: {
        shell: "border-warning/20 bg-warning/10",
        title: "text-warning/70",
        subtitle: "text-warning",
    },
    info: {
        shell: "border-info/20 bg-info/10",
        title: "text-info/70",
        subtitle: "text-info",
    },
};

interface RecommendationCardProps {
    variant: RecommendationCardVariant;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    content: React.ReactNode;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
    variant,
    icon,
    title,
    subtitle,
    content,
}) => {
    const tone = recommendationCardTone[variant] ?? recommendationCardTone.primary;
    return (
        <div
            className={cn(
                "rounded-lg border p-4 space-y-2",
                tone.shell,
            )}
        >
            <div className="flex items-center gap-2">
                {icon}
                <span className={cn("text-xs font-semibold", tone.title)}>{title}</span>
            </div>
            <span className={cn("text-sm font-bold tabular-nums leading-none", tone.subtitle)}>
                {subtitle}
            </span>
            <div className="space-y-1.5">{content}</div>
        </div>
    );
};

const VolumeCardContent: React.FC<{ rec: VolumeRecommendation }> = ({ rec }) => (
    <>
        <p className="text-sm font-semibold text-primary">{rec.range}</p>
        <p className="text-[11px] text-primary/60 leading-relaxed">{rec.explanation}</p>
    </>
);

const IntensityCardContent: React.FC<{
    rec: IntensityRecommendation;
}> = ({ rec }) => (
    <>
        {rec.rpe_range && (
            <p className="text-sm text-warning">
                <span className="text-warning/70">RPE:</span> {rec.rpe_range}
            </p>
        )}
        {rec.rir_range && (
            <p className="text-sm text-warning">
                <span className="text-warning/70">RIR:</span> {rec.rir_range}
            </p>
        )}
        {rec.percent_1rm_range && (
            <p className="text-sm text-warning">
                <span className="text-warning/70">%1RM:</span> {rec.percent_1rm_range}
            </p>
        )}
        <p className="text-[11px] text-warning/65 leading-relaxed">{rec.explanation}</p>
    </>
);

const ExerciseSelectionCardContent: React.FC<{
    rec: ExerciseSelectionRecommendation;
}> = ({ rec }) => (
    <>
        {rec.categories && rec.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
                {rec.categories.map((c) => (
                    <span
                        key={c}
                        className="rounded-full border border-info/25 bg-info/10 px-2 py-0.5 text-[10px] font-medium text-info"
                    >
                        {c}
                    </span>
                ))}
            </div>
        )}
        <p className="text-[11px] text-info/65 leading-relaxed">{rec.explanation}</p>
    </>
);
