/**
 * EditScheduledSessionPage — Vista dedicada para editar sesión agendada
 *
 * Ruta: /dashboard/scheduling/:id/edit
 * Carga sesión por id; cliente no editable.
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0 (refactor desde modal)
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    useUpdateScheduledSession,
    useScheduleSession,
    getMutationErrorMessage,
} from "@nexia/shared";
import { useGetScheduledSessionQuery } from "@nexia/shared/api/schedulingApi";
import type {
    ScheduledSessionUpdate,
    ScheduledSessionType,
    SessionLocation,
    SessionStatus,
    ConflictCheckState,
    FormFieldErrors,
} from "@nexia/shared/types/scheduling";
import { SCHEDULED_SESSION_TYPE, SESSION_LOCATION } from "@nexia/shared/types/scheduling";

export const EditScheduledSessionPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const sessionId = id ? parseInt(id, 10) : NaN;

    const { data: session, isLoading: isLoadingSession, isError: isErrorSession, error: sessionError } =
        useGetScheduledSessionQuery(sessionId, { skip: !id || isNaN(sessionId) });
    const { updateSession, isUpdating, isError: isUpdateError, error: updateError } = useUpdateScheduledSession();
    const { checkConflict } = useScheduleSession();

    const [scheduledDate, setScheduledDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [sessionType, setSessionType] = useState<ScheduledSessionType>(SCHEDULED_SESSION_TYPE.TRAINING);
    const [status, setStatus] = useState<SessionStatus>(session?.status ?? "scheduled");
    const [notes, setNotes] = useState<string | null>(null);
    const [location, setLocation] = useState<SessionLocation | null>(null);
    const [meetingLink, setMeetingLink] = useState<string | null>(null);

    const [formErrors, setFormErrors] = useState<FormFieldErrors>({});
    const [conflictCheck, setConflictCheck] = useState<ConflictCheckState | null>(null);

    useEffect(() => {
        if (session) {
            setScheduledDate(session.scheduled_date);
            setStartTime(session.start_time);
            setEndTime(session.end_time);
            setDurationMinutes(session.duration_minutes);
            setSessionType(session.session_type as ScheduledSessionType);
            setStatus(session.status);
            setNotes(session.notes);
            setLocation(session.location as SessionLocation | null);
            setMeetingLink(session.meeting_link);
        }
    }, [session]);

    useEffect(() => {
        if (startTime && endTime) {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
            if (diffMinutes > 0) setDurationMinutes(diffMinutes);
        }
    }, [startTime, endTime]);

    const handleCheckConflict = async () => {
        if (!session?.trainer_id || !scheduledDate || !startTime || !endTime) return;
        try {
            const result = await checkConflict(
                session.trainer_id,
                scheduledDate,
                startTime,
                endTime,
                session.id
            );
            if (result.has_conflict) {
                setConflictCheck({
                    hasConflict: true,
                    message: `Conflicto detectado: ${result.conflicts.length} sesión(es) existente(s) en este horario`,
                });
            } else {
                setConflictCheck({ hasConflict: false, message: "Horario disponible" });
            }
        } catch {
            setConflictCheck({ hasConflict: false, message: "No se pudo verificar conflictos" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNaN(sessionId) || !session) return;
        setFormErrors({});
        setConflictCheck(null);

        const errors: Record<string, string> = {};
        if (!scheduledDate) errors.scheduledDate = "Se requiere una fecha";
        if (!startTime) errors.startTime = "Se requiere hora de inicio";
        if (!endTime) errors.endTime = "Se requiere hora de fin";
        if (durationMinutes <= 0) errors.durationMinutes = "La duración debe ser mayor a 0";
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const data: ScheduledSessionUpdate = {
            scheduled_date: scheduledDate,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: durationMinutes,
            session_type: sessionType,
            status,
            notes: notes || null,
            location: location ?? null,
            meeting_link: meetingLink ?? null,
        };

        try {
            await updateSession(sessionId, data);
            navigate("/dashboard/scheduling");
        } catch {
            // Error via isUpdateError / updateError
        }
    };

    if (isLoadingSession) {
        return (
            <div className="px-4 lg:px-8 py-12 text-white">Cargando sesión...</div>
        );
    }

    if (isErrorSession || !session) {
        return (
            <div className="px-4 lg:px-8 py-12">
                <Alert variant="error">
                    {sessionError ? getMutationErrorMessage(sessionError) : "Sesión no encontrada"}
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/scheduling")}>
                    Volver al calendario
                </Button>
            </div>
        );
    }

    return (
        <>
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Editar sesión agendada
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Cliente ID: {session.client_id} (no editable)
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/scheduling")}>
                            Volver al calendario
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha *</label>
                                <Input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => {
                                        setScheduledDate(e.target.value);
                                        setConflictCheck(null);
                                    }}
                                    required
                                />
                                {formErrors.scheduledDate && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.scheduledDate}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Hora de inicio *
                                    </label>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => {
                                            setStartTime(e.target.value);
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
                                        Hora de fin *
                                    </label>
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => {
                                            setEndTime(e.target.value);
                                            setConflictCheck(null);
                                        }}
                                        required
                                    />
                                    {formErrors.endTime && (
                                        <p className="text-red-600 text-xs mt-1">{formErrors.endTime}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Duración (minutos)
                                </label>
                                <Input
                                    type="number"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                    min={15}
                                    step={15}
                                    required
                                />
                                {formErrors.durationMinutes && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.durationMinutes}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Tipo de sesión *
                                </label>
                                <FormSelect
                                    value={sessionType}
                                    onChange={(e) =>
                                        setSessionType(e.target.value as ScheduledSessionType)
                                    }
                                    required
                                    options={[
                                        { value: SCHEDULED_SESSION_TYPE.TRAINING, label: "Entrenamiento" },
                                        { value: SCHEDULED_SESSION_TYPE.CONSULTATION, label: "Consulta" },
                                        { value: SCHEDULED_SESSION_TYPE.ASSESSMENT, label: "Evaluación" },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
                                <FormSelect
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as SessionStatus)}
                                    options={[
                                        { value: "scheduled", label: "Programada" },
                                        { value: "confirmed", label: "Confirmada" },
                                        { value: "completed", label: "Completada" },
                                        { value: "cancelled", label: "Cancelada" },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Ubicación
                                </label>
                                <FormSelect
                                    value={location ?? ""}
                                    onChange={(e) =>
                                        setLocation(
                                            e.target.value ? (e.target.value as SessionLocation) : null
                                        )
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

                            {location === SESSION_LOCATION.ONLINE && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Enlace de reunión
                                    </label>
                                    <Input
                                        type="url"
                                        value={meetingLink ?? ""}
                                        onChange={(e) => setMeetingLink(e.target.value || null)}
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Notas</label>
                                <Textarea
                                    value={notes ?? ""}
                                    onChange={(e) => setNotes(e.target.value || null)}
                                    rows={3}
                                    placeholder="Notas adicionales..."
                                />
                            </div>

                            {scheduledDate && startTime && endTime && (
                                <div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCheckConflict}
                                        disabled={isUpdating}
                                    >
                                        Verificar disponibilidad
                                    </Button>
                                    {conflictCheck && (
                                        <div
                                            className={`mt-2 p-3 rounded-lg ${
                                                conflictCheck.hasConflict
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-green-50 text-green-700"
                                            }`}
                                        >
                                            <p className="text-sm font-medium">{conflictCheck.message}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" variant="primary" disabled={isUpdating}>
                                    {isUpdating ? "Guardando..." : "Guardar cambios"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/dashboard/scheduling")}
                                    disabled={isUpdating}
                                >
                                    Cancelar
                                </Button>
                            </div>

                            {isUpdateError && updateError ? (
                                <Alert variant="error">
                                    {getMutationErrorMessage(updateError)}
                                </Alert>
                            ) : null}
                        </form>
                    </div>
                </div>
        </>
    );
};
