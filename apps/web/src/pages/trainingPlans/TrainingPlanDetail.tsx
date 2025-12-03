/**
 * TrainingPlanDetail.tsx — Página de detalle del training plan
 *
 * Contexto:
 * - Vista completa del plan con tabs
 * - Tabs: Overview, Macrocycles, Mesocycles, Microcycles
 * - Layout: Header + Tabs + Content
 * - Patrón idéntico a ClientDetail
 *
 * Responsabilidades:
 * - Cargar datos del plan con RTK Query
 * - Gestionar navegación entre tabs
 * - Mostrar loading/error states
 * - Actions: Edit, Delete, Add Macrocycle
 *
 * @author Frontend Team
 * @since v3.3.0
 */

import React, { Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import type { Client } from "@nexia/shared/types/client";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";

// Tabs components - estáticos (carga inmediata)
import {
    TrainingPlanHeader,
    OverviewTab,
    MacrocyclesTab,
    MesocyclesTab,
    MicrocyclesTab,
    MilestonesTab,
} from "@/components/trainingPlans";

// Lazy loading para tabs pesados (carga bajo demanda)
const ChartsTab = lazy(() => 
    import("@/components/trainingPlans").then(module => ({
        default: module.ChartsTab
    }))
);

// PlanningTab con componentes editables pesados (gráficos, dashboards)
const PlanningTab = lazy(() => 
    import("@/components/trainingPlans/planning").then(module => ({
        default: module.PlanningTab
    }))
);

type TabId = "overview" | "macrocycles" | "mesocycles" | "microcycles" | "milestones" | "charts" | "planning";

interface Tab {
    id: TabId;
    label: string;
}

const TABS: Tab[] = [
    { id: "overview", label: "Resumen" },
    { id: "macrocycles", label: "Macrociclos" },
    { id: "mesocycles", label: "Mesociclos" },
    { id: "microcycles", label: "Microciclos" },
    { id: "milestones", label: "Hitos" },
    { id: "planning", label: "Planificación" },
    { id: "charts", label: "Gráficos" },
];

export const TrainingPlanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);

    // Tab navigation con query parameters
    const { activeTab, setActiveTab } = useTabNavigation<TabId>({
        validTabs: TABS.map((t) => t.id),
        defaultTab: "overview",
    });

    const planId = parseInt(id || "0", 10);

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
            per_page: 50, // Backend limita a 50 máximo
        },
        {
            skip: !trainerId, // No hacer query si no hay trainerId
        }
    );

    const clients = clientsData?.items ?? [];
    const clientName = clients.find((c: Client) => c.id === plan?.client_id)
        ? `${clients.find((c: Client) => c.id === plan?.client_id)?.nombre} ${clients.find((c: Client) => c.id === plan?.client_id)?.apellidos}`
        : undefined;

    // Items del menú superior
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    // Validación de ID
    if (!id || isNaN(planId)) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">ID de plan de entrenamiento inválido</Alert>
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
    if (isError || !plan) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">
                            Error al cargar el plan de entrenamiento. Por favor, intenta de nuevo.
                            {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data && (
                                <div className="mt-2 text-sm">
                                    {String(error.data.detail)}
                                </div>
                            )}
                        </Alert>
                        <button
                            onClick={() => refetch()}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => navigate("/dashboard/training-plans")}
                            className="mt-4 ml-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Volver a Planes
                        </button>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    // Handler para abrir formulario de macrocycle desde header
    const handleAddMacrocycle = () => {
        setActiveTab("macrocycles");
        // El tab de macrocycles tiene su propio botón + que expande el formulario
    };

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewTab plan={plan} clientName={clientName} />;
            case "macrocycles":
                return (
                    <MacrocyclesTab
                        planId={planId}
                        planStartDate={plan.start_date}
                        planEndDate={plan.end_date}
                    />
                );
            case "mesocycles":
                return <MesocyclesTab planId={planId} />;
            case "microcycles":
                return <MicrocyclesTab planId={planId} />;
            case "milestones":
                return <MilestonesTab planId={planId} />;
            case "planning":
                return (
                    <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <PlanningTab planId={planId} plan={plan} />
                    </Suspense>
                );
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
        <>
            {/* Navbar móvil/tablet */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Sidebar escritorio */}
            <TrainerSideMenu />

            <DashboardLayout>
                <div className="min-h-screen -mt-16 md:-mt-18 lg:-mt-20">
                    {/* Header con info del plan y actions */}
                    <TrainingPlanHeader
                        plan={plan}
                        clientName={clientName}
                        onRefresh={refetch}
                        onAddMacrocycle={handleAddMacrocycle}
                    />

                    {/* Tabs Navigation - Separado del header */}
                    <div className="mt-6 px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-xl shadow px-2 sm:px-4 py-1.5 w-full">
                            <nav 
                                className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#4A67B3]/70 px-1 sm:px-2 py-1 w-full justify-start lg:justify-center" 
                                aria-label="Tabs" 
                                style={{ 
                                    WebkitOverflowScrolling: 'touch',
                                }}
                            >
                                <style>{`
                                    nav[aria-label="Tabs"]::-webkit-scrollbar {
                                        height: 4px;
                                    }
                                    nav[aria-label="Tabs"]::-webkit-scrollbar-track {
                                        background: transparent;
                                    }
                                    nav[aria-label="Tabs"]::-webkit-scrollbar-thumb {
                                        background-color: #4A67B3 !important;
                                        border-radius: 2px;
                                    }
                                `}</style>
                                {TABS.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                relative py-2 pb-3 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex-none min-w-[140px] text-center
                                                ${isActive
                                                    ? "text-[#4A67B3]"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }
                                                cursor-pointer
                                            `}
                                            aria-current={isActive ? "page" : undefined}
                                        >
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
            </DashboardLayout>
        </>
    );
};