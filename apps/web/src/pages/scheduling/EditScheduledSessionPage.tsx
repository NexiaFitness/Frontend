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
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { Input, FormCombobox, FormField, Textarea } from "@/components/ui/forms";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    PLATFORM_BACK_BUTTON,
    PLATFORM_ICON_BACK_GAP,
    PLATFORM_ICON_SM,
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_SPEC_GRID,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    PLATFORM_DASHBOARD_FOOTER_BTN,
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
    PLATFORM_FORM_BODY,
    PLATFORM_FORM_FOOTER_ACTIONS,
    PLATFORM_FORM_SHELL,
} from "@/components/ui/forms/platformFormPresentation";
import { NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS } from "@/components/ui/modals/nexiaPremiumModalPresentation";
import { DASHBOARD_FIXED_FOOTER_PADDING_CLASS } from "@/lib/dashboardScroll";

const FORM_VARIANT = "premium" as const;

const EDIT_SCHEDULE_PAGE = cn(
    "relative mx-auto w-full max-w-2xl lg:max-w-3xl px-4 lg:px-8",
    DASHBOARD_FIXED_FOOTER_PADDING_CLASS,
);
const EDIT_SCHEDULE_GLOW =
    "pointer-events-none absolute inset-x-0 -top-4 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_70%)]";
const EDIT_SCHEDULE_GRID = cn(PLATFORM_SPEC_GRID, "gap-4 md:grid-cols-2");
const EDIT_SCHEDULE_FOOTER = cn(
    "pointer-events-auto mx-auto w-full max-w-2xl lg:max-w-3xl px-4 lg:px-8",
    PLATFORM_FORM_FOOTER_ACTIONS,
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
);
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
            <div className="px-4 lg:px-8 py-12 text-muted-foreground">Cargando sesión...</div>
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

    const goCalendar = () => navigate("/dashboard/scheduling");

    const SESSION_TYPE_OPTIONS = [
        { value: SCHEDULED_SESSION_TYPE.TRAINING, label: "Entrenamiento" },
        { value: SCHEDULED_SESSION_TYPE.CONSULTATION, label: "Consulta" },
        { value: SCHEDULED_SESSION_TYPE.ASSESSMENT, label: "Evaluación" },
    ];

    const STATUS_OPTIONS = [
        { value: "scheduled", label: "Programada" },
        { value: "confirmed", label: "Confirmada" },
        { value: "completed", label: "Completada" },
        { value: "cancelled", label: "Cancelada" },
    ];

    const LOCATION_OPTIONS = [
        { value: "", label: "Seleccionar ubicación" },
        { value: SESSION_LOCATION.GYM, label: "Gimnasio" },
        { value: SESSION_LOCATION.ONLINE, label: "Online" },
        { value: SESSION_LOCATION.CLIENT_HOME, label: "Casa del Cliente" },
        { value: SESSION_LOCATION.OTHER, label: "Otra" },
    ];

    return (
        <div className={EDIT_SCHEDULE_PAGE}>
            <div className={EDIT_SCHEDULE_GLOW} aria-hidden />

            <div className={PLATFORM_PAGE_HEADER}>
                <PageTitle
                    title="Editar sesión agendada"
                    subtitle={`Cliente ID: ${session.client_id} (no editable)`}
                    className={PLATFORM_PAGE_TITLE_WRAP}
                />
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    className={PLATFORM_BACK_BUTTON}
                    onClick={goCalendar}
                >
                    <ArrowLeft
                        className={cn(PLATFORM_ICON_BACK_GAP, PLATFORM_ICON_SM)}
                        aria-hidden
                    />
                    Volver
                </Button>
            </div>

            <form id="edit-scheduled-session" onSubmit={handleSubmit}>
                <article className={PLATFORM_FORM_SHELL}>
                    <NexiaGlassAccentRim />
                    <div className={PLATFORM_FORM_BODY}>
                        <FormField label="Fecha" required variant={FORM_VARIANT}>
                            <Input
                                variant={FORM_VARIANT}
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => {
                                    setScheduledDate(e.target.value);
                                    setConflictCheck(null);
                                }}
                            />
                            {formErrors.scheduledDate ? (
                                <p className="text-sm text-destructive">{formErrors.scheduledDate}</p>
                            ) : null}
                        </FormField>

                        <div className={EDIT_SCHEDULE_GRID}>
                            <FormField label="Hora de inicio" required variant={FORM_VARIANT}>
                                <Input
                                    variant={FORM_VARIANT}
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => {
                                        setStartTime(e.target.value);
                                        setConflictCheck(null);
                                    }}
                                />
                                {formErrors.startTime ? (
                                    <p className="text-sm text-destructive">{formErrors.startTime}</p>
                                ) : null}
                            </FormField>
                            <FormField label="Hora de fin" required variant={FORM_VARIANT}>
                                <Input
                                    variant={FORM_VARIANT}
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => {
                                        setEndTime(e.target.value);
                                        setConflictCheck(null);
                                    }}
                                />
                                {formErrors.endTime ? (
                                    <p className="text-sm text-destructive">{formErrors.endTime}</p>
                                ) : null}
                            </FormField>
                        </div>

                        <FormField label="Duración (minutos)" variant={FORM_VARIANT}>
                            <Input
                                variant={FORM_VARIANT}
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                min={15}
                                step={15}
                            />
                            {formErrors.durationMinutes ? (
                                <p className="text-sm text-destructive">{formErrors.durationMinutes}</p>
                            ) : null}
                        </FormField>

                        <FormField label="Tipo de sesión" required variant={FORM_VARIANT}>
                            <FormCombobox
                                size="sm"
                                variant={FORM_VARIANT}
                                value={sessionType}
                                onChange={(next) => setSessionType(next as ScheduledSessionType)}
                                options={SESSION_TYPE_OPTIONS}
                                ariaLabel="Tipo de sesión"
                            />
                        </FormField>

                        <FormField label="Estado" variant={FORM_VARIANT}>
                            <FormCombobox
                                size="sm"
                                variant={FORM_VARIANT}
                                value={status}
                                onChange={(next) => setStatus(next as SessionStatus)}
                                options={STATUS_OPTIONS}
                                ariaLabel="Estado"
                            />
                        </FormField>

                        <FormField label="Ubicación" variant={FORM_VARIANT}>
                            <FormCombobox
                                size="sm"
                                variant={FORM_VARIANT}
                                value={location ?? ""}
                                onChange={(next) =>
                                    setLocation(next ? (next as SessionLocation) : null)
                                }
                                options={LOCATION_OPTIONS}
                                ariaLabel="Ubicación"
                            />
                        </FormField>

                        {location === SESSION_LOCATION.ONLINE ? (
                            <FormField label="Enlace de reunión" variant={FORM_VARIANT}>
                                <Input
                                    variant={FORM_VARIANT}
                                    type="url"
                                    value={meetingLink ?? ""}
                                    onChange={(e) => setMeetingLink(e.target.value || null)}
                                    placeholder="https://meet.google.com/..."
                                />
                            </FormField>
                        ) : null}

                        <FormField label="Notas" variant={FORM_VARIANT}>
                            <Textarea
                                variant={FORM_VARIANT}
                                value={notes ?? ""}
                                onChange={(e) => setNotes(e.target.value || null)}
                                rows={3}
                                placeholder="Notas adicionales..."
                            />
                        </FormField>

                        {scheduledDate && startTime && endTime ? (
                            <div>
                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handleCheckConflict}
                                    disabled={isUpdating}
                                >
                                    Verificar disponibilidad
                                </Button>
                                {conflictCheck ? (
                                    <div
                                        className={cn(
                                            "mt-2 rounded-lg p-3 text-sm font-medium",
                                            conflictCheck.hasConflict
                                                ? "bg-destructive/10 text-destructive"
                                                : "bg-primary/10 text-primary",
                                        )}
                                    >
                                        {conflictCheck.message}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        {isUpdateError && updateError ? (
                            <Alert variant="error">
                                {getMutationErrorMessage(updateError)}
                            </Alert>
                        ) : null}
                    </div>
                </article>
            </form>

            <DashboardFixedFooter>
                <div className={EDIT_SCHEDULE_FOOTER}>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        className={PLATFORM_DASHBOARD_FOOTER_BTN}
                        onClick={goCalendar}
                        disabled={isUpdating}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="edit-scheduled-session"
                        variant="primary"
                        size="sm"
                        className={cn(
                            PLATFORM_DASHBOARD_FOOTER_BTN,
                            NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS,
                        )}
                        disabled={isUpdating}
                        isLoading={isUpdating}
                    >
                        Guardar cambios
                    </Button>
                </div>
            </DashboardFixedFooter>
        </div>
    );
};
