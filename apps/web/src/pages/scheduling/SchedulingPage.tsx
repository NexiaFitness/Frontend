/**
 * SchedulingPage.tsx — Página principal de programación de sesiones agendadas
 *
 * Contexto:
 * - Vista consolidada para gestionar citas agendadas con clientes
 * - Layout: Calendario mensual (65%) + Sidebar (35%)
 * - Funcionalidades: Ver, crear, editar, eliminar sesiones agendadas
 * - Usa ScheduledSession (citas), NO TrainingSession (sesiones de entrenamiento)
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    useGetScheduledSessions,
    useUpcomingScheduledSession,
} from "@nexia/shared";
import { useGetSessionTemplatesQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { RootState } from "@nexia/shared/store";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import {
    ScheduledSessionCalendar,
    UpcomingScheduledSessionCard,
    SessionTemplatesList,
} from "@/components/scheduling";

export const SchedulingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });

    const trainerId = trainerProfile?.id ?? 0;

    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // Calcular rango de fechas del mes actual
    const monthRange = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return {
            start_date: firstDay.toISOString().split("T")[0],
            end_date: lastDay.toISOString().split("T")[0],
        };
    }, [currentMonth]);

    // Obtener sesiones del mes actual
    const {
        sessions,
        isLoading: isLoadingSessions,
        isError: isErrorSessions,
        error: sessionsError,
    } = useGetScheduledSessions({
        trainer_id: trainerId,
        start_date: monthRange.start_date,
        end_date: monthRange.end_date,
    });

    // Obtener próxima sesión
    const {
        upcomingSession,
        isLoading: isLoadingUpcoming,
    } = useUpcomingScheduledSession({
        trainer_id: trainerId,
    });

    // Obtener templates
    const {
        data: templates = [],
        isLoading: isLoadingTemplates,
    } = useGetSessionTemplatesQuery({
        skip: 0,
        limit: 100,
    });

    const handleDateClick = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        navigate(`/dashboard/scheduling/new?date=${dateStr}`);
    };

    const handleSessionClick = (session: ScheduledSession) => {
        navigate(`/dashboard/scheduling/${session.id}/edit`);
    };

    const handleUseTemplate = (templateId: number) => {
        navigate(`/dashboard/scheduling/new?templateId=${templateId}`);
    };

    const handleCreateTemplate = () => {
        navigate("/dashboard/session-programming/create-template");
    };

    const handleMonthChange = (date: Date) => {
        setCurrentMonth(date);
    };

    const isLoading = isLoadingSessions || isLoadingUpcoming || isLoadingTemplates;

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Programación", path: "/dashboard/scheduling" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 text-center px-4 lg:px-8">
                    <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                        Programación de Sesiones
                    </h2>
                    <p className="text-white/80 text-sm md:text-base">
                        Gestiona tus citas agendadas con clientes
                    </p>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : isErrorSessions ? (
                        <div className="p-6">
                            <Alert variant="error">
                                {sessionsError && typeof sessionsError === "object" && "data" in sessionsError
                                    ? String((sessionsError as { data: unknown }).data)
                                    : "Error al cargar las sesiones agendadas"}
                            </Alert>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Columna Izquierda: Calendario (2 de 3 columnas en desktop) */}
                            <div className="lg:col-span-2">
                                <ScheduledSessionCalendar
                                    sessions={sessions}
                                    currentMonth={currentMonth}
                                    onMonthChange={handleMonthChange}
                                    onDateClick={handleDateClick}
                                    onSessionClick={handleSessionClick}
                                />
                            </div>

                            {/* Columna Derecha: Sidebar (1 de 3 columnas) */}
                            <div className="space-y-6">
                                {/* Próxima Sesión */}
                                <UpcomingScheduledSessionCard
                                    session={upcomingSession}
                                    onSessionClick={upcomingSession ? () => handleSessionClick(upcomingSession) : undefined}
                                />

                                {/* Templates */}
                                <SessionTemplatesList
                                    templates={templates}
                                    onUseTemplate={handleUseTemplate}
                                    onCreateTemplate={handleCreateTemplate}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
};

