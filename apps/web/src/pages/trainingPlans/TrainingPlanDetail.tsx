/**
 * TrainingPlanDetail.tsx — Página de detalle del training plan
 *
 * Contexto:
 * - Vista completa del plan con tabs
 * - Tabs: Sesiones, Planificación, Hitos, Gráficos
 * - Layout: Breadcrumbs + Header + Tabs + Content
 *
 * Responsabilidades:
 * - Cargar datos del plan con RTK Query
 * - Gestionar navegación entre tabs
 * - Retorno al cliente vía header/breadcrumbs (sin tab duplicado en la barra)
 *
 * @author Frontend Team
 * @since v3.3.0
 * @updated v6.2.1 - Corregido bucle de navegación al usar el tab 'Volver'.
 * @updated U13 Fase 4.3 - Breadcrumbs Cliente > Planificación > Plan y botón Volver al cliente con ?fromClient
 * @updated 2026-04 - Sin margen negativo: respeta padding de DashboardShell y navbar sticky.
 * @updated 2026-04 - Header alineado con ClientHeader; TabsBar como ClientDetail.
 * @updated 2026-04 - Sin tab "Volver al Cliente" en la barra (mismo acceso en header).
 * @updated 2026-04 - Editar / Eliminar plan en barra fija inferior (mismo patrón que CreateSession).
 */

import React, { useState, Suspense, lazy, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useTrainingPlanQuickDescription } from "@/hooks/trainingPlans/useTrainingPlanQuickDescription";
import {
    useGetTrainingPlanQuery,
    useDeleteTrainingPlanMutation,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetTrainerClientsQuery, useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import type { Client } from "@nexia/shared/types/client";
import { getMutationErrorMessage } from "@nexia/shared";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { TabsBar } from "@/components/ui/tabs";

// Tabs components - estáticos (carga inmediata)
import {
    TrainingPlanHeader,
    MilestonesTab,
    SessionsTab,
    PlanPeriodizationSection,
    AssignPlanModal,
} from "@/components/trainingPlans";
import { DeleteTrainingPlanModal } from "@/components/trainingPlans/DeleteTrainingPlanModal";

// Lazy loading para tabs pesados (carga bajo demanda)
const ChartsTab = lazy(() => 
    import("@/components/trainingPlans").then(module => ({
        default: module.ChartsTab
    }))
);

type TabId = "sessions" | "planning" | "milestones" | "charts";

interface Tab {
    id: TabId;
    label: string;
}

const TABS: Tab[] = [
    { id: "sessions", label: "Sesiones" },
    { id: "planning", label: "Planificación" },
    { id: "milestones", label: "Hitos" },
    { id: "charts", label: "Gráficos" },
];

const PLAN_DETAIL_VALID_TABS: TabId[] = ["sessions", "planning", "milestones", "charts"];

export const TrainingPlanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useSelector((state: RootState) => state.auth.user);
    const { showError } = useToast();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletePlan, { isLoading: isDeletingPlan }] = useDeleteTrainingPlanMutation();

    // U13 Fase 4.3: origen cliente ?fromClient= | ?returnToClient= (lista de planes / flujos legacy)
    const fromClientParam = searchParams.get("fromClient");
    const returnToClientParam = searchParams.get("returnToClient");
    const parsedFromClient = fromClientParam ? parseInt(fromClientParam, 10) : NaN;
    const parsedReturnToClient = returnToClientParam ? parseInt(returnToClientParam, 10) : NaN;
    const fromClientId = !isNaN(parsedFromClient) ? parsedFromClient : null;
    const returnToClientId = !isNaN(parsedReturnToClient) ? parsedReturnToClient : null;
    const contextClientId = fromClientId ?? returnToClientId;

    const { activeTab, setActiveTab } = useTabNavigation<TabId>({
        validTabs: PLAN_DETAIL_VALID_TABS,
        defaultTab: "sessions",
    });

    const planId = parseInt(id || "0", 10);
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    // Obtener perfil del trainer para obtener trainer_id correcto
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });
    const trainerId = trainerProfile?.id;

    // Cargar datos del plan
    const { data: plan, isLoading, isError, error, refetch } = useGetTrainingPlanQuery(planId, {
        skip: !id || isNaN(planId),
    });

    const { saveDescriptionNote, isSavingDescription } = useTrainingPlanQuickDescription(plan, planId);

    const handleDeletePlanConfirm = useCallback(async () => {
        if (!plan) return;
        try {
            await deletePlan(plan.id).unwrap();
            if (plan.client_id) {
                navigate(`/dashboard/clients/${plan.client_id}?tab=sessions`);
            } else {
                navigate("/dashboard/training-plans");
            }
        } catch (err: unknown) {
            console.error("Error deleting plan:", err);
            showError(getMutationErrorMessage(err));
        } finally {
            setDeleteModalOpen(false);
        }
    }, [plan, deletePlan, navigate, showError]);

    // Cargar clientes del trainer para obtener el nombre del cliente asignado
    const { data: clientsData } = useGetTrainerClientsQuery(
        {
            trainerId: trainerId!,
            filters: {},
            page: 1,
            per_page: 50,
        },
        {
            skip: !trainerId,
        }
    );

    const clients = clientsData?.items ?? [];
    const assignedClient = clients.find((c: Client) => c.id === plan?.client_id);

    // U13: cliente para breadcrumbs/Volver cuando fromClient / returnToClient en URL
    const { data: fromClientData } = useGetClientQuery(contextClientId!, {
        skip: !contextClientId || (!!assignedClient && assignedClient.id === contextClientId),
    });
    const fromClientClient =
        assignedClient?.id === contextClientId ? assignedClient : fromClientData;
    const clientIdForVolver = contextClientId ?? plan?.client_id ?? null;

    const clientForHeader = fromClientClient ?? assignedClient ?? null;
    const clientName = clientForHeader
        ? `${clientForHeader.nombre} ${clientForHeader.apellidos}`
        : undefined;

    // U13 Fase 4.3: Breadcrumbs según origen (fromClient → Cliente > Planificación > Plan)
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
    ];

    const clientForBreadcrumb = contextClientId ? fromClientClient : assignedClient;
    const clientIdForBreadcrumb = contextClientId ?? assignedClient?.id;
    const clientLabel = clientForBreadcrumb
        ? `${clientForBreadcrumb.nombre} ${clientForBreadcrumb.apellidos}`
        : clientIdForBreadcrumb
          ? "Cliente"
          : undefined;

    if (clientIdForBreadcrumb && clientLabel) {
        breadcrumbItems.push({
            label: clientLabel,
            path: `/dashboard/clients/${clientIdForBreadcrumb}`,
        });
    }

    // Con contexto cliente (fromClient / returnToClient): añadir "Planificación" antes del plan
    if (contextClientId && clientIdForBreadcrumb) {
        breadcrumbItems.push({
            label: "Planificación",
            path: `/dashboard/clients/${clientIdForBreadcrumb}?tab=planificacion`,
        });
    }

    if (plan) {
        breadcrumbItems.push({
            label: plan.name,
            active: true,
        });
    }

    // Validación de ID
    if (!id || isNaN(planId)) {
        return (
            <div className="p-6">
                <Alert variant="error">ID de plan de entrenamiento inválido</Alert>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error state profesional
    if (isError || !plan) {
        const isNotFound = error && 'status' in error && error.status === 404;

        return (
            <div className="p-6">
                <Alert
                    variant="error"
                    action={
                        <>
                            {!isNotFound && (
                                <Button variant="outline-destructive" size="sm" onClick={() => refetch()}>
                                    Reintentar
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/training-plans")}>
                                Volver a Planes
                            </Button>
                        </>
                    }
                >
                    {isNotFound
                        ? "El plan de entrenamiento solicitado no existe o ha sido eliminado."
                        : "Error al cargar el plan de entrenamiento. Por favor, intenta de nuevo."}
                </Alert>
            </div>
        );
    }

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case "sessions":
                return <SessionsTab planId={planId} />;
            case "planning":
                return (
                    <PlanPeriodizationSection
                        planId={planId}
                        clientId={contextClientId ?? plan.client_id ?? undefined}
                    />
                );
            case "milestones":
                return <MilestonesTab planId={planId} />;
            case "charts":
                return (
                    <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <ChartsTab
                            planId={planId}
                            planStartDate={plan.start_date}
                            planEndDate={plan.end_date}
                        />
                    </Suspense>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 pb-28" data-testid="training-plan-detail">
            <TrainingPlanHeader
                plan={plan}
                client={clientForHeader}
                clientName={clientName}
                breadcrumbItems={breadcrumbItems}
                onAssignPlan={
                    plan.client_id ? undefined : () => setAssignModalOpen(true)
                }
                volverAlClienteClientId={
                    contextClientId != null ? undefined : (clientIdForVolver ?? undefined)
                }
                onSaveDescriptionNote={saveDescriptionNote}
                isSavingDescription={isSavingDescription}
            />

            <AssignPlanModal
                open={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                planId={planId}
                planName={plan.name}
                onSuccess={() => {
                    setAssignModalOpen(false);
                    refetch();
                }}
            />

            <DeleteTrainingPlanModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeletePlanConfirm}
                plan={plan}
                isLoading={isDeletingPlan}
            />

            <TabsBar
                items={TABS.map((t) => ({ id: t.id, label: t.label }))}
                value={activeTab}
                onChange={(tabId) => setActiveTab(tabId as TabId)}
                ariaLabel="Tabs del plan"
            />

            <div className="pt-2 pb-8">{renderTabContent()}</div>

            <div
                className="fixed bottom-0 right-0 z-30 border-t border-border bg-background px-6 py-4"
                style={{ left: "var(--sidebar-width, 0)" }}
            >
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/training-plans/${plan.id}/edit`)}
                    >
                        Editar Plan
                    </Button>
                    <Button
                        type="button"
                        variant="outline-destructive"
                        size="sm"
                        onClick={() => setDeleteModalOpen(true)}
                    >
                        Eliminar Plan
                    </Button>
                </div>
            </div>
        </div>
    );
};
