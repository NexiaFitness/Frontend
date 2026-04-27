/**
 * SessionsTab Component
 * Tab de gestión de Training Sessions dentro de un Training Plan
 * 
 * Funcionalidades:
 * - Lista de sesiones del plan
 * - Crear/Editar/Eliminar sesiones
 * - Filtros por estado (próximas/completadas)
 * 
 * Patrón del proyecto:
 * - Crear/Editar: Navegación a vistas completas (no modales)
 * - Eliminar: Modal de confirmación simple
 * 
 * @author Frontend Team - NEXIA
 * @since v6.0.0
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTrainingSessions } from '@nexia/shared/hooks/training/useTrainingSessions';
import { SessionCard } from '@/components/trainingSessions';
import { PeriodBlockEmptyCallout } from '@/components/trainingPlans/periodization/PeriodBlockEmptyCallout';
import { periodBlockEmptyCalloutOutlineCtaClassName } from '@/components/trainingPlans/periodization/periodBlockEmptyCallout.styles';
import { Button } from '@/components/ui/buttons';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { BaseModal } from '@/components/ui/modals/BaseModal';
import { cn } from '@/lib/utils';
import { returnToStateFromView } from '@/lib/sessionDetailNavigation';
import type { PlanTrainingSession } from '@nexia/shared';

function sessionFilterChipClass(active: boolean): string {
    return cn(
        'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors',
        active
            ? 'border-primary/35 bg-primary/10 text-primary'
            : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
    );
}

interface SessionsTabProps {
    planId: number;
}

export const SessionsTab: React.FC<SessionsTabProps> = ({ planId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        sessions,
        upcomingSessions,
        completedSessions,
        plannedSessions,
        isLoading,
        isError,
        error,
        deleteSession,
        isDeleting,
    } = useTrainingSessions(planId);

    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'planned'>('all');
    const [sessionToDelete, setSessionToDelete] = useState<PlanTrainingSession | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Handlers - Navegación a vistas completas (patrón del proyecto)
    const handleCreateSession = () => {
        navigate(`/dashboard/session-programming/create-session?planId=${planId}`);
    };

    const handleEditSession = (session: PlanTrainingSession | { id: number }) => {
        navigate(`/dashboard/session-programming/edit-session/${session.id}`);
    };

    const handleDeleteClick = (session: PlanTrainingSession | { id: number }) => {
        // Type assertion necesario porque SessionCard puede pasar LegacyTrainingSession
        if ('training_plan_id' in session || 'id' in session) {
            setSessionToDelete(session as PlanTrainingSession);
            setShowDeleteModal(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!sessionToDelete) return;

        try {
            await deleteSession({
                id: sessionToDelete.id,
                trainingPlanId: sessionToDelete.training_plan_id || planId,
            }).unwrap();
            setShowDeleteModal(false);
            setSessionToDelete(null);
        } catch (err) {
            console.error('Error eliminando sesión:', err);
            // El error se maneja en el hook
        }
    };

    const handleViewDetail = (session: PlanTrainingSession | { id: number }) => {
        navigate(`/dashboard/session-programming/sessions/${session.id}`, {
            state: returnToStateFromView(location),
        });
    };

    // Determinar qué sesiones mostrar según filtro
    const displayedSessions = 
        filter === 'upcoming' ? upcomingSessions :
        filter === 'completed' ? completedSessions :
        filter === 'planned' ? plannedSessions :
        sessions;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError) {
        const errorMessage = error && typeof error === 'object' && 'data' in error
            ? String((error as { data: unknown }).data)
            : null;
        
        return (
            <div className="p-6">
                <Alert variant="error">
                    <div>
                        Error al cargar las sesiones
                        {errorMessage && (
                            <div className="mt-2 text-sm">
                                {errorMessage}
                            </div>
                        )}
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Sesiones</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Sesiones de entrenamiento programadas en este plan
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateSession}
                    className="shrink-0 self-start sm:self-center"
                >
                    + Nueva Sesión
                </Button>
            </div>

            {/* Filtros — línea con token de borde (misma familia visual que TabsBar / tema) */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-4">
                <button type="button" onClick={() => setFilter('all')} className={sessionFilterChipClass(filter === 'all')}>
                    Todas ({sessions.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('upcoming')}
                    className={sessionFilterChipClass(filter === 'upcoming')}
                >
                    Próximas ({upcomingSessions.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('planned')}
                    className={sessionFilterChipClass(filter === 'planned')}
                >
                    Planificadas ({plannedSessions.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('completed')}
                    className={sessionFilterChipClass(filter === 'completed')}
                >
                    Completadas ({completedSessions.length})
                </button>
            </div>

            {/* Empty state — mismo patrón visual que periodización / coherencia */}
            {displayedSessions.length === 0 && (
                <PeriodBlockEmptyCallout
                    primaryText={
                        filter === 'all'
                            ? 'Aún no hay sesiones programadas para este plan'
                            : filter === 'upcoming'
                              ? 'No hay sesiones próximas'
                              : filter === 'planned'
                                ? 'No hay sesiones planificadas'
                                : 'No hay sesiones completadas'
                    }
                    secondaryText={
                        filter === 'all'
                            ? 'Crea tu primera sesión para comenzar a programar el entrenamiento'
                            : 'Intenta cambiar el filtro para ver otras sesiones'
                    }
                    action={
                        filter === 'all' ? (
                            <button
                                type="button"
                                className={periodBlockEmptyCalloutOutlineCtaClassName}
                                onClick={handleCreateSession}
                            >
                                Crear Primera Sesión
                            </button>
                        ) : undefined
                    }
                />
            )}

            {/* Lista de sesiones */}
            {displayedSessions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayedSessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onEdit={handleEditSession}
                            onDelete={handleDeleteClick}
                            onViewDetail={handleViewDetail}
                        />
                    ))}
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            <BaseModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSessionToDelete(null);
                }}
                title="Eliminar Sesión"
                description={`¿Estás seguro de que deseas eliminar la sesión "${sessionToDelete?.session_name}"? Esta acción no se puede deshacer.`}
            >
                <div className="flex gap-3 justify-end mt-6">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowDeleteModal(false);
                            setSessionToDelete(null);
                        }}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </div>
            </BaseModal>
        </div>
    );
};

