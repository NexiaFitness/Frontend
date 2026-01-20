/**
 * ClientWorkoutsTab.tsx — Tab Workouts del cliente
 *
 * Contexto:
 * - Muestra planes de entrenamiento y sesiones del cliente
 * - Lista de training plans activos/pasados
 * - Lista de sesiones recientes con estado
 * - Dashboards de planning analytics (yearly/monthly/weekly)
 * - Basado en Figma Profile Page
 *
 * Responsabilidades:
 * - Mostrar training plans del cliente
 * - Mostrar sesiones de entrenamiento
 * - Filtros por estado (planned, completed, cancelled)
 * - Dashboards de planning (yearly, monthly, weekly views)
 * - Título principal "Training Plan" arriba de sub-tabs
 *
 * Notas de mantenimiento:
 * - El título "Training Plan" se muestra ANTES de los sub-tabs
 * - Los sub-tabs incluyen: Planes, Sesiones, Planning Anual, Planning Mensual, Planning Semanal
 * - Cada dashboard (Yearly/Monthly/Weekly) tiene su propio subtítulo interno pequeño
 *
 * @author Frontend Team
 * @since v3.1.0
 * @updated v5.1.0 - Agregado título principal "Training Plan" siguiendo Figma
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubTabNavigation } from "@/hooks/useSubTabNavigation";
import type { TrainingPlan, TrainingSession } from "@nexia/shared/types/training";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    YearlyPlanningDashboard,
    MonthlyPlanningDashboard,
    WeeklyPlanningDashboard,
} from "@/components/trainingPlans/planning";

interface ClientWorkoutsTabProps {
    clientId: number;
    trainingPlans?: TrainingPlan[];
    trainingSessions?: TrainingSession[];
}

type SessionFilter = "all" | "completed" | "planned" | "cancelled";
type EntrenamientosSubTab = "plans" | "sessions" | "yearly" | "monthly" | "weekly";

const ENTRENAMIENTOS_SUBTABS: Array<{ id: EntrenamientosSubTab; label: string }> = [
    { id: "plans", label: "Planes" },
    { id: "sessions", label: "Sesiones" },
    { id: "yearly", label: "Planning Anual" },
    { id: "monthly", label: "Planning Mensual" },
    { id: "weekly", label: "Planning Semanal" },
];

export const ClientWorkoutsTab: React.FC<ClientWorkoutsTabProps> = ({
    clientId,
    trainingPlans = [],
    trainingSessions = [],
}) => {
    // Sub-tab navigation con query parameters
    const { activeSubTab, setActiveSubTab } = useSubTabNavigation<EntrenamientosSubTab>({
        validSubTabs: ENTRENAMIENTOS_SUBTABS.map((t) => t.id),
        defaultSubTab: "yearly",
    });
    const [sessionFilter, setSessionFilter] = useState<SessionFilter>("all");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Simular carga inicial
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Filtrar sesiones por estado
    const filteredSessions = trainingSessions.filter((session) => {
        if (sessionFilter === "all") return true;
        return session.status === sessionFilter;
    });

    // Contar sesiones por estado
    const sessionCounts = {
        all: trainingSessions.length,
        completed: trainingSessions.filter((s) => s.status === "completed").length,
        planned: trainingSessions.filter((s) => s.status === "planned").length,
        cancelled: trainingSessions.filter((s) => s.status === "cancelled").length,
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Render sub-tab content
    const renderSubTabContent = () => {
        switch (activeSubTab) {
            case "plans":
                return <PlansSubTab clientId={clientId} trainingPlans={trainingPlans} />;
            case "sessions":
                return (
                    <SessionsSubTab
                        clientId={clientId}
                        trainingSessions={trainingSessions}
                        sessionFilter={sessionFilter}
                        onSessionFilterChange={setSessionFilter}
                        filteredSessions={filteredSessions}
                        sessionCounts={sessionCounts}
                    />
                );
            case "yearly":
                return <YearlyPlanningSubTab clientId={clientId} />;
            case "monthly":
                return <MonthlyPlanningSubTab clientId={clientId} />;
            case "weekly":
                return <WeeklyPlanningSubTab clientId={clientId} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* TÍTULO PRINCIPAL - Training Plan */}
            <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Training Plan</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Planes de entrenamiento, sesiones y análisis de carga de trabajo
                </p>
            </div>

            {/* Sub-tabs Navigation */}
            <nav aria-label="Tabs entrenamiento" className="flex gap-1 border-b border-gray-200">
                {ENTRENAMIENTOS_SUBTABS.map((subTab) => {
                    const isActive = activeSubTab === subTab.id;
                    return (
                        <button
                            key={subTab.id}
                            onClick={() => setActiveSubTab(subTab.id)}
                            className={`
                                relative py-2 pb-3 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex-none min-w-[140px] text-center
                                ${isActive
                                    ? "text-[#4A67B3]"
                                    : "text-gray-500 hover:text-gray-700"
                                }
                            `}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {subTab.label}
                            {isActive && (
                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#4A67B3]"></span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Sub-tab Content */}
            <div>{renderSubTabContent()}</div>
        </div>
    );
};

// ========================================
// SUB-TAB COMPONENTS
// ========================================

// Sub-tab: Planes
interface PlansSubTabProps {
    clientId: number;
    trainingPlans: TrainingPlan[];
}

const PlansSubTab: React.FC<PlansSubTabProps> = ({ clientId, trainingPlans }) => {
    const navigate = useNavigate();

    const handleCreatePlan = () => {
        navigate(`/dashboard/training-plans/create?clientId=${clientId}`);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900`}>
                    Planes de Entrenamiento
                </h3>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreatePlan}
                >
                    + Nuevo Plan
                </Button>
            </div>

            {trainingPlans.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title="No hay planes de entrenamiento"
                    description="Crea el primer plan de entrenamiento para este cliente"
                />
            ) : (
                <div className="space-y-3">
                    {trainingPlans.map((plan) => (
                        <TrainingPlanCard key={plan.id} plan={plan} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Sub-tab: Sesiones
interface SessionsSubTabProps {
    clientId: number;
    trainingSessions: TrainingSession[];
    sessionFilter: SessionFilter;
    onSessionFilterChange: (filter: SessionFilter) => void;
    filteredSessions: TrainingSession[];
    sessionCounts: Record<SessionFilter, number>;
}

const SessionsSubTab: React.FC<SessionsSubTabProps> = ({
    clientId,
    trainingSessions,
    sessionFilter,
    onSessionFilterChange,
    filteredSessions,
    sessionCounts,
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900`}>
                    Sesiones de Entrenamiento
                </h3>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => alert(`Crear Sesión para cliente ${clientId}`)}
                >
                    + Nueva Sesión
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="mb-4 border-b border-gray-200">
                <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-transparent">
                    <style>{`
                        div[class*="overflow-x-auto"]::-webkit-scrollbar-thumb {
                            background-color: #4A67B3 !important;
                        }
                    `}</style>
                    {([
                        { value: "all", label: "Todas" },
                        { value: "planned", label: "Planificadas" },
                        { value: "completed", label: "Completadas" },
                        { value: "cancelled", label: "Canceladas" },
                    ] as Array<{ value: SessionFilter; label: string }>).map(({ value: filter, label }) => (
                        <button
                            key={filter}
                            onClick={() => onSessionFilterChange(filter)}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${sessionFilter === filter
                                ? "border-transparent sm:border-b-2 sm:border-[#4A67B3]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            style={sessionFilter === filter ? { color: "#4A67B3" } : {}}
                        >
                            {label}
                            <span className="ml-2 text-xs text-gray-400">
                                ({sessionCounts[filter]})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {trainingSessions.length === 0 ? (
                <EmptyState
                    icon="🏋️"
                    title="No hay sesiones de entrenamiento"
                    description="Las sesiones aparecerán aquí una vez que se creen"
                />
            ) : filteredSessions.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title={`No hay sesiones ${sessionFilter === "all" ? "" : sessionFilter === "planned" ? "planificadas" : sessionFilter === "completed" ? "completadas" : "canceladas"}`}
                    description="Intenta cambiar el filtro"
                />
            ) : (
                <div className="space-y-3">
                    {filteredSessions.map((session) => (
                        <TrainingSessionCard key={session.id} session={session} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Sub-tab: Planning Anual
interface YearlyPlanningSubTabProps {
    clientId: number;
}

const YearlyPlanningSubTab: React.FC<YearlyPlanningSubTabProps> = ({ clientId }) => {
    return <YearlyPlanningDashboard clientId={clientId} />;
};

// Sub-tab: Planning Mensual
interface MonthlyPlanningSubTabProps {
    clientId: number;
}

const MonthlyPlanningSubTab: React.FC<MonthlyPlanningSubTabProps> = ({ clientId }) => {
    return <MonthlyPlanningDashboard clientId={clientId} />;
};

// Sub-tab: Planning Semanal
interface WeeklyPlanningSubTabProps {
    clientId: number;
}

const WeeklyPlanningSubTab: React.FC<WeeklyPlanningSubTabProps> = ({ clientId }) => {
    return <WeeklyPlanningDashboard clientId={clientId} />;
};

// ========================================
// HELPER COMPONENTS
// ========================================

interface TrainingPlanCardProps {
    plan: TrainingPlan;
}

const TrainingPlanCard: React.FC<TrainingPlanCardProps> = ({ plan }) => {
    const navigate = useNavigate();

    const handleViewPlanDetails = () => {
        navigate(`/dashboard/training-plans/${plan.id}`);
    };

    const getStatusColor = (status: string) => {
        if (status === "active") return "bg-green-100 text-green-800";
        if (status === "completed") return "bg-blue-100 text-blue-800";
        return "bg-gray-100 text-gray-800";
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: "Activo",
            completed: "Completado",
            paused: "Pausado",
            cancelled: "Cancelado",
        };
        return labels[status] || status;
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                                plan.status
                            )}`}
                        >
                            {getStatusLabel(plan.status)}
                        </span>
                    </div>
                    {plan.description && (
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📅 Inicio: {new Date(plan.start_date).toLocaleDateString()}</span>
                        <span>🏁 Fin: {new Date(plan.end_date).toLocaleDateString()}</span>
                        <span>🎯 {plan.goal}</span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewPlanDetails}
                >
                    Ver Detalles
                </Button>
            </div>
        </div>
    );
};

interface TrainingSessionCardProps {
    session: TrainingSession;
}

const TrainingSessionCard: React.FC<TrainingSessionCardProps> = ({ session }) => {
    const getStatusBadge = (status: string) => {
        const badges = {
            completed: { bg: "bg-green-100", text: "text-green-800", label: "Completada" },
            planned: { bg: "bg-blue-100", text: "text-blue-800", label: "Planificada" },
            cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelada" },
            in_progress: { bg: "bg-yellow-100", text: "text-yellow-800", label: "En progreso" },
        };
        return badges[status as keyof typeof badges] || badges.planned;
    };

    const badge = getStatusBadge(session.status);

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-semibold text-gray-900">
                            {session.session_name}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
                            {badge.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        📅 {session.session_date ? new Date(session.session_date).toLocaleDateString() : "Sin fecha"} • {session.session_type}
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {session.planned_duration && (
                    <MetricItem
                        label="Duración plan."
                        value={`${session.planned_duration} min`}
                    />
                )}
                {session.actual_duration && (
                    <MetricItem
                        label="Duración real"
                        value={`${session.actual_duration} min`}
                    />
                )}
                {session.planned_intensity && (
                    <MetricItem
                        label="Intensidad plan."
                        value={session.planned_intensity.toFixed(1)}
                    />
                )}
                {session.actual_intensity && (
                    <MetricItem
                        label="Intensidad real"
                        value={session.actual_intensity.toFixed(1)}
                    />
                )}
                {session.planned_volume && (
                    <MetricItem
                        label="Volumen plan."
                        value={session.planned_volume.toString()}
                    />
                )}
                {session.actual_volume && (
                    <MetricItem
                        label="Volumen real"
                        value={session.actual_volume.toString()}
                    />
                )}
            </div>

            {session.notes && (
                <div className="bg-gray-50 rounded p-2 mb-3">
                    <p className="text-xs text-gray-600">{session.notes}</p>
                </div>
            )}

            <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`Ver sesión ${session.id} - TODO`)}
                className="w-full md:w-auto"
            >
                Ver Detalles
            </Button>
        </div>
    );
};

interface MetricItemProps {
    label: string;
    value: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value }) => {
    return (
        <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-gray-900">{value}</p>
        </div>
    );
};

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
    return (
        <div className="text-center py-8">
            <div className="text-4xl mb-2">{icon}</div>
            <h4 className="text-lg font-medium text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
};