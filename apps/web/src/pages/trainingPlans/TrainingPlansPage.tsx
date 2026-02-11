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
    useUpdateTrainingPlanMutation,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import {
    useTrainingPlanTemplates,
    useConvertPlanToTemplate,
} from "@nexia/shared/hooks/training";
import { usePagination } from "@nexia/shared/hooks/common";
import type { RootState } from "@nexia/shared/store";

// Layouts
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";

// Components
import { TrainingPlansSection, AssignTemplateModal, AssignPlanModal, TemplatePreviewModal } from "@/components/trainingPlans";
import { Alert } from "@/components/ui/feedback";
import { TRAINER_MENU_ITEMS } from "@/config/trainerNavigation";
import { Pagination } from "@/components/ui/pagination";

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

    // Estado del modal de preview
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewTemplateId, setPreviewTemplateId] = useState<number | null>(null);

    // Modal asignar plan a cliente (desde lista o detalle)
    const [planIdForAssignModal, setPlanIdForAssignModal] = useState<number | null>(null);

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
    const [updatePlan] = useUpdateTrainingPlanMutation();

    // Filtrar planes por estado
    const activePlans = useMemo(() => {
        return plans.filter((plan) => plan.status === "active" && plan.is_active);
    }, [plans]);

    // Paginación para programas activos
    const ACTIVE_PLANS_PER_PAGE = 6;
    const {
        currentPage: activePlansPage,
        totalPages: totalActivePlansPages,
        paginatedItems: paginatedActivePlans,
        totalItems: totalActivePlans,
        setPage: setActivePlansPage,
    } = usePagination({
        items: activePlans,
        itemsPerPage: ACTIVE_PLANS_PER_PAGE,
        resetOnItemsChange: true,
    });

    const handleActivePlansPageChange = (page: number): void => {
        setActivePlansPage(page);
        // Scroll suave hacia arriba de la sección
        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    // Map de plan_id -> array de clientes (para mostrar múltiples avatares)
    // Agrupa planes con el mismo nombre o template_id para mostrar múltiples clientes
    const clientsMap = useMemo(() => {
        const clients = clientsData?.items ?? [];
        const map: Record<number, typeof clients> = {};
        
        // Primero, crear un mapa de nombre/template_id -> array de planes
        const plansByKey = new Map<string, typeof activePlans>();
        
        activePlans.forEach((plan) => {
            // Usar template_id si existe, sino usar nombre
            const key = plan.template_id ? `template_${plan.template_id}` : `name_${plan.name}`;
            if (!plansByKey.has(key)) {
                plansByKey.set(key, []);
            }
            plansByKey.get(key)!.push(plan);
        });
        
        // Para cada grupo de planes, agregar todos los clientes únicos
        plansByKey.forEach((planGroup) => {
            const uniqueClients = new Map<number, typeof clients[0]>();
            
            planGroup.forEach((plan) => {
                if (plan.client_id) {
                    const client = clients.find((c) => c.id === plan.client_id);
                    if (client && !uniqueClients.has(client.id)) {
                        uniqueClients.set(client.id, client);
                    }
                }
            });
            
            // Asignar los clientes a todos los planes del grupo
            const clientsArray = Array.from(uniqueClients.values());
            planGroup.forEach((plan) => {
                map[plan.id] = clientsArray;
            });
        });
        
        return map;
    }, [activePlans, clientsData?.items]);

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

    const handlePreviewTemplate = (templateId: number) => {
        setPreviewTemplateId(templateId);
        setPreviewModalOpen(true);
    };

    const handleUseTemplateFromPreview = () => {
        if (previewTemplateId) {
            setPreviewModalOpen(false);
            handleAssignTemplate(previewTemplateId);
        }
    };

    const handleAddClientToPlan = (planId: number): void => {
        setPlanIdForAssignModal(planId);
    };

    const handleStatusChange = async (planId: number, status: string) => {
        addProcessingId(planId);
        try {
            await updatePlan({
                id: planId,
                data: { status },
            }).unwrap();
            setSuccessMessage("Estado del plan actualizado exitosamente");
            refetchPlans();
        } catch (err) {
            console.error("Error updating plan status:", err);
            setErrorMessage("Error al actualizar el estado del plan");
        } finally {
            removeProcessingId(planId);
        }
    };

    const handleCreateTemplate = () => {
        navigate("/dashboard/training-plans/templates/create");
    };

    const handleCreatePlan = () => {
        navigate("/dashboard/training-plans/create");
    };

    const isLoading = isLoadingTemplates || isLoadingPlans;

    return (
        <>
            {/* Navbar móvil/tablet */}
            <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />

            {/* Sidebar escritorio */}
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 text-center px-4 lg:px-8">
                    <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                        Planificación de Entrenamiento
                    </h2>
                    <p className="text-white/80 text-sm md:text-base">
                        Crea y gestiona programas de entrenamiento y plantillas de sesiones
                    </p>
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

                {/* Sección 1: Programas Activos */}
                <TrainingPlansSection
                    title="Programas Activos"
                    description="Programas de entrenamiento asignados a clientes actualmente"
                    items={paginatedActivePlans}
                    type="active"
                    clientNames={clientNamesMap}
                    clientsMap={clientsMap}
                    onCreate={handleCreatePlan}
                    onConvert={handleConvertToTemplate}
                    onDelete={handleDeletePlan}
                    onEdit={handleEditPlan}
                    onView={handleViewPlan}
                    onAddClient={handleAddClientToPlan}
                    onStatusChange={handleStatusChange}
                    isLoading={isLoadingPlans}
                    processingIds={processingIds}
                />

                {/* Paginación para Programas Activos */}
                {totalActivePlansPages > 1 && (
                    <div className="px-4 lg:px-8 mb-8">
                        <Pagination
                            currentPage={activePlansPage}
                            totalPages={totalActivePlansPages}
                            totalItems={totalActivePlans}
                            itemsPerPage={ACTIVE_PLANS_PER_PAGE}
                            onPageChange={handleActivePlansPageChange}
                        />
                    </div>
                )}

                {/* Sección 2: Biblioteca de Templates */}
                <TrainingPlansSection
                    title="Biblioteca de Templates"
                    description="Plantillas reutilizables que puedes asignar a múltiples clientes"
                    items={templates}
                    type="template"
                    onCreate={handleCreateTemplate}
                    onAssign={handleAssignTemplate}
                    onDuplicate={handleDuplicateTemplate}
                    onDelete={handleDeleteTemplate}
                    onView={handleViewPlan}
                    onPreview={handlePreviewTemplate}
                    isLoading={isLoadingTemplates}
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

                {/* Modal de Asignar plan a cliente */}
                <AssignPlanModal
                    open={!!planIdForAssignModal}
                    onClose={() => setPlanIdForAssignModal(null)}
                    planId={planIdForAssignModal ?? 0}
                    planName={activePlans.find((p) => p.id === planIdForAssignModal)?.name ?? ""}
                    onSuccess={() => {
                        setPlanIdForAssignModal(null);
                        refetchPlans();
                    }}
                />

                {/* Modal de Preview de Template */}
                <TemplatePreviewModal
                    isOpen={previewModalOpen}
                    onClose={() => {
                        setPreviewModalOpen(false);
                        setPreviewTemplateId(null);
                    }}
                    templateId={previewTemplateId}
                    onUseTemplate={handleUseTemplateFromPreview}
                />
            </DashboardLayout>
        </>
    );
};
