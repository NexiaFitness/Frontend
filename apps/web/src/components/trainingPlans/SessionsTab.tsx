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
import { useNavigate } from 'react-router-dom';
import { useTrainingSessions } from '@nexia/shared/hooks/training/useTrainingSessions';
import { SessionCard } from '@/components/trainingSessions';
import { Button } from '@/components/ui/buttons';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { BaseModal } from '@/components/ui/modals/BaseModal';
import type { PlanTrainingSession } from '@nexia/shared';

interface SessionsTabProps {
    planId: number;
}

export const SessionsTab: React.FC<SessionsTabProps> = ({ planId }) => {
    const navigate = useNavigate();
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

    const handleViewDetail = (_session: PlanTrainingSession | { id: number }) => {
        // TODO: Navegar a detalle de sesión cuando se implemente
        // Por ahora, expandir inline o mostrar información adicional
        // eslint-disable-next-line no-console
        console.log('Ver detalle de sesión:', _session);
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
        <div className="space-y-6">
            {/* Header con estadísticas y botón crear */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Sesiones de Entrenamiento
                    </h3>
                    <p className="text-sm text-gray-500">
                        {sessions.length} sesión{sessions.length !== 1 ? 'es' : ''} total{sessions.length !== 1 ? 'es' : ''} • {' '}
                        {upcomingSessions.length} próxima{upcomingSessions.length !== 1 ? 's' : ''} • {' '}
                        {completedSessions.length} completada{completedSessions.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleCreateSession}
                >
                    + Nueva Sesión
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'all'
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                >
                    Todas ({sessions.length})
                </button>
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'upcoming'
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                >
                    Próximas ({upcomingSessions.length})
                </button>
                <button
                    onClick={() => setFilter('planned')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'planned'
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                >
                    Planificadas ({plannedSessions.length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'completed'
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                >
                    Completadas ({completedSessions.length})
                </button>
            </div>

            {/* Empty state */}
            {displayedSessions.length === 0 && (
                <div className="text-center py-12 px-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-4xl mb-4">🏋️</div>
                    <p className="text-gray-600 mb-2 font-medium">
                        {filter === 'all' && 'Aún no hay sesiones programadas para este plan'}
                        {filter === 'upcoming' && 'No hay sesiones próximas'}
                        {filter === 'planned' && 'No hay sesiones planificadas'}
                        {filter === 'completed' && 'No hay sesiones completadas'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        {filter === 'all' && 'Crea tu primera sesión para comenzar a programar el entrenamiento'}
                        {filter !== 'all' && 'Intenta cambiar el filtro para ver otras sesiones'}
                    </p>
                    {filter === 'all' && (
                        <Button variant="primary" onClick={handleCreateSession}>
                            Crear Primera Sesión
                        </Button>
                    )}
                </div>
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

