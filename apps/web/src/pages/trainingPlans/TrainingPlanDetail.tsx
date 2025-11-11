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

import React, { useState, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

// Lazy loading para tabs pesados que usan Recharts (carga bajo demanda)
const ChartsTab = lazy(() => 
    import("@/components/trainingPlans").then(module => ({
        default: module.ChartsTab
    }))
);

type TabId = "overview" | "macrocycles" | "mesocycles" | "microcycles" | "milestones" | "charts";

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
    { id: "charts", label: "Gráficos" },
];

export const TrainingPlanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const user = useSelector((state: RootState) => state.auth.user);

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
                <div className="min-h-screen bg-gray-50">
                    {/* Header con info del plan y actions */}
                    <TrainingPlanHeader
                        plan={plan}
                        clientName={clientName}
                        onRefresh={refetch}
                        onAddMacrocycle={handleAddMacrocycle}
                    />

                    {/* Tabs Navigation */}
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <nav className="flex space-x-8" aria-label="Tabs">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
                                            ${
                                                activeTab === tab.id
                                                    ? "border-indigo-500 text-indigo-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }
                                        `}
                                        aria-current={activeTab === tab.id ? "page" : undefined}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {renderTabContent()}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};