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

import React, { useState, useMemo } from "react";
import { useGetSessionTemplatesQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { useGetClientTrainingSessionsQuery } from "@nexia/shared/api/clientsApi";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";
import { SessionCalendar } from "@/components/sessionProgramming";
import type { TrainingSession, SessionTemplate } from "@nexia/shared";

interface ClientSessionProgrammingTabProps {
    clientId: number;
}

export const ClientSessionProgrammingTab: React.FC<ClientSessionProgrammingTabProps> = ({
    clientId,
}) => {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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
    } = useGetClientTrainingSessionsQuery({
        clientId,
        skip: 0,
        limit: 1000,
    });

    // Calcular próxima sesión (fecha > hoy)
    const upcomingSession = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return sessions
            .filter(s => new Date(s.session_date) >= today)
            .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())[0] || null;
    }, [sessions]);

    const isLoading = isLoadingTemplates || isLoadingSessions;
    const isError = isErrorTemplates || isErrorSessions;

    // Handlers (placeholders)
    const handleEditSchedule = () => {
        alert("Edit Schedule - Próximamente");
    };

    const handleAddSession = () => {
        alert("Add Session - Próximamente");
    };

    const handleUseTemplate = (templateId: number) => {
        alert(`Usar template ${templateId} - Próximamente`);
    };

    const handleCreateTemplate = () => {
        alert("Create Template - Próximamente");
    };

    const handleDateClick = (date: Date) => {
        console.log("Fecha clickeada:", date);
        // TODO: Mostrar modal con sesiones del día o crear nueva
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
                    <h2 className={TYPOGRAPHY.sectionTitle}>Session Programming</h2>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditSchedule}
                    >
                        Edit Schedule
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddSession}
                    >
                        + Add Session
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
                Upcoming Session
            </h3>
            
            {session ? (
                <div>
                    <p className="text-2xl font-bold text-slate-800 mb-1">
                        {formatDate(session.session_date)}
                    </p>
                    <p className="text-sm text-slate-600">
                        {session.session_type || session.session_name}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-slate-500 italic">
                    No upcoming sessions
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
                Session Templates
            </h3>

            <div className="space-y-3">
                {templates.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                        No templates available
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
                                <span>6 exercises</span>
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
                                Use Template
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
                + Create Template
            </Button>
        </div>
    );
};