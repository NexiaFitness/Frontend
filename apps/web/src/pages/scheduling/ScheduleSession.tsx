/**
 * ScheduleSession.tsx — Página de agendamiento de sesiones
 *
 * Contexto:
 * - Vista protegida (solo trainers) para agendar sesiones
 * - Permite seleccionar cliente, fecha, hora, tipo de sesión
 * - Verifica conflictos antes de crear
 *
 * @author Frontend Team
 * @since v5.1.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Button } from "@/components/ui/buttons";
import { useToast, Alert } from "@/components/ui/feedback";
import { Input, FormSelect } from "@/components/ui/forms";
import { TYPOGRAPHY } from "@/utils/typography";
import { useScheduleSession } from "@nexia/shared";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { RootState } from "@nexia/shared/store";
import type { ScheduleSessionFormData, ScheduledSessionType, SessionLocation } from "@nexia/shared/types/scheduling";
import { SCHEDULED_SESSION_TYPE, SESSION_LOCATION } from "@nexia/shared/types/scheduling";

export const ScheduleSession: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { showSuccess, showError } = useToast();
    const { createSession, checkConflict, isLoading, isCreating, isError, error } = useScheduleSession();
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });

    const trainerId = trainerProfile?.id ?? 0;

    const { data: clientsData } = useGetTrainerClientsQuery(
        { trainerId, page: 1, per_page: 100 },
        { skip: !trainerId }
    );

    const [formData, setFormData] = useState<ScheduleSessionFormData>({
        trainerId,
        clientId: 0,
        scheduledDate: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 60,
        sessionType: SCHEDULED_SESSION_TYPE.TRAINING,
        notes: null,
        location: null,
        meetingLink: null,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [conflictCheck, setConflictCheck] = useState<{ hasConflict: boolean; message: string } | null>(null);

    // Calcular duración automáticamente
    useEffect(() => {
        if (formData.startTime && formData.endTime) {
            const start = new Date(`2000-01-01T${formData.startTime}`);
            const end = new Date(`2000-01-01T${formData.endTime}`);
            const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
            if (diffMinutes > 0) {
                setFormData((prev) => ({ ...prev, durationMinutes: diffMinutes }));
            }
        }
    }, [formData.startTime, formData.endTime]);

    const handleCheckConflict = async () => {
        if (!formData.trainerId || !formData.scheduledDate || !formData.startTime || !formData.endTime) {
            return;
        }

        try {
            const result = await checkConflict(
                formData.trainerId,
                formData.scheduledDate,
                formData.startTime,
                formData.endTime
            );

            if (result.has_conflict) {
                setConflictCheck({
                    hasConflict: true,
                    message: `Conflicto detectado: ${result.conflicts.length} sesión(es) existente(s) en este horario`,
                });
            } else {
                setConflictCheck({
                    hasConflict: false,
                    message: "Horario disponible",
                });
            }
        } catch (err) {
            console.error("Error verificando conflictos:", err);
            setConflictCheck({
                hasConflict: false,
                message: "No se pudo verificar conflictos",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        setConflictCheck(null);

        // Validación
        const errors: Record<string, string> = {};
        if (!formData.clientId || formData.clientId === 0) {
            errors.clientId = "Se requiere seleccionar un cliente";
        }
        if (!formData.scheduledDate) {
            errors.scheduledDate = "Se requiere una fecha";
        }
        if (!formData.startTime) {
            errors.startTime = "Se requiere hora de inicio";
        }
        if (!formData.endTime) {
            errors.endTime = "Se requiere hora de fin";
        }
        if (formData.durationMinutes <= 0) {
            errors.durationMinutes = "La duración debe ser mayor a 0";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await createSession(formData);
            showSuccess("Sesión agendada exitosamente. Redirigiendo...", 2000);
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } catch (err) {
            console.error("Error creando sesión:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String((err as { data: unknown }).data || "Error al agendar la sesión")
                    : "Error al agendar la sesión";
            showError(errorMessage);
        }
    };

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Agendar Sesión
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Programa una nueva sesión de entrenamiento, consulta o evaluación
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">

                    {/* Formulario */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-6">Detalles de la Sesión</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Cliente */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Cliente *
                                </label>
                                <FormSelect
                                    value={formData.clientId.toString()}
                                    onChange={(e) =>
                                        setFormData({ ...formData, clientId: Number(e.target.value) })
                                    }
                                    required
                                    options={[
                                        { value: "0", label: "Seleccionar cliente" },
                                        ...(clientsData?.items.map((client) => ({
                                            value: client.id.toString(),
                                            label: `${client.nombre} ${client.apellidos}`,
                                        })) ?? []),
                                    ]}
                                />
                                {formErrors.clientId && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.clientId}</p>
                                )}
                            </div>

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Fecha *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.scheduledDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, scheduledDate: e.target.value });
                                        setConflictCheck(null);
                                    }}
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                />
                                {formErrors.scheduledDate && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.scheduledDate}</p>
                                )}
                            </div>

                            {/* Horas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Hora de Inicio *
                                    </label>
                                    <Input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => {
                                            setFormData({ ...formData, startTime: e.target.value });
                                            setConflictCheck(null);
                                        }}
                                        required
                                    />
                                    {formErrors.startTime && (
                                        <p className="text-red-600 text-xs mt-1">{formErrors.startTime}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Hora de Fin *
                                    </label>
                                    <Input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => {
                                            setFormData({ ...formData, endTime: e.target.value });
                                            setConflictCheck(null);
                                        }}
                                        required
                                    />
                                    {formErrors.endTime && (
                                        <p className="text-red-600 text-xs mt-1">{formErrors.endTime}</p>
                                    )}
                                </div>
                            </div>

                            {/* Duración (calculada automáticamente) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Duración (minutos)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.durationMinutes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                                    }
                                    min="15"
                                    step="15"
                                    required
                                />
                                {formErrors.durationMinutes && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.durationMinutes}</p>
                                )}
                            </div>

                            {/* Tipo de Sesión */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Tipo de Sesión *
                                </label>
                                <FormSelect
                                    value={formData.sessionType}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessionType: e.target.value as ScheduledSessionType })
                                    }
                                    required
                                    options={[
                                        { value: SCHEDULED_SESSION_TYPE.TRAINING, label: "Entrenamiento" },
                                        { value: SCHEDULED_SESSION_TYPE.CONSULTATION, label: "Consulta" },
                                        { value: SCHEDULED_SESSION_TYPE.ASSESSMENT, label: "Evaluación" },
                                    ]}
                                />
                            </div>

                            {/* Ubicación */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Ubicación
                                </label>
                                <FormSelect
                                    value={formData.location ?? ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: e.target.value ? (e.target.value as SessionLocation) : null,
                                        })
                                    }
                                    options={[
                                        { value: "", label: "Seleccionar ubicación" },
                                        { value: SESSION_LOCATION.GYM, label: "Gimnasio" },
                                        { value: SESSION_LOCATION.ONLINE, label: "Online" },
                                        { value: SESSION_LOCATION.CLIENT_HOME, label: "Casa del Cliente" },
                                        { value: SESSION_LOCATION.OTHER, label: "Otra" },
                                    ]}
                                />
                            </div>

                            {/* Meeting Link (si es online) */}
                            {formData.location === SESSION_LOCATION.ONLINE && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Enlace de Reunión
                                    </label>
                                    <Input
                                        type="url"
                                        value={formData.meetingLink ?? ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, meetingLink: e.target.value || null })
                                        }
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>
                            )}

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Notas</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    rows={4}
                                    value={formData.notes ?? ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value || null })
                                    }
                                    placeholder="Notas adicionales sobre la sesión..."
                                />
                            </div>

                            {/* Verificar Conflictos */}
                            {formData.scheduledDate && formData.startTime && formData.endTime && (
                                <div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCheckConflict}
                                        disabled={isLoading}
                                    >
                                        Verificar Disponibilidad
                                    </Button>
                                    {conflictCheck && (
                                        <div className={`mt-2 p-3 rounded-lg ${
                                            conflictCheck.hasConflict
                                                ? "bg-red-50 text-red-700"
                                                : "bg-green-50 text-green-700"
                                        }`}>
                                            <p className="text-sm font-medium">{conflictCheck.message}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" variant="primary" disabled={isLoading || isCreating}>
                                    {isCreating ? "Agendando..." : "Agendar Sesión"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>


                        {/* Error */}
                        {isError && (
                            <div className="mt-6">
                                <Alert variant="error">
                                    {error && typeof error === "object" && "data" in error
                                        ? String((error as { data: unknown }).data)
                                        : "Error al agendar la sesión"}
                                </Alert>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

