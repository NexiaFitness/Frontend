/**
 * NewScheduledSessionPage — Vista dedicada para crear sesión agendada
 *
 * Ruta: /dashboard/scheduling/new
 * Query params: date (YYYY-MM-DD), templateId (opcional)
 * Listado de clientes con buscador (request con search al backend) y 30 por vista.
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0 (refactor desde modal)
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TRAINER_MENU_ITEMS } from "@/config/trainerNavigation";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { TYPOGRAPHY } from "@/utils/typography";
import { useScheduleSession, getMutationErrorMessage } from "@nexia/shared";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetSessionTemplateQuery } from "@nexia/shared/api/sessionProgrammingApi";
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

const PAGE_SIZE = 30;
const CLIENT_SEARCH_DEBOUNCE_MS = 500;

export const NewScheduledSessionPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get("date");
    const templateIdParam = searchParams.get("templateId");
    const templateId = templateIdParam ? parseInt(templateIdParam, 10) : 0;

    const { user } = useSelector((state: RootState) => state.auth);
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
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
    const { data: template } = useGetSessionTemplateQuery(templateId, { skip: !templateId });
    const [clientSearchInput, setClientSearchInput] = useState("");
    const [debouncedClientSearch, setDebouncedClientSearch] = useState("");

    const { data: clientsData, isLoading: isLoadingClients } = useGetTrainerClientsQuery(
        {
            trainerId,
            page: 1,
            per_page: PAGE_SIZE,
            filters: { search: debouncedClientSearch || undefined },
        },
        { skip: !trainerId }
    );

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
        if (template) {
            setFormData((prev) => ({
                ...prev,
                sessionType: template.session_type as ScheduledSessionType,
                durationMinutes: template.estimated_duration || 60,
            }));
        }
    }, [template]);

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

    const clientOptions = [
        { value: "0", label: "Seleccionar cliente" },
        ...(clientsData?.items?.map((c) => ({
            value: c.id.toString(),
            label: `${c.nombre} ${c.apellidos}`,
        })) ?? []),
    ];

    return (
        <>
            <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
            <TrainerSideMenu />
            <DashboardLayout>
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Nueva sesión agendada
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Programa una nueva cita con tu cliente
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/scheduling")}>
                            Volver al calendario
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        {isLoadingClients ? (
                            <p className="text-slate-600">Cargando clientes...</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="new-schedule-client-search" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Buscar cliente
                                    </label>
                                    <Input
                                        id="new-schedule-client-search"
                                        type="text"
                                        value={clientSearchInput}
                                        onChange={(e) => setClientSearchInput(e.target.value)}
                                        placeholder="Nombre, apellidos o mail..."
                                        aria-label="Buscar cliente"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="new-schedule-client" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Cliente *
                                    </label>
                                    <FormSelect
                                        id="new-schedule-client"
                                        value={formData.clientId.toString()}
                                        onChange={(e) =>
                                            setFormData({ ...formData, clientId: Number(e.target.value) })
                                        }
                                        required
                                        options={clientOptions}
                                    />
                                    {formErrors.clientId && (
                                        <p className="text-red-600 text-xs mt-1">{formErrors.clientId}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha *</label>
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

                                {formData.scheduledDate && trainerId > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Slots disponibles
                                        </label>
                                        {isLoadingSlots ? (
                                            <p className="text-slate-500 text-sm italic">
                                                Cargando slots según tu disponibilidad...
                                            </p>
                                        ) : availableSlots.length === 0 ? (
                                            <p className="text-slate-500 text-sm italic">
                                                No hay slots configurados. Añade tu disponibilidad en el calendario.
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {availableSlots.map((slot, idx) => (
                                                    <Button
                                                        key={`${slot.start_time}-${slot.end_time}-${idx}`}
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="new-schedule-start-time"
                                            className="block text-sm font-semibold text-slate-700 mb-2"
                                        >
                                            Hora de inicio *
                                        </label>
                                        <Input
                                            id="new-schedule-start-time"
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
                                        <label
                                            htmlFor="new-schedule-end-time"
                                            className="block text-sm font-semibold text-slate-700 mb-2"
                                        >
                                            Hora de fin *
                                        </label>
                                        <Input
                                            id="new-schedule-end-time"
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
                                        value={formData.sessionType}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                sessionType: e.target.value as ScheduledSessionType,
                                            })
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Ubicación
                                    </label>
                                    <FormSelect
                                        value={formData.location ?? ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                location: e.target.value
                                                    ? (e.target.value as SessionLocation)
                                                    : null,
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

                                {formData.location === SESSION_LOCATION.ONLINE && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Enlace de reunión
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
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isCreating}
                                    >
                                        {isCreating ? "Agendando..." : "Agendar sesión"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/dashboard/scheduling")}
                                        disabled={isCreating}
                                    >
                                        Cancelar
                                    </Button>
                                </div>

                                {isCreateError && createError ? (
                                    <Alert variant="error">
                                        {getMutationErrorMessage(createError)}
                                    </Alert>
                                ) : null}
                            </form>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};
