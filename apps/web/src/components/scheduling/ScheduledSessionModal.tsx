/**
 * ScheduledSessionModal.tsx — Modal para crear/editar sesión agendada
 *
 * Contexto:
 * - Modal reutilizable para crear o editar sesiones agendadas
 * - Soporta pre-llenado de fecha, template o sesión existente
 * - Verifica conflictos antes de guardar
 * - Maneja validaciones y errores
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import {
    useScheduleSession,
    useUpdateScheduledSession,
} from "@nexia/shared";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetSessionTemplateQuery } from "@nexia/shared/api/sessionProgrammingApi";
import type {
    ScheduledSession,
    ScheduleSessionFormData,
    ScheduledSessionType,
    SessionLocation,
} from "@nexia/shared/types/scheduling";
import {
    SCHEDULED_SESSION_TYPE,
    SESSION_LOCATION,
} from "@nexia/shared/types/scheduling";

interface ScheduledSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    trainerId: number;
    session?: ScheduledSession | null; // Para modo edición
    prefilledDate?: string | null; // Para crear en fecha específica
    prefilledTemplate?: number | null; // Para crear desde template
    onSuccess?: () => void;
}

export const ScheduledSessionModal: React.FC<ScheduledSessionModalProps> = ({
    isOpen,
    onClose,
    trainerId,
    session,
    prefilledDate,
    prefilledTemplate,
    onSuccess,
}) => {
    const isEditMode = !!session;
    const { createSession, checkConflict, isLoading: isCreating, isError: isCreateError, error: createError } = useScheduleSession();
    const { updateSession, isUpdating, isError: isUpdateError, error: updateError } = useUpdateScheduledSession();

    // Obtener template si viene pre-llenado
    const { data: template } = useGetSessionTemplateQuery(prefilledTemplate || 0, {
        skip: !prefilledTemplate,
    });

    // Obtener clientes del trainer
    const { data: clientsData } = useGetTrainerClientsQuery(
        { trainerId, page: 1, per_page: 100 },
        { skip: !trainerId }
    );

    const [formData, setFormData] = useState<ScheduleSessionFormData>({
        trainerId,
        clientId: 0,
        scheduledDate: prefilledDate || new Date().toISOString().split("T")[0],
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
    const [success, setSuccess] = useState(false);

    // Inicializar formulario cuando cambia session o template
    useEffect(() => {
        if (isOpen) {
            if (session) {
                // Modo edición
                setFormData({
                    trainerId: session.trainer_id,
                    clientId: session.client_id,
                    scheduledDate: session.scheduled_date,
                    startTime: session.start_time,
                    endTime: session.end_time,
                    durationMinutes: session.duration_minutes,
                    sessionType: session.session_type,
                    notes: session.notes,
                    location: session.location as SessionLocation | null,
                    meetingLink: session.meeting_link,
                });
            } else if (template) {
                // Pre-llenar desde template
                setFormData((prev) => ({
                    ...prev,
                    sessionType: template.session_type as ScheduledSessionType,
                    durationMinutes: template.estimated_duration || 60,
                }));
            } else if (prefilledDate) {
                // Pre-llenar fecha
                setFormData((prev) => ({
                    ...prev,
                    scheduledDate: prefilledDate,
                }));
            }
            // Reset estados
            setFormErrors({});
            setConflictCheck(null);
            setSuccess(false);
        }
    }, [isOpen, session, template, prefilledDate]);

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
                formData.endTime,
                session?.id || null
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
        setSuccess(false);

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
            if (isEditMode && session) {
                // Modo edición
                await updateSession(session.id, {
                    scheduled_date: formData.scheduledDate,
                    start_time: formData.startTime,
                    end_time: formData.endTime,
                    duration_minutes: formData.durationMinutes,
                    session_type: formData.sessionType,
                    notes: formData.notes,
                    location: formData.location,
                    meeting_link: formData.meetingLink,
                });
            } else {
                // Modo creación
                await createSession(formData);
            }
            setSuccess(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Error guardando sesión:", err);
        }
    };

    const isLoading = isCreating || isUpdating;
    const isError = isCreateError || isUpdateError;
    const error = createError || updateError;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? "Editar Sesión Agendada" : "Nueva Sesión Agendada"}
            description={isEditMode ? "Modifica los detalles de la sesión" : "Programa una nueva cita con tu cliente"}
            closeOnBackdrop={!isLoading}
            closeOnEsc={!isLoading}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        disabled={isEditMode}
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
                <div className="grid grid-cols-2 gap-4">
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

                {/* Duración */}
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
                    <Textarea
                        value={formData.notes ?? ""}
                        onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value || null })
                        }
                        rows={3}
                        placeholder="Notas adicionales sobre la sesión..."
                    />
                </div>

                {/* Verificar Conflictos */}
                {formData.scheduledDate && formData.startTime && formData.endTime && (
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCheckConflict}
                            disabled={isLoading}
                        >
                            Verificar Disponibilidad
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

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                    <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
                        {isLoading
                            ? isEditMode
                                ? "Guardando..."
                                : "Agendando..."
                            : isEditMode
                                ? "Guardar Cambios"
                                : "Agendar Sesión"}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                </div>

                {/* Success */}
                {success && (
                    <div className="mt-4">
                        <Alert variant="success">
                            {isEditMode ? "Sesión actualizada exitosamente" : "Sesión agendada exitosamente"}
                        </Alert>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="mt-4">
                        <Alert variant="error">
                            {error && typeof error === "object" && "data" in error
                                ? String((error as { data: unknown }).data)
                                : isEditMode
                                    ? "Error al actualizar la sesión"
                                    : "Error al agendar la sesión"}
                        </Alert>
                    </div>
                )}
            </form>
        </BaseModal>
    );
};

