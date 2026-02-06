/**
 * TrainingPlanEdit.tsx — Página de edición de training plan
 *
 * Contexto:
 * - Permite editar datos básicos del plan (nombre, fechas, objetivo, estado)
 * - Layout consistente con otras vistas de edición del dashboard
 * - Usa useTrainingPlans hook para actualizar
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea, FormSelect } from "@/components/ui/forms";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useTrainingPlans } from "@nexia/shared/hooks/training";
import { TYPOGRAPHY_COMBINATIONS } from "@/utils/typography";
import type { TrainingPlanUpdate } from "@nexia/shared/types/training";

const PLAN_STATUS_OPTIONS = [
    { value: "active", label: "Activo" },
    { value: "completed", label: "Completado" },
    { value: "paused", label: "Pausado" },
    { value: "cancelled", label: "Cancelado" },
];

export const TrainingPlanEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const planId = parseInt(id || "0", 10);

    const { data: plan, isLoading, error } = useGetTrainingPlanQuery(planId, {
        skip: !id || isNaN(planId),
    });

    const { updatePlan, isUpdating } = useTrainingPlans();

    // Estado del formulario
    const [formData, setFormData] = useState<TrainingPlanUpdate>({
        name: plan?.name || "",
        description: plan?.description || null,
        start_date: plan?.start_date || "",
        end_date: plan?.end_date || "",
        goal: plan?.goal || "",
        status: plan?.status || "active",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Actualizar formData cuando el plan se carga
    React.useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name,
                description: plan.description || null,
                start_date: plan.start_date,
                end_date: plan.end_date,
                goal: plan.goal,
                status: plan.status,
            });
        }
    }, [plan]);

    // Menu items para navbar
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    // Validación
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = "El nombre es obligatorio";
        }

        if (!formData.start_date) {
            newErrors.start_date = "La fecha de inicio es obligatoria";
        }

        if (!formData.end_date) {
            newErrors.end_date = "La fecha de fin es obligatoria";
        }

        if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
            newErrors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
        }

        if (!formData.goal?.trim()) {
            newErrors.goal = "El objetivo es obligatorio";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler de submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await updatePlan(planId, formData);
            setSuccessMessage("Plan actualizado exitosamente");
            setTimeout(() => {
                navigate(`/dashboard/training-plans/${planId}`);
            }, 1500);
        } catch (err) {
            console.error("Error updating plan:", err);
            setErrors({
                general: "Error al actualizar el plan. Intenta de nuevo.",
            });
        }
    };

    // Validación de ID
    if (!id || isNaN(planId)) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">ID de plan inválido</Alert>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="flex items-center justify-center min-h-screen">
                        <LoadingSpinner size="lg" />
                    </div>
                </DashboardLayout>
            </>
        );
    }

    // Error state
    if (error || !plan) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">
                            Error al cargar el plan. Por favor, intenta nuevamente.
                        </Alert>
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/dashboard/training-plans")}
                            >
                                Volver a la lista
                            </Button>
                        </div>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />
            <DashboardLayout>
                {/* Encabezado responsive igual a dashboards */}
                <div className="mb-8 lg:mb-12 text-center px-4 lg:px-8">
                    <h2 className={TYPOGRAPHY_COMBINATIONS.dashboardHeroTitle}>
                        Editar Plan de Entrenamiento
                    </h2>
                    <p className={TYPOGRAPHY_COMBINATIONS.dashboardHeroSubtitle}>
                        Modifica los datos básicos del plan de entrenamiento
                    </p>
                </div>

                {/* Contenido principal con ancho completo */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    {/* Success Message */}
                    {successMessage && (
                        <Alert variant="success" className="mb-6">
                            {successMessage}
                        </Alert>
                    )}

                    {/* Error Message */}
                    {errors.general && (
                        <Alert variant="error" className="mb-6">
                            {errors.general}
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                            <div className="space-y-6">
                                {/* Nombre — label con htmlFor para accesibilidad y getByLabel E2E */}
                                <div>
                                    <label
                                        htmlFor="edit-plan-name"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Nombre del Plan <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="edit-plan-name"
                                        type="text"
                                        value={formData.name || ""}
                                        onChange={(e) => {
                                            setFormData((prev) => ({ ...prev, name: e.target.value }));
                                            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                                        }}
                                        error={errors.name}
                                        placeholder="ej., Plan Otoño 2025"
                                    />
                                </div>

                                {/* Objetivo */}
                                <div>
                                    <label
                                        htmlFor="edit-plan-goal"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Objetivo <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="edit-plan-goal"
                                        type="text"
                                        value={formData.goal || ""}
                                        onChange={(e) => {
                                            setFormData((prev) => ({ ...prev, goal: e.target.value }));
                                            if (errors.goal) setErrors((prev) => ({ ...prev, goal: "" }));
                                        }}
                                        error={errors.goal}
                                        placeholder="ej., Ganancia Muscular, Pérdida de Peso"
                                    />
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="edit-plan-start-date"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Fecha de Inicio <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="edit-plan-start-date"
                                            type="date"
                                            value={formData.start_date || ""}
                                            onChange={(e) => {
                                                setFormData((prev) => ({ ...prev, start_date: e.target.value }));
                                                if (errors.start_date) setErrors((prev) => ({ ...prev, start_date: "" }));
                                            }}
                                            error={errors.start_date}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="edit-plan-end-date"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Fecha de Fin <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="edit-plan-end-date"
                                            type="date"
                                            value={formData.end_date || ""}
                                            onChange={(e) => {
                                                setFormData((prev) => ({ ...prev, end_date: e.target.value }));
                                                if (errors.end_date) setErrors((prev) => ({ ...prev, end_date: "" }));
                                            }}
                                            error={errors.end_date}
                                            min={formData.start_date || undefined}
                                        />
                                    </div>
                                </div>

                                {/* Estado */}
                                <div>
                                    <label
                                        htmlFor="edit-plan-status"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Estado
                                    </label>
                                    <FormSelect
                                        id="edit-plan-status"
                                        options={PLAN_STATUS_OPTIONS}
                                        value={formData.status || "active"}
                                        onChange={(e) => {
                                            setFormData((prev) => ({ ...prev, status: e.target.value }));
                                        }}
                                    />
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción
                                    </label>
                                    <Textarea
                                        value={formData.description || ""}
                                        onChange={(e) => {
                                            setFormData((prev) => ({ ...prev, description: e.target.value || null }));
                                        }}
                                        placeholder="Añade notas sobre este plan..."
                                        rows={4}
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(`/dashboard/training-plans/${planId}`)}
                                        disabled={isUpdating}
                                        className="flex-1 sm:flex-none"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={isUpdating}
                                        disabled={isUpdating}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {isUpdating ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                </div>
            </DashboardLayout>
        </>
    );
};

