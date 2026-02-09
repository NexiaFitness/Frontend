/**
 * ClientSessionProgrammingTab.tsx — Tab de programación de sesiones
 *
 * Contexto:
 * - Layout 2 columnas según Figma
 * - Calendario mensual (izquierda, más ancho)
 * - Upcoming Session + Templates (derecha, más estrecho)
 * - Botones: Edit Schedule, Add Session
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v5.3.0 - Alineado con Figma
 */

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetSessionTemplatesQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { useGetClientTrainingSessionsQuery } from "@nexia/shared/api/clientsApi";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";
import { SessionCalendar } from "@/components/sessionProgramming";
import type { TrainingSession, SessionTemplate, PlanTrainingSession } from "@nexia/shared";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";

interface ClientSessionProgrammingTabProps {
    clientId: number;
}

export const ClientSessionProgrammingTab: React.FC<ClientSessionProgrammingTabProps> = ({
    clientId,
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const monthParam = searchParams.get("month"); // YYYY-MM
    const initialMonth = useMemo(() => {
        if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) return new Date();
        const [y, m] = monthParam.split("-").map(Number);
        return new Date(y, m - 1, 1);
    }, [monthParam]);
    const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);

    useEffect(() => {
        setCurrentMonth(initialMonth);
    }, [initialMonth]);

    const { 
        data: templates, 
        isLoading: isLoadingTemplates, 
        isError: isErrorTemplates, 
        error: templatesError 
    } = useGetSessionTemplatesQuery({
        skip: 0,
        limit: 100,
    });

    const { 
        data: sessions = [], 
        isLoading: isLoadingSessions, 
        isError: isErrorSessions 
    } = useGetClientTrainingSessionsQuery(
        { clientId, skip: 0, limit: 1000 },
        { refetchOnMountOrArgChange: true }
    );

    // Calcular próxima sesión (fecha > hoy)
    const upcomingSession = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return sessions
            .filter(s => s.session_date && new Date(s.session_date) >= today)
            .sort((a, b) => {
                if (!a.session_date || !b.session_date) return 0;
                return new Date(a.session_date).getTime() - new Date(b.session_date).getTime();
            })[0] || null;
    }, [sessions]);

    const isLoading = isLoadingTemplates || isLoadingSessions;
    const isError = isErrorTemplates || isErrorSessions;

    // Handlers
    const handleEditSchedule = () => {
        // TODO: Implementar edición de schedule
        alert("Editar Calendario - Próximamente");
    };

    const handleAddSession = () => {
        navigate(`/dashboard/session-programming/create-session?clientId=${clientId}`);
    };

    const handleUseTemplate = (templateId: number) => {
        navigate(`/dashboard/session-programming/create-from-template/${templateId}?clientId=${clientId}`);
    };

    const handleCreateTemplate = () => {
        navigate("/dashboard/session-programming/create-template");
    };

    const handleDateClick = (_date: Date, sessionsForDay: (PlanTrainingSession | LegacyTrainingSession)[]) => {
        // Si hay sesiones en el día, navegar a la primera sesión
        if (sessionsForDay.length > 0 && sessionsForDay[0]?.id) {
            navigate(`/dashboard/session-programming/sessions/${sessionsForDay[0].id}`);
        }
        // Si no hay sesiones, podría abrir modal para crear una nueva sesión en esa fecha
        // Por ahora, solo navegamos si hay sesiones existentes
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError) {
        const errorMessage = templatesError && typeof templatesError === "object" && "data" in templatesError
            ? String((templatesError as { data: unknown }).data)
            : "No se pudieron cargar los datos";

        return (
            <div className="p-6">
                <Alert variant="error">
                    {errorMessage}
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* Header con título y botones */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className={TYPOGRAPHY.sectionTitle}>Programación de Sesiones</h2>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditSchedule}
                    >
                        Editar Calendario
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddSession}
                    >
                        + Añadir Sesión
                    </Button>
                </div>
            </div>

            {/* Layout 2 columnas: Calendario (2/3) + Sidebar (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Calendario (ocupa 2 de 3 columnas en desktop) */}
                <div className="lg:col-span-2">
                    <SessionCalendar
                        sessions={sessions}
                        currentMonth={currentMonth}
                        onMonthChange={setCurrentMonth}
                        onDateClick={handleDateClick}
                    />
                </div>

                {/* Columna Derecha: Upcoming Session + Templates (1 de 3 columnas) */}
                <div className="space-y-6">
                    {/* Upcoming Session Card */}
                    <UpcomingSessionCard session={upcomingSession} />

                    {/* Session Templates List */}
                    <SessionTemplatesList
                        templates={templates || []}
                        onUseTemplate={handleUseTemplate}
                        onCreateTemplate={handleCreateTemplate}
                    />
                </div>
            </div>
        </div>
    );
};

// ========================================
// COMPONENTE: UpcomingSessionCard
// ========================================

interface UpcomingSessionCardProps {
    session: TrainingSession | null;
}

const UpcomingSessionCard: React.FC<UpcomingSessionCardProps> = ({ session }) => {
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">
                Próxima Sesión
            </h3>
            
            {session ? (
                <div>
                    <p className="text-2xl font-bold text-slate-800 mb-1">
                        {session.session_date ? formatDate(session.session_date) : "Sin fecha"}
                    </p>
                    <p className="text-sm text-slate-600">
                        {session.session_type || session.session_name}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-slate-500 italic">
                    No hay sesiones próximas
                </p>
            )}
        </div>
    );
};

// ========================================
// COMPONENTE: SessionTemplatesList
// ========================================

interface SessionTemplatesListProps {
    templates: SessionTemplate[];
    onUseTemplate: (templateId: number) => void;
    onCreateTemplate: () => void;
}

const SessionTemplatesList: React.FC<SessionTemplatesListProps> = ({
    templates,
    onUseTemplate,
    onCreateTemplate,
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">
                Plantillas de Sesión
            </h3>

            <div className="space-y-3">
                {templates.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                        No hay plantillas disponibles
                    </p>
                ) : (
                    templates.map((template) => (
                        <div
                            key={template.id}
                            className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors"
                        >
                            <h4 className="font-semibold text-slate-800 mb-1">
                                {template.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                                <span>6 ejercicios</span>
                                {template.estimated_duration && (
                                    <span>{template.estimated_duration} min</span>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUseTemplate(template.id)}
                                className="w-full"
                            >
                                Usar Plantilla
                            </Button>
                        </div>
                    ))
                )}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={onCreateTemplate}
                className="w-full mt-4"
            >
                + Crear Plantilla
            </Button>
        </div>
    );
};