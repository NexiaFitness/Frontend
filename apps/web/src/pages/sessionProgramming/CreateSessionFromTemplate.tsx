/**
 * CreateSessionFromTemplate.tsx — Página para crear sesión desde template
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear sesión desde template
 * - Permite seleccionar fecha y plan de entrenamiento (Fase 6: training_plan_id)
 * - Cliente viene pre-rellenado desde query params
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input, FormSelect } from "@/components/ui/forms";
import {
    useCreateSessionFromTemplate,
    clampSessionDateToPlan,
    pickDefaultTrainingPlanId,
    resolveSessionDateBoundsForPlan,
    suggestDefaultSessionDateForPlan,
    validateSessionDateWithinPlan,
} from "@nexia/shared";
import { useGetClientQuery, useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingPlansQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { RootState } from "@nexia/shared/store";
import { ArrowLeft } from "lucide-react";

export const CreateSessionFromTemplate: React.FC = () => {
    const navigate = useNavigate();
    const { templateId } = useParams<{ templateId: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state: RootState) => state.auth);

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: user?.role !== "trainer",
    });
    const clientIdFromQuery = searchParams.get("clientId");
    const clientIdFromUrl =
        clientIdFromQuery && !Number.isNaN(Number(clientIdFromQuery))
            ? Number(clientIdFromQuery)
            : 0;
    const [pickedClientId, setPickedClientId] = useState(0);
    const clientId = clientIdFromUrl > 0 ? clientIdFromUrl : pickedClientId;

    const parsedTemplateId = Number(templateId);
    const effectiveTemplateId =
        Number.isFinite(parsedTemplateId) && parsedTemplateId > 0 ? parsedTemplateId : 0;

    const trainerId = trainerProfile?.id ?? 0;

    const { createSession, isCreating, isError, error, template, isLoadingTemplate } =
        useCreateSessionFromTemplate({
            templateId: effectiveTemplateId,
            clientId,
            trainerId,
        });

    const { data: trainerClients } = useGetTrainerClientsQuery(
        { trainerId, page: 1, per_page: 50 },
        { skip: !trainerId || clientIdFromUrl > 0 }
    );

    const { data: client } = useGetClientQuery(clientId, { skip: !clientId });
    const { data: trainingPlans } = useGetTrainingPlansQuery(
        { client_id: clientId, limit: 100 },
        { skip: !clientId }
    );

    const [formData, setFormData] = useState({
        sessionDate: "",
        trainingPlanId: "",
    });

    const selectedPlan = useMemo(() => {
        const planId = Number(formData.trainingPlanId);
        if (!planId || planId <= 0 || !trainingPlans?.length) {
            return null;
        }
        return trainingPlans.find((plan) => plan.id === planId) ?? null;
    }, [formData.trainingPlanId, trainingPlans]);

    const sessionDateBounds = useMemo(
        () => resolveSessionDateBoundsForPlan(selectedPlan),
        [selectedPlan]
    );

    useEffect(() => {
        setFormData({ sessionDate: "", trainingPlanId: "" });
        setFormErrors({});
    }, [clientId]);

    useEffect(() => {
        if (!trainingPlans?.length || formData.trainingPlanId) {
            return;
        }
        const defaultPlanId = pickDefaultTrainingPlanId(trainingPlans);
        if (!defaultPlanId) {
            return;
        }
        const plan = trainingPlans.find((item) => item.id === defaultPlanId);
        if (!plan) {
            return;
        }
        setFormData((prev) => ({
            ...prev,
            trainingPlanId: String(defaultPlanId),
            sessionDate: prev.sessionDate || suggestDefaultSessionDateForPlan(plan),
        }));
    }, [trainingPlans, formData.trainingPlanId]);

    useEffect(() => {
        if (!selectedPlan) {
            return;
        }
        setFormData((prev) => ({
            ...prev,
            sessionDate: prev.sessionDate
                ? clampSessionDateToPlan(prev.sessionDate, selectedPlan)
                : suggestDefaultSessionDateForPlan(selectedPlan),
        }));
    }, [selectedPlan]);

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!templateId || !effectiveTemplateId) {
            navigate("/dashboard");
        }
    }, [templateId, effectiveTemplateId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        setSuccess(false);

        const errors: Record<string, string> = {};
        if (!clientId) {
            errors.clientId = "Seleccione un cliente";
        }
        if (!formData.sessionDate) {
            errors.sessionDate = "La fecha es obligatoria";
        } else {
            const dateRangeError = validateSessionDateWithinPlan(
                formData.sessionDate,
                selectedPlan
            );
            if (dateRangeError) {
                errors.sessionDate = dateRangeError;
            }
        }
        const planId = Number(formData.trainingPlanId);
        if (!planId || planId <= 0) {
            errors.trainingPlanId = "Seleccione un plan de entrenamiento";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await createSession({
                sessionDate: formData.sessionDate,
                trainingPlanId: planId,
                planDateRange: selectedPlan,
            });
            setSuccess(true);
            const sessionDateStr = formData.sessionDate; // YYYY-MM-DD
            setTimeout(() => {
                if (clientId) {
                    const monthParam = sessionDateStr ? `&month=${sessionDateStr.slice(0, 7)}` : "";
                    navigate(`/dashboard/clients/${clientId}?tab=sessions${monthParam}`);
                } else {
                    navigate("/dashboard");
                }
            }, 1500);
        } catch (err) {
            console.error("Error creando sesión:", err);
        }
    };

    if (isLoadingTemplate) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="px-4 lg:px-8 py-6 lg:py-8">
                <Alert variant="error">Template no encontrado</Alert>
            </div>
        );
    }

    return (
        <>
                {/* Header */}
                <div className="mb-6 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <PageTitle
                            title="Usar Template"
                            subtitle={`Crear sesión desde template: ${template.name}`}
                        />
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="shrink-0">
                            <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    {/* Template Info (read-only) */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 mb-6">
                        <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4">
                            Información del Template
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-600 font-medium">Nombre:</span>
                                <p className="text-foreground font-semibold">{template.name}</p>
                            </div>
                            {template.description && (
                                <div>
                                    <span className="text-slate-600 font-medium">Descripción:</span>
                                    <p className="text-foreground">{template.description}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-slate-600 font-medium">Tipo de Sesión:</span>
                                <p className="text-foreground">{template.session_type}</p>
                            </div>
                            {template.estimated_duration && (
                                <div>
                                    <span className="text-slate-600 font-medium">Duración Estimada:</span>
                                    <p className="text-foreground">{template.estimated_duration} min</p>
                                </div>
                            )}
                            {template.difficulty_level && (
                                <div>
                                    <span className="text-slate-600 font-medium">Nivel de Dificultad:</span>
                                    <p className="text-foreground">{template.difficulty_level}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        <h3 className="text-lg lg:text-xl font-bold text-foreground mb-6">
                            Detalles de la Sesión
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Cliente: query param fija el cliente; si no, selector desde la lista del trainer */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Cliente{clientIdFromUrl <= 0 ? " *" : ""}
                                </label>
                                {clientIdFromUrl > 0 ? (
                                    <Input
                                        type="text"
                                        value={
                                            client
                                                ? `${client.nombre} ${client.apellidos}`
                                                : "Cargando..."
                                        }
                                        disabled
                                        className="bg-muted"
                                    />
                                ) : (
                                    <FormSelect
                                        value={pickedClientId > 0 ? String(pickedClientId) : ""}
                                        onChange={(e) =>
                                            setPickedClientId(
                                                e.target.value ? Number(e.target.value) : 0
                                            )
                                        }
                                        options={[
                                            { value: "", label: "Seleccione un cliente" },
                                            ...(trainerClients?.items ?? []).map((c) => ({
                                                value: String(c.id),
                                                label: `${c.nombre} ${c.apellidos}`.trim(),
                                            })),
                                        ]}
                                        required
                                    />
                                )}
                                {formErrors.clientId && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.clientId}</p>
                                )}
                            </div>

                            {/* Plan de entrenamiento (Fase 6: requerido) — antes de fecha: define vigencia */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Plan de entrenamiento
                                </label>
                                <FormSelect
                                    value={formData.trainingPlanId}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            trainingPlanId: e.target.value,
                                        }))
                                    }
                                    options={[
                                        { value: "", label: "Seleccione un plan" },
                                        ...(trainingPlans || []).map((plan) => ({
                                            value: plan.id.toString(),
                                            label: plan.name || `Plan #${plan.id}`,
                                        })),
                                    ]}
                                    required
                                />
                                {formErrors.trainingPlanId && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.trainingPlanId}</p>
                                )}
                            </div>

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Fecha de la Sesión *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.sessionDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            sessionDate: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={!selectedPlan}
                                    min={sessionDateBounds.min}
                                    max={sessionDateBounds.max}
                                />
                                {!selectedPlan ? (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Seleccione un plan para elegir una fecha dentro de su vigencia.
                                    </p>
                                ) : sessionDateBounds.min && sessionDateBounds.max ? (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Vigencia del plan: {sessionDateBounds.min} — {sessionDateBounds.max}
                                    </p>
                                ) : null}
                                {formErrors.sessionDate && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.sessionDate}</p>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(-1)}
                                    className="w-full sm:w-auto"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={isCreating || !trainerId || !clientId}
                                    className="w-full sm:w-auto sm:ml-auto"
                                >
                                    {isCreating ? "Creando..." : "Crear Sesión"}
                                </Button>
                            </div>

                            {/* Error */}
                            {isError && (
                                <Alert variant="error">
                                    {error && typeof error === "object" && "data" in error
                                        ? String((error as { data: unknown }).data)
                                        : "Error al crear la sesión"}
                                </Alert>
                            )}

                            {/* Success */}
                            {success && (
                                <Alert variant="success">
                                    Sesión creada exitosamente. Redirigiendo...
                                </Alert>
                            )}
                        </form>
                    </div>
                </div>
        </>
    );
};


