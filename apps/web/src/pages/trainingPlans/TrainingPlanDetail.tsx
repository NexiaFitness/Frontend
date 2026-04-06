/**
 * TrainingPlanDetail.tsx — Página de detalle del training plan
 *
 * Contexto:
 * - Vista completa del plan con tabs
 * - Tabs: Volver, Sesiones, Hitos, Gráficos
 * - Layout: Breadcrumbs + Header + Tabs + Content
 *
 * Responsabilidades:
 * - Cargar datos del plan con RTK Query
 * - Gestionar navegación entre tabs
 * - Incluir tab de retorno al cliente para mejorar la UX
 *
 * @author Frontend Team
 * @since v3.3.0
 * @updated v6.2.1 - Corregido bucle de navegación al usar el tab 'Volver'.
 * @updated U13 Fase 4.3 - Breadcrumbs Cliente > Planificación > Plan y botón Volver al cliente con ?fromClient
 */

import React, { useState, Suspense, lazy } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetTrainerClientsQuery, useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import type { Client } from "@nexia/shared/types/client";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

// Tabs components - estáticos (carga inmediata)
import {
    TrainingPlanHeader,
    MilestonesTab,
    SessionsTab,
    PlanPeriodizationSection,
    AssignPlanModal,
} from "@/components/trainingPlans";

// Lazy loading para tabs pesados (carga bajo demanda)
const ChartsTab = lazy(() => 
    import("@/components/trainingPlans").then(module => ({
        default: module.ChartsTab
    }))
);

type TabId = "back" | "sessions" | "planning" | "milestones" | "charts";

interface Tab {
    id: TabId;
    label: string;
    icon?: React.ReactNode;
}

const TABS: Tab[] = [
    { 
        id: "back", 
        label: "Volver al Cliente",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
        )
    },
    { id: "sessions", label: "Sesiones" },
    { id: "planning", label: "Planificación" },
    { id: "milestones", label: "Hitos" },
    { id: "charts", label: "Gráficos" },
];

export const TrainingPlanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useSelector((state: RootState) => state.auth.user);

    // U13 Fase 4.3: origen cliente vía query param ?fromClient={client_id}
    const fromClientParam = searchParams.get("fromClient");
    const parsedFromClient = fromClientParam ? parseInt(fromClientParam, 10) : NaN;
    const fromClientId = !isNaN(parsedFromClient) ? parsedFromClient : null;

    // Tab navigation con query parameters - Sesiones por defecto
    const { activeTab, setActiveTab } = useTabNavigation<TabId>({
        validTabs: TABS.map((t) => t.id),
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
    const clientName = assignedClient
        ? `${assignedClient.nombre} ${assignedClient.apellidos}`
        : undefined;

    // U13: cliente para breadcrumbs/Volver cuando fromClient en URL (fallback: plan.client_id)
    const { data: fromClientData } = useGetClientQuery(fromClientId!, {
        skip: !fromClientId || (!!assignedClient && assignedClient.id === fromClientId),
    });
    const fromClientClient =
        assignedClient?.id === fromClientId ? assignedClient : fromClientData;
    const clientIdForVolver = fromClientId ?? plan?.client_id ?? null;

    // Manejador para cambiar de tab
    const handleTabChange = (tabId: TabId) => {
        if (tabId === "back") {
            const targetClientId = clientIdForVolver ?? assignedClient?.id;
            if (targetClientId) {
                navigate(`/dashboard/clients/${targetClientId}?tab=planificacion`);
            } else {
                navigate("/dashboard/clients");
            }
            return;
        }
        setActiveTab(tabId);
    };

    // U13 Fase 4.3: Breadcrumbs según origen (fromClient → Cliente > Planificación > Plan)
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
    ];

    const clientForBreadcrumb = fromClientId ? fromClientClient : assignedClient;
    const clientIdForBreadcrumb = fromClientId ?? assignedClient?.id;
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

    // Con fromClient: añadir "Planificación" antes del plan
    if (fromClientId && clientIdForBreadcrumb) {
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
                        clientId={fromClientId ?? plan.client_id ?? undefined}
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
        <div
                    className="min-h-screen -mt-16 md:-mt-18 lg:-mt-20"
                    data-testid="training-plan-detail"
                >
                    {/* Header con info del plan y contexto del atleta */}
                    <TrainingPlanHeader
                        plan={plan}
                        clientName={clientName}
                        breadcrumbItems={breadcrumbItems}
                        onRefresh={refetch}
                        onAssignPlan={() => setAssignModalOpen(true)}
                        volverAlClienteClientId={clientIdForVolver ?? undefined}
                    />

                    {/* Modal asignar plan a cliente (desde detalle) */}
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

                    {/* Tabs Navigation */}
                    <div className="mt-6 px-4 sm:px-6 lg:px-8">
                        <div className="bg-card border border-border rounded-xl shadow px-2 sm:px-4 py-1.5 w-full">
                            <nav 
                                className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto px-1 sm:px-2 py-1 w-full justify-start lg:justify-center" 
                                aria-label="Tabs"
                            >
                                {TABS.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    const isBack = tab.id === "back";
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabChange(tab.id)}
                                            className={`
                                                relative py-2 pb-3 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex items-center justify-center flex-none min-w-[140px] text-center
                                                ${isActive
                                                    ? "text-primary border-b-2 border-primary"
                                                    : isBack
                                                        ? "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                                                        : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                                                }
                                                cursor-pointer
                                            `}
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pb-20">
                        {renderTabContent()}
                    </div>
                </div>
    );
};
