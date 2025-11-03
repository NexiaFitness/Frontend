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

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetClientsQuery } from "@nexia/shared/api/clientsApi";
import type { Client } from "@nexia/shared/types/client";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";

// Tabs components
import {
    TrainingPlanHeader,
    OverviewTab,
    MacrocyclesTab,
    MesocyclesTab,
    MicrocyclesTab,
} from "@/components/trainingPlans";

type TabId = "overview" | "macrocycles" | "mesocycles" | "microcycles";

interface Tab {
    id: TabId;
    label: string;
}

const TABS: Tab[] = [
    { id: "overview", label: "Overview" },
    { id: "macrocycles", label: "Macrocycles" },
    { id: "mesocycles", label: "Mesocycles" },
    { id: "microcycles", label: "Microcycles" },
];

export const TrainingPlanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    const planId = parseInt(id || "0", 10);

    // Cargar datos del plan
    const { data: plan, isLoading, isError, error, refetch } = useGetTrainingPlanQuery(planId, {
        skip: !id || isNaN(planId),
    });

    // Cargar clientes para obtener el nombre del cliente asignado
    const { data: clientsData } = useGetClientsQuery({
        filters: {},
        page: 1,
        per_page: 100,
    });

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
                        <Alert variant="error">Invalid training plan ID</Alert>
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
                            Error loading training plan. Please try again.
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
                            Back to Plans
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