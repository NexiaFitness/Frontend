/**
 * TrainingPlansPage.tsx — Lista principal de training plans del trainer
 *
 * Contexto:
 * - Vista protegida (solo trainers) con lista de training plans.
 * - Integra búsqueda y formulario inline para crear plans.
 * - Usa DashboardLayout para consistencia visual.
 * - FASE 1: Solo CRUD básico (name, dates, goal, client assignment).
 *
 * Features:
 * - Lista completa de plans del trainer
 * - Formulario inline expandible (según wireframe 3)
 * - Create/Delete básico
 * - Estados: loading, error, empty
 * - Sin modal (formulario se expande en la misma página)
 *
 * Diferencias con ClientList:
 * - Backend devuelve array directo (no paginación con metadata)
 * - Formulario inline en lugar de modal
 * - Filtros postponed a Fase 2
 *
 * Notas de mantenimiento:
 * - useGetTrainingPlansQuery requiere client_id (trainer role)
 * - Cache se invalida automáticamente en create/delete
 * - Responsive mobile-first
 *
 * @author Frontend Team
 * @since v3.2.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    useGetTrainingPlansQuery,
    useCreateTrainingPlanMutation,
    useDeleteTrainingPlanMutation,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { RootState } from "@nexia/shared/store";
import type { TrainingPlan, TrainingPlanFormData, TrainingPlanFormErrors } from "@nexia/shared/types/training";

// Layouts
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";

// UI
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";

// Utils
import { TYPOGRAPHY } from "@/utils/typography";

export const TrainingPlansPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    
    // Obtener perfil del trainer para obtener trainer_id correcto
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });
    const trainerId = trainerProfile?.id;

    // State para mostrar/ocultar formulario
    const [showCreateForm, setShowCreateForm] = useState(false);

    // State del formulario
    const [formData, setFormData] = useState<TrainingPlanFormData>({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        goal: "",
        client_id: undefined,
    });

    const [formErrors, setFormErrors] = useState<TrainingPlanFormErrors>({});

    // RTK Query hooks
    const { data: plans = [], isLoading, isError, error } = useGetTrainingPlansQuery(
        { trainer_id: trainerId },
        { skip: !trainerId } // No hacer query si no hay trainerId
    );

    // Obtener clientes para el dropdown
    const { data: clientsData } = useGetClientsQuery({
        filters: {},
        page: 1,
        per_page: 100, // Cargar suficientes para dropdown
    });

    const clients = clientsData?.items ?? [];

    const [createPlan, { isLoading: isCreating }] = useCreateTrainingPlanMutation();
    const [deletePlan, { isLoading: isDeleting }] = useDeleteTrainingPlanMutation();

    // Handlers
    const handleInputChange = (field: keyof TrainingPlanFormData, value: string | number | undefined) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Limpiar error del campo
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: TrainingPlanFormErrors = {};

        if (!formData.name.trim()) {
            errors.name = "El nombre es obligatorio";
        }

        if (!formData.start_date) {
            errors.start_date = "La fecha de inicio es obligatoria";
        }

        if (!formData.end_date) {
            errors.end_date = "La fecha de fin es obligatoria";
        }

        if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
            errors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
        }

        if (!formData.goal.trim()) {
            errors.goal = "El objetivo es obligatorio";
        }

        // client_id es obligatorio según backend (nullable=False)
        if (!formData.client_id) {
            errors.client_id = "Debes asignar un cliente al plan";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreatePlan = async () => {
        if (!validateForm() || !trainerId) return;

        try {
            // Validar que client_id existe (ya validado en validateForm pero double-check)
            if (!formData.client_id) {
                setFormErrors({ general: "Debes seleccionar un cliente para crear el plan." });
                return;
            }

            await createPlan({
                trainer_id: trainerId,
                client_id: formData.client_id, // Obligatorio según backend
                name: formData.name,
                description: formData.description || null,
                start_date: formData.start_date,
                end_date: formData.end_date,
                goal: formData.goal,
                status: "active",
            }).unwrap();

            // Reset formulario
            setFormData({
                name: "",
                description: "",
                start_date: "",
                end_date: "",
                goal: "",
                client_id: undefined,
            });
            setShowCreateForm(false);
        } catch (err) {
            console.error("Error creating plan:", err);
            setFormErrors({ general: "Error al crear el plan. Intenta de nuevo." });
        }
    };

    const handleDeletePlan = async (planId: number) => {
        if (!window.confirm("¿Estás seguro de eliminar este plan?")) return;

        try {
            await deletePlan(planId).unwrap();
        } catch (err) {
            console.error("Error deleting plan:", err);
        }
    };

    const handleEditPlan = (planId: number) => {
        navigate(`/dashboard/training-plans/${planId}`);
    };

    // Items del menú superior
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            {/* Navbar móvil/tablet */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Sidebar escritorio */}
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Training Plans
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Gestiona los planes de entrenamiento de tus clientes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar (según wireframe) */}
                <div className="px-4 lg:px-8 mb-6">
                    <Input
                        type="text"
                        placeholder="Search Training Plan"
                        className="w-full max-w-2xl"
                        disabled // TODO: Fase 2 - Implementar búsqueda
                    />
                </div>

                {/* Create Training Plan Section (según wireframe 3) */}
                <div className="px-4 lg:px-8 mb-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                        {/* Header del formulario */}
                        <div className="p-4 lg:p-6 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-lg lg:text-xl font-bold text-slate-800">
                                Create Training Plan
                            </h3>
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                            >
                                {showCreateForm ? "−" : "+"}
                            </button>
                        </div>

                        {/* Formulario expandible */}
                        {showCreateForm && (
                            <div className="p-4 lg:p-6 space-y-4">
                                {formErrors.general && (
                                    <Alert variant="error">{formErrors.general}</Alert>
                                )}

                                {/* Warning si no hay clientes */}
                                {clients.length === 0 && (
                                    <Alert variant="error">
                                        No tienes clientes disponibles. Por favor, crea un cliente primero desde la sección de Clientes.
                                    </Alert>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Name
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., Fall 2025 Plan"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            error={formErrors.name}
                                        />
                                    </div>

                                    {/* Assign Clients (obligatorio según backend) */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Assign Client <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.client_id || ""}
                                            onChange={(e) => handleInputChange("client_id", e.target.value ? Number(e.target.value) : undefined)}
                                            disabled={clients.length === 0}
                                            className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                                clients.length === 0 ? "bg-slate-100 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            <option value="">
                                                {clients.length === 0 ? "No clients available" : "Select a client"}
                                            </option>
                                            {clients.map((client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.nombre} {client.apellidos}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.client_id && (
                                            <p className="text-red-600 text-sm mt-1">{formErrors.client_id}</p>
                                        )}
                                        {clients.length === 0 && (
                                            <p className="text-amber-600 text-sm mt-1">
                                                Crea al menos un cliente para poder crear planes.
                                            </p>
                                        )}
                                    </div>

                                    {/* Start Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => handleInputChange("start_date", e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        {formErrors.start_date && (
                                            <p className="text-red-600 text-sm mt-1">{formErrors.start_date}</p>
                                        )}
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => handleInputChange("end_date", e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        {formErrors.end_date && (
                                            <p className="text-red-600 text-sm mt-1">{formErrors.end_date}</p>
                                        )}
                                    </div>

                                    {/* Goal */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Goal
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., Muscle Gain, Weight Loss"
                                            value={formData.goal}
                                            onChange={(e) => handleInputChange("goal", e.target.value)}
                                            error={formErrors.goal}
                                        />
                                    </div>

                                    {/* Description (opcional) */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange("description", e.target.value)}
                                            placeholder="Add notes about this plan..."
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
                                        />
                                    </div>
                                </div>

                                {/* Botón Create */}
                                <div className="flex justify-end">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={handleCreatePlan}
                                        disabled={isCreating || clients.length === 0}
                                    >
                                        {isCreating ? "Creating..." : "Create"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de Training Plans */}
                <div className="px-4 lg:px-8 mb-8">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" />
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Alert variant="error" className="mb-6">
                            Error al cargar planes:{" "}
                            {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data
                                ? String(error.data.detail)
                                : error && "status" in error && error.status === 400
                                ? "Debes especificar un trainer_id o client_id"
                                : "Error desconocido"}
                        </Alert>
                    )}

                    {/* Warning: No trainer profile */}
                    {!trainerId && !isLoading && user?.role === "trainer" && (
                        <Alert variant="error" className="mb-6">
                            No se pudo cargar tu perfil de trainer. Por favor, completa tu perfil primero.
                        </Alert>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && plans.length === 0 && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-slate-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">
                                    You don&apos;t have any training plans yet.
                                </h3>
                                {clients.length === 0 ? (
                                    <>
                                        <p className="text-slate-600 mb-4">
                                            Para crear un plan, primero necesitas tener al menos un cliente.
                                        </p>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={() => navigate("/dashboard/clients/onboarding")}
                                        >
                                            + Crear Primer Cliente
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-slate-600 mb-6">
                                            Start by creating your first one!
                                        </p>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={() => setShowCreateForm(true)}
                                        >
                                            + Create First Plan
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Lista de planes (según wireframe 2) */}
                    {!isLoading && !isError && plans.length > 0 && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                            <div className="divide-y divide-slate-200">
                                {plans.map((plan: TrainingPlan) => (
                                    <div
                                        key={plan.id}
                                        className="p-4 lg:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-slate-800 mb-1">
                                                {plan.name}
                                            </h4>
                                            <p className="text-sm text-slate-600">
                                                {plan.start_date} → {plan.end_date} | {plan.goal}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditPlan(plan.id)}
                                            >
                                                Edit
                                            </Button>
                                            <button
                                                onClick={() => handleDeletePlan(plan.id)}
                                                disabled={isDeleting}
                                                className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                                            >
                                                X
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
};