/**
 * CreateSessionFromTemplate.tsx — Crear sesión desde template (premium §5.3)
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input, FormCombobox, FormField } from "@/components/ui/forms";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
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
import {
    CREATE_SESSION_FROM_TEMPLATE_PAGE_SUBTITLE,
    CREATE_SESSION_FROM_TEMPLATE_PAGE_TITLE,
    CREATE_SESSION_FROM_TEMPLATE_SECTION,
    CREATE_SESSION_FROM_TEMPLATE_SUBMIT,
    SESSION_PROG_FORM_BACK_BUTTON,
    SESSION_PROG_FORM_BACK_LABEL,
    SESSION_PROG_FORM_BODY,
    SESSION_PROG_FORM_CANCEL,
    SESSION_PROG_FORM_CARD,
    SESSION_PROG_FORM_FOOTER_ACTIONS,
    SESSION_PROG_FORM_FOOTER_BTN,
    SESSION_PROG_FORM_GLOW,
    SESSION_PROG_FORM_HEADER,
    SESSION_PROG_FORM_ICON_BACK_GAP,
    SESSION_PROG_FORM_ICON_SM,
    SESSION_PROG_FORM_PAGE,
    SESSION_PROG_FORM_SECTION,
    SESSION_PROG_FORM_SECTION_TITLE,
    SESSION_PROG_FORM_SUBMIT_CTA,
    SESSION_PROG_FORM_TITLE_WRAP,
} from "./sessionProgrammingFormPresentation";

const FORM_VARIANT = "premium" as const;

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
        { skip: !trainerId || clientIdFromUrl > 0 },
    );

    const { data: client } = useGetClientQuery(clientId, { skip: !clientId });
    const { data: trainingPlans } = useGetTrainingPlansQuery(
        { client_id: clientId, limit: 100 },
        { skip: !clientId },
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
        [selectedPlan],
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
                selectedPlan,
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
            const sessionDateStr = formData.sessionDate;
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

    const clientOptions = useMemo(
        () => [
            { value: "", label: "Seleccione un cliente" },
            ...(trainerClients?.items ?? []).map((c) => ({
                value: String(c.id),
                label: `${c.nombre} ${c.apellidos}`.trim(),
            })),
        ],
        [trainerClients?.items],
    );

    const planOptions = useMemo(
        () => [
            { value: "", label: "Seleccione un plan" },
            ...(trainingPlans || []).map((plan) => ({
                value: plan.id.toString(),
                label: plan.name || `Plan #${plan.id}`,
            })),
        ],
        [trainingPlans],
    );

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

    const pageSubtitle = `${CREATE_SESSION_FROM_TEMPLATE_PAGE_SUBTITLE} ${template.name}`;

    return (
        <div className={SESSION_PROG_FORM_PAGE}>
            <div className={SESSION_PROG_FORM_GLOW} aria-hidden />

            <div className={SESSION_PROG_FORM_HEADER}>
                <PageTitle
                    title={CREATE_SESSION_FROM_TEMPLATE_PAGE_TITLE}
                    subtitle={pageSubtitle}
                    className={SESSION_PROG_FORM_TITLE_WRAP}
                />
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    className={SESSION_PROG_FORM_BACK_BUTTON}
                    onClick={() => navigate("/dashboard")}
                >
                    <ArrowLeft
                        className={cn(SESSION_PROG_FORM_ICON_BACK_GAP, SESSION_PROG_FORM_ICON_SM)}
                        aria-hidden
                    />
                    {SESSION_PROG_FORM_BACK_LABEL}
                </Button>
            </div>

            <article className={cn(SESSION_PROG_FORM_CARD, "mb-6")}>
                <NexiaGlassAccentRim />
                <div className={SESSION_PROG_FORM_BODY}>
                    <h2 className={SESSION_PROG_FORM_SECTION_TITLE}>Información del template</h2>
                    <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                        <div>
                            <dt className="text-muted-foreground">Nombre</dt>
                            <dd className="font-semibold text-foreground">{template.name}</dd>
                        </div>
                        {template.description ? (
                            <div>
                                <dt className="text-muted-foreground">Descripción</dt>
                                <dd className="text-foreground">{template.description}</dd>
                            </div>
                        ) : null}
                        <div>
                            <dt className="text-muted-foreground">Tipo de sesión</dt>
                            <dd className="text-foreground">{template.session_type}</dd>
                        </div>
                        {template.estimated_duration ? (
                            <div>
                                <dt className="text-muted-foreground">Duración estimada</dt>
                                <dd className="text-foreground">{template.estimated_duration} min</dd>
                            </div>
                        ) : null}
                    </dl>
                </div>
            </article>

            <form id="create-session-from-template" onSubmit={handleSubmit}>
                <article className={SESSION_PROG_FORM_CARD}>
                    <NexiaGlassAccentRim />
                    <div className={SESSION_PROG_FORM_BODY}>
                        <section
                            className={SESSION_PROG_FORM_SECTION}
                            aria-label={CREATE_SESSION_FROM_TEMPLATE_SECTION}
                        >
                            <h2 className={SESSION_PROG_FORM_SECTION_TITLE}>
                                {CREATE_SESSION_FROM_TEMPLATE_SECTION}
                            </h2>

                            <FormField
                                label="Cliente"
                                required={clientIdFromUrl <= 0}
                                variant={FORM_VARIANT}
                            >
                                {clientIdFromUrl > 0 ? (
                                    <Input
                                        variant={FORM_VARIANT}
                                        type="text"
                                        value={
                                            client
                                                ? `${client.nombre} ${client.apellidos}`
                                                : "Cargando..."
                                        }
                                        disabled
                                    />
                                ) : (
                                    <FormCombobox
                                        size="sm"
                                        variant={FORM_VARIANT}
                                        value={pickedClientId > 0 ? String(pickedClientId) : ""}
                                        options={clientOptions}
                                        onChange={(next) =>
                                            setPickedClientId(next ? Number(next) : 0)
                                        }
                                        ariaLabel="Cliente"
                                    />
                                )}
                                {formErrors.clientId ? (
                                    <p className="text-sm text-destructive">{formErrors.clientId}</p>
                                ) : null}
                            </FormField>

                            <FormField label="Plan de entrenamiento" required variant={FORM_VARIANT}>
                                <FormCombobox
                                    size="sm"
                                    variant={FORM_VARIANT}
                                    value={formData.trainingPlanId}
                                    options={planOptions}
                                    onChange={(next) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            trainingPlanId: next,
                                        }))
                                    }
                                    ariaLabel="Plan de entrenamiento"
                                />
                                {formErrors.trainingPlanId ? (
                                    <p className="text-sm text-destructive">
                                        {formErrors.trainingPlanId}
                                    </p>
                                ) : null}
                            </FormField>

                            <FormField label="Fecha de la sesión" required variant={FORM_VARIANT}>
                                <Input
                                    variant={FORM_VARIANT}
                                    type="date"
                                    value={formData.sessionDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            sessionDate: e.target.value,
                                        }))
                                    }
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
                                        Vigencia del plan: {sessionDateBounds.min} —{" "}
                                        {sessionDateBounds.max}
                                    </p>
                                ) : null}
                                {formErrors.sessionDate ? (
                                    <p className="text-sm text-destructive">{formErrors.sessionDate}</p>
                                ) : null}
                            </FormField>

                            {isError ? (
                                <Alert variant="error">
                                    {error && typeof error === "object" && "data" in error
                                        ? String((error as { data: unknown }).data)
                                        : "Error al crear la sesión"}
                                </Alert>
                            ) : null}

                            {success ? (
                                <Alert variant="success">
                                    Sesión creada exitosamente. Redirigiendo...
                                </Alert>
                            ) : null}
                        </section>
                    </div>
                </article>
            </form>

            <DashboardFixedFooter>
                <div className={SESSION_PROG_FORM_FOOTER_ACTIONS}>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        className={SESSION_PROG_FORM_FOOTER_BTN}
                        onClick={() => navigate(-1)}
                    >
                        {SESSION_PROG_FORM_CANCEL}
                    </Button>
                    <Button
                        type="submit"
                        form="create-session-from-template"
                        variant="primary"
                        size="sm"
                        className={cn(SESSION_PROG_FORM_FOOTER_BTN, SESSION_PROG_FORM_SUBMIT_CTA)}
                        disabled={isCreating || !trainerId || !clientId}
                        isLoading={isCreating}
                    >
                        {CREATE_SESSION_FROM_TEMPLATE_SUBMIT}
                    </Button>
                </div>
            </DashboardFixedFooter>
        </div>
    );
};
