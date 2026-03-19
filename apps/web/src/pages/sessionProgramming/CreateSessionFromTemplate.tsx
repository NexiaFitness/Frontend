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

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input, FormSelect } from "@/components/ui/forms";
import { useCreateSessionFromTemplate } from "@nexia/shared";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingPlansQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { RootState } from "@nexia/shared/store";

export const CreateSessionFromTemplate: React.FC = () => {
    const navigate = useNavigate();
    const { templateId } = useParams<{ templateId: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state: RootState) => state.auth);

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: user?.role !== "trainer",
    });
    const clientIdFromQuery = searchParams.get("clientId");
    const clientId = clientIdFromQuery ? Number(clientIdFromQuery) : 0;
    const trainerId = trainerProfile?.id ?? 0;

    const { createSession, isCreating, isError, error, template, isLoadingTemplate } =
        useCreateSessionFromTemplate({
            templateId: Number(templateId || 0),
            clientId,
            trainerId,
        });

    const { data: client } = useGetClientQuery(clientId, { skip: !clientId });
    const { data: trainingPlans } = useGetTrainingPlansQuery(
        { client_id: clientId, limit: 100 },
        { skip: !clientId }
    );

    const [formData, setFormData] = useState({
        sessionDate: new Date().toISOString().split("T")[0],
        trainingPlanId: "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!templateId || !clientId) {
            navigate("/dashboard");
        }
    }, [templateId, clientId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        setSuccess(false);

        const errors: Record<string, string> = {};
        if (!formData.sessionDate) {
            errors.sessionDate = "La fecha es obligatoria";
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
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                Usar Template
                            </h2>
                            <p className="text-muted-foreground text-sm md:text-base">
                                Crear sesión desde template: <strong>{template.name}</strong>
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
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
                            {/* Cliente (read-only) */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Cliente
                                </label>
                                <Input
                                    type="text"
                                    value={client ? `${client.nombre} ${client.apellidos}` : "Cargando..."}
                                    disabled
                                    className="bg-muted"
                                />
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
                                        setFormData({ ...formData, sessionDate: e.target.value })
                                    }
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                />
                                {formErrors.sessionDate && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.sessionDate}</p>
                                )}
                            </div>

                            {/* Plan de entrenamiento (Fase 6: requerido) */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Plan de entrenamiento
                                </label>
                                <FormSelect
                                    value={formData.trainingPlanId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, trainingPlanId: e.target.value })
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

                            {/* Botones */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate(-1)}
                                    className="w-full sm:w-auto"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={isCreating || !trainerId}
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


