/**
 * SessionDetail.tsx — Vista de detalle de una sesion de entrenamiento.
 * Contexto: acceso desde planes y clientes, con navegacion profesional.
 * Notas de mantenimiento: no toca backend; usa RTK Query y tipados de shared.
 * @author Frontend Team
 * @since v6.2.0
 */

import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { TYPOGRAPHY } from "@/utils/typography";
import { useGetTrainingSessionQuery, useGetSessionExercisesQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import type { SessionExercise } from "@nexia/shared/types/trainingSessions";
import { TRAINER_MENU_ITEMS } from "@/config/trainerNavigation";

const STATUS_LABELS: Record<string, string> = {
    planned: "Planificada",
    completed: "Completada",
    cancelled: "Cancelada",
    skipped: "Saltada",
    modified: "Modificada",
    in_progress: "En progreso",
};

const STATUS_COLORS: Record<string, string> = {
    planned: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    skipped: "bg-gray-100 text-gray-800",
    modified: "bg-orange-100 text-orange-800",
    in_progress: "bg-yellow-100 text-yellow-800",
};

export const SessionDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const sessionId = id ? Number(id) : 0;

    const { data: session, isLoading, isError, error } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId),
    });

    const {
        data: exercises = [],
        isLoading: isLoadingExercises,
        isError: isErrorExercises,
    } = useGetSessionExercisesQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId),
    });

    const { data: plan } = useGetTrainingPlanQuery(session?.training_plan_id || 0, {
        skip: !session?.training_plan_id,
    });

    const { data: client } = useGetClientQuery(session?.client_id || 0, {
        skip: !session?.client_id,
    });

    const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
        const items: BreadcrumbItem[] = [
            { label: "Dashboard", path: "/dashboard" },
            { label: "Clientes", path: "/dashboard/clients" },
        ];

        if (client) {
            items.push({
                label: `${client.nombre} ${client.apellidos}`,
                path: `/dashboard/clients/${client.id}`,
            });
        }

        if (plan) {
            items.push({
                label: plan.name,
                path: `/dashboard/training-plans/${plan.id}`,
            });
        }

        if (session) {
            items.push({
                label: session.session_name,
                active: true,
            });
        }

        return items;
    }, [client, plan, session]);

    if (!sessionId || Number.isNaN(sessionId)) {
        return (
            <>
                <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">ID de sesion invalido</Alert>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="flex items-center justify-center min-h-screen">
                        <LoadingSpinner size="lg" />
                    </div>
                </DashboardLayout>
            </>
        );
    }

    if (isError || !session) {
        const errorMessage =
            error && typeof error === "object" && "data" in error
                ? String((error as { data: unknown }).data)
                : "No se pudo cargar la sesion";

        return (
            <>
                <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">{errorMessage}</Alert>
                        <div className="flex gap-3 mt-4">
                            <Button variant="outline" onClick={() => navigate("/dashboard/training-plans")}>
                                Volver a planes
                            </Button>
                            <Button variant="primary" onClick={() => navigate("/dashboard/clients")}>
                                Volver a clientes
                            </Button>
                        </div>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    const statusLabel = STATUS_LABELS[session.status] || session.status;
    const statusColor = STATUS_COLORS[session.status] || "bg-gray-100 text-gray-800";

    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return "Sin fecha";
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const renderExerciseName = (exercise: SessionExercise): string => {
        if (exercise.exercise?.nombre) return exercise.exercise.nombre;
        return `Ejercicio ${exercise.exercise_id}`;
    };

    return (
        <>
            <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
            <TrainerSideMenu />

            <DashboardLayout>
                <div className="min-h-screen -mt-16 md:-mt-18 lg:-mt-20">
                    <div className="bg-white border-b border-gray-200">
                        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-2">
                            <Breadcrumbs items={breadcrumbItems} />
                        </div>

                        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-6">
                            <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12 mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h1 className={`${TYPOGRAPHY.sectionTitle} text-gray-900`}>
                                            {session.session_name}
                                        </h1>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                                        <div>
                                            <span className="text-xs uppercase tracking-wide" style={{ color: "#4A67B3" }}>
                                                Fecha
                                            </span>
                                            <p className="text-gray-900 font-medium">{formatDate(session.session_date)}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs uppercase tracking-wide" style={{ color: "#4A67B3" }}>
                                                Tipo
                                            </span>
                                            <p className="text-gray-900 font-medium">{session.session_type}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs uppercase tracking-wide" style={{ color: "#4A67B3" }}>
                                                Plan
                                            </span>
                                            <p className="text-gray-900 font-medium">
                                                {plan?.name || "Sin plan"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/dashboard/session-programming/edit-session/${session.id}`)}
                                    >
                                        Editar sesion
                                    </Button>
                                    {session.training_plan_id && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(`/dashboard/training-plans/${session.training_plan_id}?tab=sessions`)
                                            }
                                        >
                                            Volver al plan
                                        </Button>
                                    )}
                                    {session.client_id && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(`/dashboard/clients/${session.client_id}?tab=sessions`)
                                            }
                                        >
                                            Volver al cliente
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="border-b mb-4" style={{ borderColor: "#4A67B3" }}></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: "#4A67B3" }}>
                                        Duracion planificada
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {session.planned_duration ? `${session.planned_duration} min` : "—"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: "#4A67B3" }}>
                                        Intensidad planificada
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {session.planned_intensity ?? "—"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: "#4A67B3" }}>
                                        Volumen planificado
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {session.planned_volume ?? "—"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: "#4A67B3" }}>
                                        Cliente
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {client ? `${client.nombre} ${client.apellidos}` : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pb-20">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ejercicios de la sesion</h2>

                                {isLoadingExercises && (
                                    <div className="flex items-center justify-center py-8">
                                        <LoadingSpinner size="md" />
                                    </div>
                                )}

                                {isErrorExercises && (
                                    <Alert variant="error">No se pudieron cargar los ejercicios</Alert>
                                )}

                                {!isLoadingExercises && !isErrorExercises && exercises.length === 0 && (
                                    <div className="text-sm text-gray-500">No hay ejercicios registrados.</div>
                                )}

                                {!isLoadingExercises && !isErrorExercises && exercises.length > 0 && (
                                    <div className="space-y-3">
                                        {exercises.map((exercise) => (
                                            <div
                                                key={exercise.id}
                                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-200 rounded-lg p-4"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {renderExerciseName(exercise)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Orden: {exercise.order_in_session}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                                                    <div>
                                                        <span className="block uppercase">Series</span>
                                                        <span className="font-medium">{exercise.planned_sets ?? "—"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block uppercase">Reps</span>
                                                        <span className="font-medium">{exercise.planned_reps ?? "—"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block uppercase">Peso</span>
                                                        <span className="font-medium">
                                                            {exercise.planned_weight ?? "—"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block uppercase">Descanso</span>
                                                        <span className="font-medium">
                                                            {exercise.planned_rest ?? "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                                {exercise.notes && (
                                                    <div className="text-xs text-gray-500 md:text-right">
                                                        {exercise.notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {session.notes && (
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Notas</h2>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

