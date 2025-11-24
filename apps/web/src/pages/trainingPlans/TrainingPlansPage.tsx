/**
 * TrainingPlansPage.tsx — Gestión completa de Training Plans
 *
 * Contexto:
 * - Vista principal con tres secciones: Templates, Planes Activos, Archivados
 * - Integra hooks reutilizables de packages/shared
 * - Diseño consistente con otros dashboards
 *
 * Features:
 * - Biblioteca de plantillas (templates) reutilizables
 * - Planes activos asignados a clientes
 * - Historial de planes archivados
 * - Acciones contextuales según tipo
 *
 * @author Frontend Team
 * @since v3.2.0
 * @updated v5.0.0 - Rediseño completo con templates e instances
 */

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    useGetTrainingPlansQuery,
    useGetTrainingPlanTemplatesQuery,
    useDeleteTrainingPlanMutation,
    useDeleteTrainingPlanTemplateMutation,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import {
    useTrainingPlanTemplates,
    useConvertPlanToTemplate,
} from "@nexia/shared/hooks/training";
import type { RootState } from "@nexia/shared/store";

// Layouts
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";

// Components
import { TrainingPlansSection, AssignTemplateModal } from "@/components/trainingPlans";
import { Alert } from "@/components/ui/feedback";

// Utils
import { TYPOGRAPHY } from "@/utils/typography";

export const TrainingPlansPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    
    // Obtener perfil del trainer
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });
    const trainerId = trainerProfile?.id;

    // Estado del modal de asignación
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");

    // Estados de feedback
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Auto-dismiss de mensajes después de 5 segundos
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 7000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Hooks de datos con refetch
    // IMPORTANTE: No usar non-null assertion (!) cuando el valor puede ser undefined
    // RTK Query puede ejecutar query() antes de evaluar skip, causando errores
    const {
        data: templates = [],
        isLoading: isLoadingTemplates,
        refetch: refetchTemplates,
    } = useGetTrainingPlanTemplatesQuery(
        // Solo pasar parámetros si trainerId existe
        trainerId ? { trainerId } : { trainerId: 0 },
        { skip: !trainerId }
    );

    const {
        data: plans = [],
        isLoading: isLoadingPlans,
        refetch: refetchPlans,
    } = useGetTrainingPlansQuery(
        trainerId ? { trainer_id: trainerId } : { trainer_id: 0 },
        { skip: !trainerId }
    );

    // Obtener clientes para nombres
    const { data: clientsData } = useGetTrainerClientsQuery(
        {
            trainerId: trainerId!,
            filters: {},
            page: 1,
            per_page: 50,
        },
        { skip: !trainerId }
    );

    // Map de client_id -> nombre
    const clientNamesMap = useMemo(() => {
    const clients = clientsData?.items ?? [];
        const map: Record<number, string> = {};
        clients.forEach((client) => {
            map[client.id] = `${client.nombre} ${client.apellidos}`;
        });
        return map;
    }, [clientsData?.items]);

    // Hooks de acciones
    const {
        duplicateTemplate,
    } = useTrainingPlanTemplates({
        trainerId: trainerId!,
    });
    const { convertPlan } = useConvertPlanToTemplate();
    const [deletePlan] = useDeleteTrainingPlanMutation();
    const [deleteTemplateMutation] = useDeleteTrainingPlanTemplateMutation();

    // Filtrar planes por estado
    const activePlans = useMemo(() => {
        return plans.filter((plan) => plan.status === "active" && plan.is_active);
    }, [plans]);

    const archivedPlans = useMemo(() => {
        return plans.filter((plan) => plan.status === "completed" || plan.status === "cancelled" || !plan.is_active);
    }, [plans]);

    // Handlers
    const handleAssignTemplate = (templateId: number) => {
        const template = templates.find((t) => t.id === templateId);
        setSelectedTemplateId(templateId);
        setSelectedTemplateName(template?.name || "");
        setAssignModalOpen(true);
    };

    const handleAssignSuccess = () => {
        setAssignModalOpen(false);
        setSelectedTemplateId(null);
        setSelectedTemplateName("");
        setSuccessMessage("Plantilla asignada exitosamente al cliente");
        // Refetch automático por RTK Query, pero forzamos para asegurar
        refetchPlans();
        refetchTemplates();
    };

    // Estados de procesamiento por ID
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

    const addProcessingId = (id: number) => {
        setProcessingIds((prev) => new Set(prev).add(id));
    };

    const removeProcessingId = (id: number) => {
        setProcessingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };

    const handleDuplicateTemplate = async (templateId: number) => {
        addProcessingId(templateId);
        try {
            await duplicateTemplate(templateId);
            setSuccessMessage("Plantilla duplicada exitosamente");
            refetchTemplates();
        } catch (err) {
            console.error("Error duplicating template:", err);
            setErrorMessage("Error al duplicar la plantilla. Intenta de nuevo.");
        } finally {
            removeProcessingId(templateId);
        }
    };

    const handleDeleteTemplate = async (templateId: number) => {
        const template = templates.find((t) => t.id === templateId);
        if (!window.confirm(`¿Estás seguro de eliminar la plantilla "${template?.name || ""}"?`)) return;

        addProcessingId(templateId);
        try {
            await deleteTemplateMutation(templateId).unwrap();
            setSuccessMessage("Plantilla eliminada exitosamente");
            refetchTemplates();
        } catch (err) {
            console.error("Error deleting template:", err);
            setErrorMessage("Error al eliminar la plantilla. Intenta de nuevo.");
        } finally {
            removeProcessingId(templateId);
        }
    };

    const handleConvertToTemplate = async (planId: number) => {
        const plan = plans.find((p) => p.id === planId);
        if (!plan) return;

        const templateName = window.prompt(
            "Ingresa un nombre para la plantilla:",
            `${plan.name} (Plantilla)`
        );
        if (!templateName || !templateName.trim()) return;

        addProcessingId(planId);
        try {
            await convertPlan({
                plan_id: planId,
                template_data: {
                    trainer_id: trainerId!,
                    name: templateName.trim(),
                    goal: plan.goal,
                    description: plan.description || undefined,
                },
            });
            setSuccessMessage("Plan convertido a plantilla exitosamente");
            refetchPlans();
            refetchTemplates();
        } catch (err) {
            console.error("Error converting plan to template:", err);
            setErrorMessage("Error al convertir el plan a plantilla. Intenta de nuevo.");
        } finally {
            removeProcessingId(planId);
        }
    };

    const handleDeletePlan = async (planId: number) => {
        const plan = plans.find((p) => p.id === planId);
        if (!window.confirm(`¿Estás seguro de eliminar el plan "${plan?.name || ""}"?`)) return;

        addProcessingId(planId);
        try {
            await deletePlan(planId).unwrap();
            setSuccessMessage("Plan eliminado exitosamente");
            refetchPlans();
        } catch (err) {
            console.error("Error deleting plan:", err);
            setErrorMessage("Error al eliminar el plan. Intenta de nuevo.");
        } finally {
            removeProcessingId(planId);
        }
    };

    const handleEditPlan = (planId: number) => {
        navigate(`/dashboard/training-plans/${planId}`);
    };

    const handleViewPlan = (planId: number) => {
        navigate(`/dashboard/training-plans/${planId}`);
    };

    const handleCreateTemplate = () => {
        // TODO: Navegar a página de crear template o abrir modal
        navigate("/dashboard/training-plans/templates/create");
    };

    const handleCreatePlan = () => {
        // TODO: Navegar a página de crear plan o abrir modal
        navigate("/dashboard/training-plans/create");
    };

    // Items del menú superior
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    const isLoading = isLoadingTemplates || isLoadingPlans;

    return (
        <>
            {/* Navbar móvil/tablet */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Sidebar escritorio */}
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Training Plans
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Gestiona tus plantillas y planes activos de forma centralizada
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mensajes de feedback */}
                {successMessage && (
                <div className="px-4 lg:px-8 mb-6">
                        <Alert variant="success" onDismiss={() => setSuccessMessage(null)}>
                            {successMessage}
                                    </Alert>
                        </div>
                    )}

                {errorMessage && (
                    <div className="px-4 lg:px-8 mb-6">
                        <Alert variant="error" onDismiss={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                    </div>
                    )}

                {/* Error si no hay trainerId */}
                    {!trainerId && !isLoading && user?.role === "trainer" && (
                    <div className="px-4 lg:px-8 mb-6">
                        <Alert variant="error">
                            No se pudo cargar tu perfil de trainer. Por favor, completa tu perfil primero.
                        </Alert>
                        </div>
                    )}

                {/* Sección 1: Modelos Base (Plantillas) */}
                <TrainingPlansSection
                    title="Biblioteca de Modelos Base"
                    description="Plantillas reutilizables que puedes asignar a múltiples clientes"
                    items={templates}
                    type="template"
                    onCreate={handleCreateTemplate}
                    onAssign={handleAssignTemplate}
                    onDuplicate={handleDuplicateTemplate}
                    onDelete={handleDeleteTemplate}
                    onEdit={handleViewPlan}
                    isLoading={isLoadingTemplates}
                    processingIds={processingIds}
                />

                {/* Sección 2: Planes Activos */}
                <TrainingPlansSection
                    title="Planes Activos"
                    description="Planes de entrenamiento asignados a clientes actualmente"
                    items={activePlans}
                    type="active"
                    clientNames={clientNamesMap}
                    onCreate={handleCreatePlan}
                    onConvert={handleConvertToTemplate}
                    onDelete={handleDeletePlan}
                    onEdit={handleEditPlan}
                    onView={handleViewPlan}
                    isLoading={isLoadingPlans}
                    processingIds={processingIds}
                />

                {/* Sección 3: Archivados */}
                <TrainingPlansSection
                    title="Archivados"
                    description="Planes completados o inactivos"
                    items={archivedPlans}
                    type="archived"
                    clientNames={clientNamesMap}
                    onView={handleViewPlan}
                    onDelete={handleDeletePlan}
                    isLoading={isLoadingPlans}
                    processingIds={processingIds}
                />

                {/* Modal de Asignar Plantilla */}
                <AssignTemplateModal
                    open={assignModalOpen}
                    onClose={() => {
                        setAssignModalOpen(false);
                        setSelectedTemplateId(null);
                        setSelectedTemplateName("");
                    }}
                    templateId={selectedTemplateId}
                    templateName={selectedTemplateName}
                    onSuccess={handleAssignSuccess}
                />
            </DashboardLayout>
        </>
    );
};
