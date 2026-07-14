/**
 * SessionDayPlan.tsx — Bloque "Hoy toca" para el builder de sesión
 *
 * Contexto:
 * - Consume GET /training-sessions/recommendations
 * - Muestra plan del día (volumen, intensidad, cualidad) y coherence_warnings
 * - Se usa en CreateSession y EditSession
 * - No bloquea el guardado
 * - Altura: mismo patrón que EmptyStateCard (columna derecha h-full / flex-1)
 *
 * @author Frontend Team
 * @since Fase 3 - Alineación documento canónico
 * @updated v6.5.0 — Contenido y jerarquía visual interna (sin cambiar shell/layout)
 */

import React, { useMemo } from "react";
import { useGetSessionRecommendationsQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import type {
    SessionDayRecommendations,
    SessionRecommendationsResponse,
    VolumeIntensityContextDto,
} from "@nexia/shared/types/sessionRecommendations";
import type { VolumeIntensityContext } from "@nexia/shared";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { VolumeIntensityExplainer } from "@/components/trainingPlans/periodization/VolumeIntensityExplainer";
import { cn } from "@/lib/utils";

/** Alineado con EmptyStateCard: borde, barra primary, sombra, ocupa altura de la columna. */
const dayPlanCardShell = cn(
    "flex min-h-0 flex-1 flex-col rounded-lg border border-border border-l-2 border-l-primary",
    "bg-card p-4 text-card-foreground shadow-sm",
);

const dayPlanRoot = "flex h-full min-h-0 flex-1 flex-col gap-3";

const METRIC_LABEL_CLASS =
    "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80";

interface SessionDayPlanProps {
    clientId: number | null;
    sessionDate: string;
    trainerId: number;
}

function formatBlockDateRange(start?: string | null, end?: string | null): string | null {
    if (!start || !end) return null;
    const fmt = (iso: string) => {
        const d = new Date(iso + "T12:00:00");
        return d.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };
    return `${fmt(start)} – ${fmt(end)}`;
}

function resolveQualityLabel(
    slug: string,
    catalog: { slug: string; name: string }[]
): string {
    const found = catalog.find((q) => q.slug === slug);
    if (found?.name) return found.name;
    return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toVolumeContext(dto: VolumeIntensityContextDto): VolumeIntensityContext {
    return dto as unknown as VolumeIntensityContext;
}

function CoherenceWarnings({ warnings }: { warnings: string[] }) {
    if (warnings.length === 0) return null;
    return (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
            <h4 className="mb-1 text-sm font-semibold text-warning">Avisos de coherencia</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-warning">
                {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                ))}
            </ul>
        </div>
    );
}

function DayPlanBody({
    rec,
    volumeContext,
}: {
    rec: SessionDayRecommendations;
    volumeContext?: VolumeIntensityContextDto | null;
}) {
    const { data: catalog = [] } = useGetPhysicalQualitiesQuery();
    const qualityLabel = resolveQualityLabel(rec.physical_quality, catalog);
    const dateRange = formatBlockDateRange(
        rec.period_block_start_date,
        rec.period_block_end_date
    );
    const weekLine =
        rec.block_week_ordinal != null &&
        rec.block_week_count != null &&
        rec.block_week_count > 0
            ? `Semana ${rec.block_week_ordinal} de ${rec.block_week_count}`
            : null;

    const contextLine = [rec.period_block_name, dateRange, weekLine]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Plan del día</h4>

            {contextLine ? (
                <p className="text-[10px] leading-snug text-muted-foreground">{contextLine}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className={METRIC_LABEL_CLASS}>Cualidad</span>
                <p className="inline-flex max-w-full shrink-0 rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-primary">
                    {qualityLabel}
                </p>
            </div>

            {volumeContext?.client_capacity ? (
                <VolumeIntensityExplainer
                    context={toVolumeContext(volumeContext)}
                    phase="complete"
                    compact
                />
            ) : null}
        </div>
    );
}

export const SessionDayPlan: React.FC<SessionDayPlanProps> = ({
    clientId,
    sessionDate,
    trainerId,
}) => {
    const skip = !clientId || clientId <= 0 || !sessionDate || !trainerId || trainerId <= 0;

    const { data, isLoading, isError } = useGetSessionRecommendationsQuery(
        {
            client_id: clientId || 0,
            session_date: sessionDate,
            trainer_id: trainerId,
        },
        { skip }
    );

    const warnings = useMemo(
        () => (data as SessionRecommendationsResponse | undefined)?.coherence_warnings ?? [],
        [data]
    );

    if (skip) return null;

    if (isLoading) {
        return (
            <div className={dayPlanRoot}>
                <div className={cn(dayPlanCardShell, "items-center justify-center py-8")}>
                    <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-primary">Cargando plan del día...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !data) return null;

    const response = data as SessionRecommendationsResponse;

    if (!response.has_active_plan) {
        return (
            <div className={dayPlanRoot}>
                <div className={cn(dayPlanCardShell, "justify-center space-y-2 text-center")}>
                    <h4 className="text-sm font-semibold text-foreground">Plan del día</h4>
                    <p className="text-xs leading-snug text-muted-foreground">
                        Sin plan activo para esta fecha. La sesión se creará sin referencia de
                        planificación.
                    </p>
                </div>
                <CoherenceWarnings warnings={warnings} />
            </div>
        );
    }

    if (
        !("has_planned_values" in response) ||
        !response.has_planned_values ||
        !response.recommendations
    ) {
        return (
            <div className={dayPlanRoot}>
                <div className={cn(dayPlanCardShell, "justify-center space-y-2 text-center")}>
                    <h4 className="text-sm font-semibold text-foreground">Plan del día</h4>
                    <p className="text-xs leading-snug text-muted-foreground">
                        Hay plan activo, pero no hay valores planificados para este día. Revisa el
                        bloque de periodización o la estructura semanal.
                    </p>
                </div>
                <CoherenceWarnings warnings={warnings} />
            </div>
        );
    }

    return (
        <div className={dayPlanRoot}>
            <div className={dayPlanCardShell}>
                <DayPlanBody
                    rec={response.recommendations}
                    volumeContext={response.volume_intensity_context}
                />
            </div>
            <CoherenceWarnings warnings={warnings} />
        </div>
    );
};
