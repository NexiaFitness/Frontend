/**
 * ClientOverviewTab.tsx — Tab Overview del cliente (Dashboard Ejecutivo)
 *
 * Contexto:
 * - Dashboard ejecutivo con métricas clave, alertas y actividad reciente
 * - Agrega información de múltiples tabs sin redundancia
 * - Basado en necesidades de entrenadores profesionales
 *
 * Responsabilidades:
 * - Mostrar métricas clave (adherencia, peso, fatiga, próxima sesión)
 * - Alertas prioritarias (monotonía, adherencia, riesgo)
 * - Actividad reciente (última sesión, último test, último registro)
 * - Acciones rápidas (links a tabs detallados)
 * - Información personal y antropométrica (detalles no visibles en header)
 *
 * @author Frontend Team
 * @since v3.1.0
 * @updated v6.0.0 - Convertido en dashboard ejecutivo
 */

import React, { useMemo, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Client } from "@nexia/shared/types/client";
import type { TrainingSession } from "@nexia/shared/types/training";
import type { PhysicalTestResultOut } from "@nexia/shared/types/testing";
import type { ClientProgress } from "@nexia/shared/types/progress";
import type { MetricCardColor } from "@nexia/shared/types/coherence";
import { MetricCard } from "@/components/ui/cards";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useCoherence } from "@nexia/shared/hooks/clients/useCoherence";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import {
    useGetClientTrainingSessionsQuery,
    useGetClientTestResultsQuery,
    useGetClientRatingsQuery,
    useCreateClientRatingMutation,
} from "@nexia/shared/api/clientsApi";
import { useGetClientHabitInsightsQuery } from "@nexia/shared/api/habitsApi";
import type { ClientRatingOut, ClientRatingCreate } from "@nexia/shared/types/client";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import { Button } from "@/components/ui/buttons";
import { ClientAlertsSection } from "./ClientAlertsSection";
import { ClientStatusSection } from "./ClientStatusSection";
import { ClientPlansSection } from "./ClientPlansSection";
import { RecommendationsCards } from "./RecommendationsCards";
import type { TrainingPlan } from "@nexia/shared/types/training";

interface ClientOverviewTabProps {
    client: Client;
    clientId: number;
    trainingPlans?: TrainingPlan[];
    isLoadingPlans?: boolean;
    /** Fase 1.1: abrir modal crear plan desde cliente. */
    onOpenCreatePlan?: () => void;
    /** Fase 1.1: abrir flujo Usar plantilla. */
    onOpenUseTemplate?: () => void;
    /** U4 paso 1.5: abrir drawer con detalle del plan (sin navegar). */
    onViewPlan?: (planId: number) => void;
}

export const ClientOverviewTab: React.FC<ClientOverviewTabProps> = ({
    client,
    clientId,
    trainingPlans = [],
    isLoadingPlans = false,
    onOpenCreatePlan,
    onOpenUseTemplate,
    onViewPlan,
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const alertsSectionRef = useRef<HTMLDivElement>(null);

    // Validar clientId antes de hacer cualquier llamada
    const isValidClientId = clientId && clientId > 0;

    /**
     * Scroll automático a sección de alertas cuando hay ?focus=alerts en la URL
     * Se ejecuta cuando el componente se monta o cuando cambia el query param
     */
    useEffect(() => {
        const focusParam = searchParams.get("focus");
        if (focusParam === "alerts" && alertsSectionRef.current) {
            // Pequeño delay para asegurar que el DOM se haya renderizado
            setTimeout(() => {
                alertsSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }
    }, [searchParams]);

    // Obtener datos de coherencia (adherencia, monotonía) - solo si clientId es válido
    const { data: coherenceData, isLoading: isLoadingCoherence } = useCoherence(
        isValidClientId ? clientId : 0,
        undefined,
        undefined,
        undefined,
        "week"
    );

    // Obtener datos de progreso (peso, cambios, historial) - solo si clientId es válido
    const {
        latestWeight,
        weightChange,
        trend,
        progressHistory,
        isLoading: isLoadingProgress,
    } = useClientProgress(isValidClientId ? clientId : 0, client);

    // Obtener datos de fatiga - solo si clientId es válido
    const {
        avgPreFatigue,
        avgPostFatigue,
        isLoading: isLoadingFatigue,
    } = useClientFatigue(isValidClientId ? clientId : 0);

    // Obtener sesiones de entrenamiento - solo si clientId es válido
    const { data: sessions = [], isLoading: isLoadingSessions } = useGetClientTrainingSessionsQuery(
        {
            clientId: isValidClientId ? clientId : 0,
            skip: 0,
            limit: 1000,
        },
        { skip: !isValidClientId }
    );

    // Obtener tests - solo si clientId es válido
    const { data: testResults = [], isLoading: isLoadingTests } = useGetClientTestResultsQuery(
        {
            clientId: isValidClientId ? clientId : 0,
        },
        { skip: !isValidClientId }
    );

    // Obtener lesiones activas (solo para widget compacto)
    const {
        activeInjuries: activeInjuriesCompact = [],
        isLoadingActive: isLoadingInjuries,
    } = useClientInjuries({
        clientId: isValidClientId ? clientId : 0,
        includeHistory: false,
    });

    // Insights de hábitos (MVP: sección en Resumen — DEC-02)
    const { data: habitInsights, isLoading: isLoadingHabits } = useGetClientHabitInsightsQuery(
        { clientId: isValidClientId ? clientId : 0 },
        { skip: !isValidClientId }
    );

    // Valoraciones de satisfacción del cliente
    const { data: ratings = [], isLoading: isLoadingRatings } = useGetClientRatingsQuery(
        { clientId: isValidClientId ? clientId : 0, skip: 0, limit: 50 },
        { skip: !isValidClientId }
    );
    const [createRating, { isLoading: isCreatingRating }] = useCreateClientRatingMutation();

    // Estado del formulario de valoración
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [ratingValue, setRatingValue] = useState<number>(5);
    const [ratingComment, setRatingComment] = useState("");

    // Calcular próxima sesión (antes de cualquier return)
    const upcomingSession = useMemo((): TrainingSession | null => {
        if (!isValidClientId || !sessions || sessions.length === 0) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filtered = sessions.filter(s => s.session_date && new Date(s.session_date) >= today);
        if (filtered.length === 0) return null;
        const sorted = [...filtered].sort(
            (a, b) => {
                if (!a.session_date || !b.session_date) return 0;
                return new Date(a.session_date).getTime() - new Date(b.session_date).getTime();
            }
        );
        return sorted[0] || null;
    }, [isValidClientId, sessions]);

    // Calcular última sesión completada (antes de cualquier return)
    const lastCompletedSession = useMemo((): TrainingSession | null => {
        if (!isValidClientId || !sessions || sessions.length === 0) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filtered = sessions.filter(s => s.status === "completed" && s.session_date && new Date(s.session_date) < today);
        if (filtered.length === 0) return null;
        const sorted = [...filtered].sort(
            (a, b) => {
                if (!a.session_date || !b.session_date) return 0;
                return new Date(b.session_date).getTime() - new Date(a.session_date).getTime();
            }
        );
        return sorted[0] || null;
    }, [isValidClientId, sessions]);

    // Calcular último test (antes de cualquier return)
    const lastTest = useMemo((): PhysicalTestResultOut | null => {
        if (!isValidClientId || !testResults || testResults.length === 0) return null;
        const sorted = [...testResults].sort(
            (a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime()
        );
        return sorted[0] || null;
    }, [isValidClientId, testResults]);

    // Calcular último registro de progreso (antes de cualquier return)
    const lastProgressRecord = useMemo((): ClientProgress | null => {
        if (!isValidClientId || !progressHistory || progressHistory.length === 0) return null;
        const sorted = [...progressHistory].sort(
            (a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
        );
        return sorted[0] || null;
    }, [isValidClientId, progressHistory]);

    // Última valoración de satisfacción (más reciente por rating_date)
    const lastRating = useMemo((): ClientRatingOut | null => {
        if (!ratings || ratings.length === 0) return null;
        const sorted = [...ratings].sort(
            (a, b) => new Date(b.rating_date).getTime() - new Date(a.rating_date).getTime()
        );
        return sorted[0] || null;
    }, [ratings]);

    // Determinar color de adherencia (antes de cualquier return)
    const adherenceColor = useMemo((): MetricCardColor => {
        if (!isValidClientId) return "green";
        const adherence = coherenceData?.adherence_percentage || 0;
        if (adherence >= 80) return "green";
        if (adherence >= 60) return "orange";
        return "red";
    }, [isValidClientId, coherenceData?.adherence_percentage]);

    // Calcular estado de loading (antes de cualquier return)
    const isLoading = useMemo(
        () => isLoadingCoherence || isLoadingProgress || isLoadingFatigue || isLoadingSessions || isLoadingTests,
        [isLoadingCoherence, isLoadingProgress, isLoadingFatigue, isLoadingSessions, isLoadingTests]
    );

    // Mostrar error si clientId no es válido
    if (!isValidClientId) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">ID de cliente inválido</p>
            </div>
        );
    }

    // Formatear fecha
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* MÉTRICAS CLAVE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Adherencia"
                    value={`${coherenceData?.adherence_percentage.toFixed(0) || 0}%`}
                    subtitle={`${coherenceData?.sessions_completed || 0}/${coherenceData?.sessions_total || 0} sesiones`}
                    color={adherenceColor}
                />
                <MetricCard
                    title="Último Peso"
                    value={latestWeight ? `${latestWeight} kg` : "N/A"}
                    subtitle={
                        weightChange !== null && weightChange !== undefined
                            ? `${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)} kg ${trend ? `(${trend})` : ""}`
                            : "Sin cambios"
                    }
                    color="blue"
                />
                <MetricCard
                    title="Fatiga Promedio"
                    value={
                        avgPreFatigue && avgPostFatigue
                            ? `Pre: ${avgPreFatigue.toFixed(1)} | Post: ${avgPostFatigue.toFixed(1)}`
                            : avgPreFatigue
                              ? `Pre: ${avgPreFatigue.toFixed(1)}`
                              : "N/A"
                    }
                    subtitle="Últimos 7 días"
                    color="orange"
                />
                <MetricCard
                    title="Próxima Sesión"
                    value={upcomingSession && upcomingSession.session_date ? formatDate(upcomingSession.session_date) : "No programada"}
                    subtitle={upcomingSession?.session_type || upcomingSession?.session_name || ""}
                    color="blue"
                />
            </div>

            {/* Recomendaciones 3-card (Volume, Intensidad, Selección de ejercicios) */}
            <RecommendationsCards clientId={clientId} />

            {/* Planes de entrenamiento asignados + CTA Crear plan */}
            <ClientPlansSection
                clientId={clientId}
                trainingPlans={trainingPlans}
                isLoading={isLoadingPlans}
                onOpenCreatePlan={onOpenCreatePlan}
                onOpenUseTemplate={onOpenUseTemplate}
                onViewPlan={onViewPlan}
            />

            {/* SECCIÓN HÁBITOS (MVP DEC-02 — resumen en Resumen) */}
            {isLoadingHabits ? (
                <div className="bg-card border border-border rounded-lg shadow p-6 flex items-center justify-center">
                    <LoadingSpinner size="md" />
                </div>
            ) : habitInsights && habitInsights.active_habits > 0 ? (
                <div className="bg-card border border-border rounded-lg shadow p-6">
                    <h3 className={`text-lg font-semibold text-foreground mb-4`}>Hábitos</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Resumen de cumplimiento de hábitos del cliente.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-xs font-medium text-muted-foreground">Hábitos activos</p>
                            <p className="text-xl font-semibold text-foreground">{habitInsights.active_habits}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-xs font-medium text-muted-foreground">Cumplimiento medio</p>
                            <p className="text-xl font-semibold text-foreground">
                                {habitInsights.average_completion.toFixed(0)}%
                            </p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-xs font-medium text-muted-foreground">Mejor racha</p>
                            <p className="text-xl font-semibold text-foreground">{habitInsights.best_streak} días</p>
                        </div>
                    </div>
                    {habitInsights.most_skipped && (
                        <p className="text-sm text-muted-foreground mt-3">
                            Más saltado: {habitInsights.most_skipped}
                        </p>
                    )}
                </div>
            ) : null}

            {/* SECCIÓN DE ALERTAS PERSISTENTES */}
            {/* Estas son las MISMAS alertas que aparecen en el dashboard del trainer */}
            {/* Acciones: Mark as read (opcional) y Resolve (acción principal) */}
            <ClientAlertsSection clientId={clientId} sectionRef={alertsSectionRef} />

            {/* SECCIÓN DE ESTADO DEL CLIENTE */}
            {/* Indicadores informativos: coherencia, monotonía, adherencia, tendencias */}
            {/* NO son alertas persistentes, solo información de contexto */}
            <ClientStatusSection client={client} clientId={clientId} />

            {/* SATISFACCIÓN — último rating y registrar valoración */}
            {isLoadingRatings ? (
                <div className="bg-card border border-border rounded-lg shadow p-6 flex items-center justify-center">
                    <LoadingSpinner size="md" />
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg shadow p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className={`text-lg font-semibold text-foreground`}>Satisfacción</h3>
                            <p className="text-muted-foreground text-sm">
                                Última valoración del cliente y registro de nuevas valoraciones.
                            </p>
                        </div>
                        {!showRatingForm && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowRatingForm(true)}
                            >
                                Registrar valoración
                            </Button>
                        )}
                    </div>
                    {lastRating ? (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">{lastRating.rating}/5</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(lastRating.rating_date).toLocaleDateString("es-ES", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                            {lastRating.comment && (
                                <p className="mt-2 text-sm text-muted-foreground">{lastRating.comment}</p>
                            )}
                        </div>
                    ) : (
                        !showRatingForm && (
                            <p className="mt-4 text-sm text-muted-foreground">Sin valoraciones</p>
                        )
                    )}
                    {showRatingForm && (
                        <form
                            className="mt-4 p-4 bg-muted/50 rounded-lg border border-border space-y-4"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const data: ClientRatingCreate = {
                                    client_id: clientId,
                                    rating: ratingValue,
                                    comment: ratingComment.trim() || null,
                                    rating_type: "general",
                                };
                                try {
                                    await createRating({ clientId, data }).unwrap();
                                    setShowRatingForm(false);
                                    setRatingValue(5);
                                    setRatingComment("");
                                } catch {
                                    // Error ya manejado por RTK Query / baseApi
                                }
                            }}
                        >
                            <div>
                                <label htmlFor="rating-select" className="mb-1 block text-sm font-medium text-foreground">
                                    Valoración (1-5)
                                </label>
                                <select
                                    id="rating-select"
                                    value={ratingValue}
                                    onChange={(e) => setRatingValue(Number(e.target.value))}
                                    className="block w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                    required
                                >
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>
                                            {n} {n === 5 ? "— Muy satisfecho" : n === 1 ? "— Muy insatisfecho" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="rating-comment" className="mb-1 block text-sm font-medium text-foreground">
                                    Comentario (opcional)
                                </label>
                                <textarea
                                    id="rating-comment"
                                    value={ratingComment}
                                    onChange={(e) => setRatingComment(e.target.value)}
                                    rows={2}
                                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={isCreatingRating}
                                >
                                    {isCreatingRating ? "Guardando…" : "Guardar valoración"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowRatingForm(false);
                                        setRatingValue(5);
                                        setRatingComment("");
                                    }}
                                    disabled={isCreatingRating}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* LESIONES ACTIVAS (widget compacto) */}
            {isLoadingInjuries ? (
                <div className="bg-card border border-border rounded-lg shadow p-6 flex items-center justify-center">
                    <LoadingSpinner size="md" />
                </div>
            ) : (
                activeInjuriesCompact.length > 0 && (
                    <div className="bg-card border border-border rounded-lg shadow p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className={`text-lg font-semibold text-foreground`}>Lesiones Activas</h3>
                                <p className="text-muted-foreground text-sm">
                                    Control rápido de lesiones actuales del cliente.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/dashboard/clients/${clientId}?tab=injuries`)}
                                className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                            >
                                Ver todas →
                            </button>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeInjuriesCompact.slice(0, 2).map((injury) => (
                                <div
                                    key={injury.id}
                                    className="rounded-lg border border-destructive/30 bg-destructive/10 p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Articulación</p>
                                            <p className="text-base font-semibold text-foreground">
                                                {injury.joint_name || `Joint #${injury.joint_id}`}
                                            </p>
                                            {injury.movement_name && (
                                                <p className="mt-1 text-sm text-muted-foreground">{injury.movement_name}</p>
                                            )}
                                        </div>
                                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-destructive/20 text-destructive">
                                            Dolor {injury.pain_level}/5
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Inicio: {new Date(injury.injury_date).toLocaleDateString("es-ES")}
                                    </p>
                                    {injury.notes && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            Notas: {injury.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}

            {/* ACTIVIDAD RECIENTE */}
            {(lastCompletedSession || lastTest || lastProgressRecord) && (
                <div className="bg-card border border-border rounded-lg shadow p-6">
                    <h3 className={`text-lg font-semibold text-foreground mb-4`}>Actividad Reciente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {lastCompletedSession && lastCompletedSession.session_date && (
                            <ActivityCard
                                title="Última Sesión"
                                date={formatDate(lastCompletedSession.session_date)}
                                detail={lastCompletedSession.session_type || lastCompletedSession.session_name || "Sesión"}
                                onClick={() => navigate(`/dashboard/clients/${clientId}?tab=sessions`)}
                            />
                        )}
                        {lastTest && (
                            <ActivityCard
                                title="Último Test"
                                date={formatDate(lastTest.test_date)}
                                detail={`${lastTest.value} ${lastTest.unit}`}
                                onClick={() => navigate(`/dashboard/clients/${clientId}?tab=testing`)}
                            />
                        )}
                        {lastProgressRecord && (
                            <ActivityCard
                                title="Último Registro"
                                date={formatDate(lastProgressRecord.fecha_registro)}
                                detail={
                                    lastProgressRecord.peso
                                        ? `${lastProgressRecord.peso} kg${lastProgressRecord.imc ? ` | IMC: ${lastProgressRecord.imc.toFixed(1)}` : ""}`
                                        : "Sin datos"
                                }
                                onClick={() => navigate(`/dashboard/clients/${clientId}?tab=progress`)}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* INFORMACIÓN PERSONAL - Solo campos no visibles en header */}
            <div className="bg-card border border-border rounded-lg shadow p-6">
                <h3 className={`text-lg font-semibold text-foreground mb-4`}>Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Email" value={client.mail} />
                    <InfoRow label="Teléfono" value={client.telefono} />
                    <InfoRow label="Sexo" value={client.sexo} />
                    <InfoRow label="ID/Passport" value={client.id_passport} />
                </div>
            </div>

            {/* Training Goals - Solo información adicional no visible en header */}
            {client.fecha_definicion_objetivo || client.descripcion_objetivos ? (
                <div className="bg-card border border-border rounded-lg shadow p-6">
                    <h3 className={`text-lg font-semibold text-foreground mb-4`}>Objetivos de Entrenamiento</h3>
                    <div className="space-y-3">
                        <InfoRow label="Fecha definición" value={client.fecha_definicion_objetivo} />
                        <InfoRow label="Descripción" value={client.descripcion_objetivos} />
                    </div>
                </div>
            ) : null}

            {/* Anthropometric Metrics (si existen) */}
            {hasAnthropometricData(client) && (
                <div className="bg-card border border-border rounded-lg shadow p-6">
                    <h3 className={`text-lg font-semibold text-foreground mb-4`}>Métricas Antropométricas</h3>

                    {/* Skinfolds */}
                    {hasSkinfolds(client) && (
                        <div className="mb-6">
                            <h4 className={`text-base font-semibold text-foreground mb-3`}>Pliegues Cutáneos (mm)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <AnthroMetric label="Tríceps" value={client.skinfold_triceps} />
                                <AnthroMetric label="Subescapular" value={client.skinfold_subscapular} />
                                <AnthroMetric label="Bíceps" value={client.skinfold_biceps} />
                                <AnthroMetric label="Cresta ilíaca" value={client.skinfold_iliac_crest} />
                                <AnthroMetric label="Supraespinal" value={client.skinfold_supraspinal} />
                                <AnthroMetric label="Abdominal" value={client.skinfold_abdominal} />
                                <AnthroMetric label="Muslo" value={client.skinfold_thigh} />
                                <AnthroMetric label="Pantorrilla" value={client.skinfold_calf} />
                            </div>
                        </div>
                    )}

                    {/* Girths */}
                    {hasGirths(client) && (
                        <div className="mb-6">
                            <h4 className={`text-base font-semibold text-foreground mb-3`}>Perímetros (cm)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <AnthroMetric label="Brazo relajado" value={client.girth_relaxed_arm} />
                                <AnthroMetric label="Brazo contraído" value={client.girth_flexed_contracted_arm} />
                                <AnthroMetric label="Cintura" value={client.girth_waist_minimum} />
                                <AnthroMetric label="Cadera" value={client.girth_hips_maximum} />
                                <AnthroMetric label="Muslo" value={client.girth_medial_thigh} />
                                <AnthroMetric label="Pantorrilla" value={client.girth_maximum_calf} />
                            </div>
                        </div>
                    )}

                    {/* Diameters */}
                    {hasDiameters(client) && (
                        <div>
                            <h4 className={`text-base font-semibold text-foreground mb-3`}>Diámetros Óseos (cm)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <AnthroMetric label="Húmero" value={client.diameter_humerus_biepicondylar} />
                                <AnthroMetric label="Fémur" value={client.diameter_femur_bicondylar} />
                                <AnthroMetric label="Muñeca" value={client.diameter_bi_styloid_wrist} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Health - Solo información no visible en header */}
            {client.lesiones_relevantes ? (
                <div className="bg-card border border-border rounded-lg shadow p-6">
                    <h3 className={`text-lg font-semibold text-foreground mb-4`}>Salud</h3>
                    <div className="space-y-3">
                        <InfoRow label="Lesiones relevantes" value={client.lesiones_relevantes} isTextArea />
                    </div>
                </div>
            ) : null}

            {/* Notes */}
            {(client.notes_1 || client.notes_2 || client.notes_3) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {client.notes_1 && <NoteCard title="Nota #1" content={client.notes_1} />}
                    {client.notes_2 && <NoteCard title="Nota #2" content={client.notes_2} />}
                    {client.notes_3 && <NoteCard title="Nota #3" content={client.notes_3} />}
                </div>
            )}
        </div>
    );
};

// ========================================
// HELPER COMPONENTS
// ========================================

interface InfoRowProps {
    label: string;
    value?: string | number | null;
    isTextArea?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isTextArea = false }) => {
    if (!value) return null;

    return (
        <div>
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className={`mt-1 text-sm text-foreground ${isTextArea ? "whitespace-pre-wrap" : ""}`}>{value}</dd>
        </div>
    );
};

interface AnthroMetricProps {
    label: string;
    value?: number | null;
}

const AnthroMetric: React.FC<AnthroMetricProps> = ({ label, value }) => {
    if (value === null || value === undefined) return null;

    return (
        <div className="bg-muted/50 rounded p-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
};

interface NoteCardProps {
    title: string;
    content: string;
}

const NoteCard: React.FC<NoteCardProps> = ({ title, content }) => {
    return (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">{title}</h4>
            <p className="text-sm text-yellow-800 whitespace-pre-wrap">{content}</p>
        </div>
    );
};

interface ActivityCardProps {
    title: string;
    date: string;
    detail: string;
    onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, date, detail, onClick }) => {
    return (
        <button
            onClick={onClick}
            type="button"
            className="rounded-lg border border-border bg-muted/50 p-4 text-left transition-colors hover:bg-surface-2 hover:border-border"
        >
            <p className="mb-1 text-xs font-medium text-muted-foreground">{title}</p>
            <p className="mb-1 text-sm font-semibold text-foreground">{date}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
        </button>
    );
};

// ========================================
// HELPER FUNCTIONS
// ========================================

function hasAnthropometricData(client: Client): boolean {
    return hasSkinfolds(client) || hasGirths(client) || hasDiameters(client);
}

function hasSkinfolds(client: Client): boolean {
    return !!(
        client.skinfold_triceps ||
        client.skinfold_subscapular ||
        client.skinfold_biceps ||
        client.skinfold_iliac_crest ||
        client.skinfold_supraspinal ||
        client.skinfold_abdominal ||
        client.skinfold_thigh ||
        client.skinfold_calf
    );
}

function hasGirths(client: Client): boolean {
    return !!(
        client.girth_relaxed_arm ||
        client.girth_flexed_contracted_arm ||
        client.girth_waist_minimum ||
        client.girth_hips_maximum ||
        client.girth_medial_thigh ||
        client.girth_maximum_calf
    );
}

function hasDiameters(client: Client): boolean {
    return !!(
        client.diameter_humerus_biepicondylar ||
        client.diameter_femur_bicondylar ||
        client.diameter_bi_styloid_wrist
    );
}
