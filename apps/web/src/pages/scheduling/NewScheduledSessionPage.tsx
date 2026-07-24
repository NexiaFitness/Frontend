/**
 * NewScheduledSessionPage — Vista dedicada para crear sesión agendada
 *
 * Ruta: /dashboard/scheduling/new
 * Query params: date (YYYY-MM-DD), clientId (opcional)
 * Diseño: design/platform/01_PREMIUM_MIGRATION.md · newScheduledSessionPresentation.ts
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0 (refactor desde modal)
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner } from "@/components/ui/feedback";
import { Input, FormCombobox, Textarea, DatePickerButton, TimePickerButton } from "@/components/ui/forms";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { useScheduleSession, getMutationErrorMessage } from "@nexia/shared";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { RootState } from "@nexia/shared/store";
import type {
    ScheduleSessionFormData,
    ScheduledSessionType,
    SessionLocation,
    ConflictCheckState,
    FormFieldErrors,
    AvailableSlot,
} from "@nexia/shared/types/scheduling";
import { SCHEDULED_SESSION_TYPE, SESSION_LOCATION } from "@nexia/shared/types/scheduling";
import { cn } from "@/lib/utils";
import {
    SCHEDULE_NEW_BACK_BUTTON,
    SCHEDULE_NEW_BODY,
    SCHEDULE_NEW_CONFLICT_ERROR,
    SCHEDULE_NEW_CONFLICT_OK,
    SCHEDULE_NEW_CONFLICT_TEXT_ERROR,
    SCHEDULE_NEW_CONFLICT_TEXT_OK,
    SCHEDULE_NEW_FIELD_ERROR,
    SCHEDULE_NEW_FIELD_LABEL,
    SCHEDULE_NEW_FIELD_WRAP,
    SCHEDULE_NEW_FOOTER_ACTIONS,
    SCHEDULE_NEW_FOOTER_PRIMARY,
    SCHEDULE_NEW_FORM,
    SCHEDULE_NEW_FORM_GRID_2,
    SCHEDULE_NEW_FORM_GRID_4,
    SCHEDULE_NEW_HEADER,
    SCHEDULE_NEW_HINT,
    SCHEDULE_NEW_ICON_BACK_GAP,
    SCHEDULE_NEW_ICON_SM,
    SCHEDULE_NEW_LOADING_ROW,
    SCHEDULE_NEW_LOCATION_OPTIONS,
    SCHEDULE_NEW_PAGE,
    SCHEDULE_NEW_SEARCH_ICON,
    SCHEDULE_NEW_SEARCH_INPUT,
    SCHEDULE_NEW_SEARCH_WRAP,
    SCHEDULE_NEW_SESSION_TYPE_OPTIONS,
    SCHEDULE_NEW_SHELL,
    SCHEDULE_NEW_SLOT_BUTTON,
    SCHEDULE_NEW_SLOTS_ROW,
    SCHEDULE_NEW_TITLE_WRAP,
} from "./newScheduledSessionPresentation";

const PAGE_SIZE = 30;
const CLIENT_SEARCH_DEBOUNCE_MS = 500;

export const NewScheduledSessionPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get("date");
    const clientIdParam = searchParams.get("clientId");

    const { user } = useSelector((state: RootState) => state.auth);
    const { data: trainerProfile, isLoading: isLoadingProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });
    const trainerId = trainerProfile?.id ?? 0;

    const {
        createSession,
        checkConflict,
        getAvailableSlots,
        isLoading: isCreating,
        isError: isCreateError,
        error: createError,
    } = useScheduleSession();

    const [clientSearchInput, setClientSearchInput] = useState("");
    const [debouncedClientSearch, setDebouncedClientSearch] = useState("");

    const {
        data: clientsData,
        isLoading: isLoadingClients,
        isFetching: isFetchingClients,
        isError: isClientsError,
        error: clientsError,
    } = useGetTrainerClientsQuery(
        {
            trainerId,
            page: 1,
            per_page: PAGE_SIZE,
            filters: { search: debouncedClientSearch || undefined },
        },
        { skip: !trainerId }
    );

    const isClientsPending =
        isLoadingProfile ||
        isLoadingClients ||
        (isFetchingClients && !clientsData?.items?.length);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedClientSearch(clientSearchInput);
        }, CLIENT_SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [clientSearchInput]);

    const [formData, setFormData] = useState<ScheduleSessionFormData>({
        trainerId,
        clientId: 0,
        scheduledDate: dateParam || new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 60,
        sessionType: SCHEDULED_SESSION_TYPE.TRAINING,
        notes: null,
        location: null,
        meetingLink: null,
    });

    const [formErrors, setFormErrors] = useState<FormFieldErrors>({});
    const [conflictCheck, setConflictCheck] = useState<ConflictCheckState | null>(null);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    useEffect(() => {
        if (trainerId) {
            setFormData((prev) => ({ ...prev, trainerId }));
        }
    }, [trainerId]);

    useEffect(() => {
        if (dateParam) {
            setFormData((prev) => ({ ...prev, scheduledDate: dateParam }));
        }
    }, [dateParam]);

    useEffect(() => {
        if (clientIdParam && clientsData?.items) {
            const clientId = Number(clientIdParam);
            const exists = clientsData.items.some((c) => c.id === clientId);
            if (exists) {
                setFormData((prev) => ({ ...prev, clientId }));
            }
        }
    }, [clientIdParam, clientsData]);

    const fetchAvailableSlots = useCallback(async () => {
        if (!trainerId || !formData.scheduledDate) {
            setAvailableSlots([]);
            return;
        }
        setIsLoadingSlots(true);
        setAvailableSlots([]);
        try {
            const res = await getAvailableSlots(trainerId, formData.scheduledDate);
            const slots = (res.available_slots ?? []).map((s: AvailableSlot) => ({
                ...s,
                start_time: s.start_time.length > 5 ? s.start_time.slice(0, 5) : s.start_time,
                end_time: s.end_time.length > 5 ? s.end_time.slice(0, 5) : s.end_time,
            }));
            setAvailableSlots(slots);
        } catch {
            setAvailableSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    }, [trainerId, formData.scheduledDate, getAvailableSlots]);

    useEffect(() => {
        fetchAvailableSlots();
    }, [fetchAvailableSlots]);

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

    const clientOptions = useMemo(
        () =>
            (clientsData?.items ?? []).map((c) => ({
                value: c.id.toString(),
                label: `${c.nombre} ${c.apellidos}`,
            })),
        [clientsData?.items]
    );

    const sessionTypeOptions = useMemo(
        () => SCHEDULE_NEW_SESSION_TYPE_OPTIONS.map((opt) => ({ ...opt })),
        []
    );

    const locationOptions = useMemo(
        () => SCHEDULE_NEW_LOCATION_OPTIONS.map((opt) => ({ ...opt })),
        []
    );

    const handleCheckConflict = async () => {
        if (!formData.trainerId || !formData.scheduledDate || !formData.startTime || !formData.endTime) return;
        try {
            const result = await checkConflict(
                formData.trainerId,
                formData.scheduledDate,
                formData.startTime,
                formData.endTime,
                null
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
        setFormErrors({});
        setConflictCheck(null);

        const errors: Record<string, string> = {};
        if (!formData.clientId || formData.clientId === 0) errors.clientId = "Se requiere seleccionar un cliente";
        if (!formData.scheduledDate) errors.scheduledDate = "Se requiere una fecha";
        if (!formData.startTime) errors.startTime = "Se requiere hora de inicio";
        if (!formData.endTime) errors.endTime = "Se requiere hora de fin";
        if (formData.durationMinutes <= 0) errors.durationMinutes = "La duración debe ser mayor a 0";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await createSession(formData);
            navigate("/dashboard/scheduling");
        } catch {
            // Error shown via isCreateError / createError
        }
    };

    return (
        <>
            <div className={SCHEDULE_NEW_PAGE}>
                <div className={SCHEDULE_NEW_HEADER}>
                    <PageTitle
                        title="Nueva cita"
                        subtitle="Programa una cita con tu cliente"
                        className={SCHEDULE_NEW_TITLE_WRAP}
                    />
                    <Button
                        variant="ghost-primary"
                        size="sm"
                        className={SCHEDULE_NEW_BACK_BUTTON}
                        onClick={() => navigate("/dashboard/scheduling")}
                    >
                        <ArrowLeft
                            className={cn(SCHEDULE_NEW_ICON_BACK_GAP, SCHEDULE_NEW_ICON_SM)}
                            aria-hidden
                        />
                        Volver al calendario
                    </Button>
                </div>

                <article className={SCHEDULE_NEW_SHELL}>
                    <NexiaGlassAccentRim />
                    <div className={SCHEDULE_NEW_BODY}>
                        {isClientsPending ? (
                            <div className={SCHEDULE_NEW_LOADING_ROW}>
                                <LoadingSpinner size="md" />
                                <span className="ml-3 text-sm text-muted-foreground">Cargando clientes...</span>
                            </div>
                        ) : isClientsError ? (
                            <Alert variant="error">
                                {getMutationErrorMessage(clientsError) ||
                                    "No se pudieron cargar tus clientes. Recarga la página e inténtalo de nuevo."}
                            </Alert>
                        ) : (
                            <form id="new-scheduled-session-form" onSubmit={handleSubmit} className={SCHEDULE_NEW_FORM}>
                                <div className={SCHEDULE_NEW_FORM_GRID_2}>
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <label htmlFor="new-schedule-client-search" className={SCHEDULE_NEW_FIELD_LABEL}>
                                            Buscar cliente
                                        </label>
                                        <div className={SCHEDULE_NEW_SEARCH_WRAP}>
                                            <Search className={SCHEDULE_NEW_SEARCH_ICON} aria-hidden />
                                            <Input
                                                id="new-schedule-client-search"
                                                type="text"
                                                size="sm"
                                                value={clientSearchInput}
                                                onChange={(e) => setClientSearchInput(e.target.value)}
                                                placeholder="Nombre, apellidos o mail..."
                                                className={SCHEDULE_NEW_SEARCH_INPUT}
                                                aria-label="Buscar cliente"
                                            />
                                        </div>
                                    </div>
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <label htmlFor="new-schedule-client" className={SCHEDULE_NEW_FIELD_LABEL}>
                                            Cliente *
                                        </label>
                                        <FormCombobox
                                            id="new-schedule-client"
                                            value={formData.clientId ? formData.clientId.toString() : ""}
                                            onChange={(value) =>
                                                setFormData({ ...formData, clientId: value ? Number(value) : 0 })
                                            }
                                            options={clientOptions}
                                            placeholder="Seleccionar cliente"
                                            ariaLabel="Cliente"
                                            className="w-full"
                                        />
                                        {formErrors.clientId && (
                                            <p className={SCHEDULE_NEW_FIELD_ERROR}>{formErrors.clientId}</p>
                                        )}
                                    </div>
                                </div>

                                <div className={SCHEDULE_NEW_FORM_GRID_2}>
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <span className={SCHEDULE_NEW_FIELD_LABEL}>Fecha *</span>
                                        <DatePickerButton
                                            label="Seleccionar fecha"
                                            value={formData.scheduledDate}
                                            onChange={(val) => {
                                                setFormData({ ...formData, scheduledDate: val });
                                                setConflictCheck(null);
                                            }}
                                            variant="form"
                                            aria-label="Fecha de la sesión"
                                        />
                                        {formErrors.scheduledDate && (
                                            <p className={SCHEDULE_NEW_FIELD_ERROR}>{formErrors.scheduledDate}</p>
                                        )}
                                    </div>
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <span className={SCHEDULE_NEW_FIELD_LABEL}>Tipo de sesión *</span>
                                        <FormCombobox
                                            value={formData.sessionType}
                                            onChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    sessionType: value as ScheduledSessionType,
                                                })
                                            }
                                            options={sessionTypeOptions}
                                            ariaLabel="Tipo de sesión"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className={SCHEDULE_NEW_FORM_GRID_4}>
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <span className={SCHEDULE_NEW_FIELD_LABEL}>Hora inicio *</span>
                                        <TimePickerButton
                                            label="Hora inicio"
                                            value={formData.startTime}
                                            onChange={(val) => {
                                                setFormData({ ...formData, startTime: val });
                                                setConflictCheck(null);
                                            }}
                                            aria-label="Hora de inicio"
                                        />
                                        {formErrors.startTime && (
                                            <p className={SCHEDULE_NEW_FIELD_ERROR}>{formErrors.startTime}</p>
                                        )}
                                    </div>
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <span className={SCHEDULE_NEW_FIELD_LABEL}>Hora fin *</span>
                                        <TimePickerButton
                                            label="Hora fin"
                                            value={formData.endTime}
                                            onChange={(val) => {
                                                setFormData({ ...formData, endTime: val });
                                                setConflictCheck(null);
                                            }}
                                            aria-label="Hora de fin"
                                        />
                                        {formErrors.endTime && (
                                            <p className={SCHEDULE_NEW_FIELD_ERROR}>{formErrors.endTime}</p>
                                        )}
                                    </div>
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <label htmlFor="new-schedule-duration" className={SCHEDULE_NEW_FIELD_LABEL}>
                                            Duración (min)
                                        </label>
                                        <Input
                                            id="new-schedule-duration"
                                            type="number"
                                            size="sm"
                                            value={formData.durationMinutes}
                                            onChange={(e) =>
                                                setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                                            }
                                            min={15}
                                            step={15}
                                            required
                                        />
                                        {formErrors.durationMinutes && (
                                            <p className={SCHEDULE_NEW_FIELD_ERROR}>{formErrors.durationMinutes}</p>
                                        )}
                                    </div>
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <span className={SCHEDULE_NEW_FIELD_LABEL}>Ubicación</span>
                                        <FormCombobox
                                            value={formData.location ?? ""}
                                            onChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    location: value ? (value as SessionLocation) : null,
                                                })
                                            }
                                            options={locationOptions}
                                            placeholder="Ubicación..."
                                            ariaLabel="Ubicación"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {formData.location === SESSION_LOCATION.ONLINE && (
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <label htmlFor="new-schedule-meeting-link" className={SCHEDULE_NEW_FIELD_LABEL}>
                                            Enlace de reunión
                                        </label>
                                        <Input
                                            id="new-schedule-meeting-link"
                                            type="url"
                                            size="sm"
                                            value={formData.meetingLink ?? ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, meetingLink: e.target.value || null })
                                            }
                                            placeholder="https://meet.google.com/..."
                                        />
                                    </div>
                                )}

                                {formData.scheduledDate && trainerId > 0 && (
                                    <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                        <span className={SCHEDULE_NEW_FIELD_LABEL}>Slots disponibles</span>
                                        {isLoadingSlots ? (
                                            <p className={SCHEDULE_NEW_HINT}>
                                                Cargando slots según tu disponibilidad...
                                            </p>
                                        ) : availableSlots.length === 0 ? (
                                            <p className={SCHEDULE_NEW_HINT}>
                                                No hay slots configurados. Añade tu disponibilidad en el calendario.
                                            </p>
                                        ) : (
                                            <div className={SCHEDULE_NEW_SLOTS_ROW}>
                                                {availableSlots.map((slot, idx) => (
                                                    <Button
                                                        key={`${slot.start_time}-${slot.end_time}-${idx}`}
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className={SCHEDULE_NEW_SLOT_BUTTON}
                                                        onClick={() => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                startTime: slot.start_time,
                                                                endTime: slot.end_time,
                                                                durationMinutes: slot.duration_minutes ?? 60,
                                                            }));
                                                            setConflictCheck(null);
                                                        }}
                                                    >
                                                        {slot.start_time} – {slot.end_time}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={SCHEDULE_NEW_FIELD_WRAP}>
                                    <label htmlFor="new-schedule-notes" className={SCHEDULE_NEW_FIELD_LABEL}>
                                        Notas
                                    </label>
                                    <Textarea
                                        id="new-schedule-notes"
                                        value={formData.notes ?? ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, notes: e.target.value || null })
                                        }
                                        rows={3}
                                        placeholder="Notas adicionales sobre la sesión..."
                                    />
                                </div>

                                {formData.scheduledDate && formData.startTime && formData.endTime && (
                                    <div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCheckConflict}
                                            disabled={isCreating}
                                        >
                                            Verificar disponibilidad
                                        </Button>
                                        {conflictCheck && (
                                            <div
                                                className={
                                                    conflictCheck.hasConflict
                                                        ? SCHEDULE_NEW_CONFLICT_ERROR
                                                        : SCHEDULE_NEW_CONFLICT_OK
                                                }
                                            >
                                                <p
                                                    className={
                                                        conflictCheck.hasConflict
                                                            ? SCHEDULE_NEW_CONFLICT_TEXT_ERROR
                                                            : SCHEDULE_NEW_CONFLICT_TEXT_OK
                                                    }
                                                >
                                                    {conflictCheck.message}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isCreateError && createError ? (
                                    <Alert variant="error">{getMutationErrorMessage(createError)}</Alert>
                                ) : null}
                            </form>
                        )}
                    </div>
                </article>
            </div>

            <DashboardFixedFooter>
                <div className={SCHEDULE_NEW_FOOTER_ACTIONS}>
                    <Button
                        type="button"
                        variant="outline-destructive"
                        size="sm"
                        className={SCHEDULE_NEW_FOOTER_PRIMARY}
                        onClick={() => navigate("/dashboard/scheduling")}
                        disabled={isCreating}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="new-scheduled-session-form"
                        variant="primary"
                        size="sm"
                        className={SCHEDULE_NEW_FOOTER_PRIMARY}
                        disabled={isCreating || isClientsPending}
                    >
                        {isCreating ? "Agendando..." : "Agendar sesión"}
                    </Button>
                </div>
            </DashboardFixedFooter>
        </>
    );
};
