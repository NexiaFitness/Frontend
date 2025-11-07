/**
 * ClientDetail.tsx — Página de detalle del cliente
 *
 * Contexto:
 * - Vista completa del cliente con tabs
 * - Tabs: Overview, Progress, Workouts, Nutrition (futuro), Settings
 * - Layout: Header + Tabs + Content
 * - Diseño basado en Figma Profile Page V2
 *
 * Responsabilidades:
 * - Cargar datos del cliente con useClientDetail
 * - Gestionar navegación entre tabs
 * - Mostrar loading/error states
 * - Actions: Edit, New Training Plan, New Session
 *
 * @author Frontend Team
 * @since v3.1.0
 */

import React, { useState, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useClientDetail } from "@nexia/shared/hooks/clients/useClientDetail";

// Tabs components - estáticos (carga inmediata)
import { ClientHeader } from "@/components/clients/detail/ClientHeader";
import { ClientOverviewTab } from "@/components/clients/detail/ClientOverviewTab";
import { ClientWorkoutsTab } from "@/components/clients/detail/ClientWorkoutsTab";
import { ClientNutritionTab } from "@/components/clients/detail/ClientNutritionTab";
import { ClientSettingsTab } from "@/components/clients/detail/ClientSettingsTab";

// Lazy loading para tabs pesados que usan Recharts (carga bajo demanda)
const ClientProgressTab = lazy(() => 
    import("@/components/clients/detail/ClientProgressTab").then(module => ({
        default: module.ClientProgressTab
    }))
);

type TabId = "overview" | "progress" | "workouts" | "nutrition" | "settings";

interface Tab {
    id: TabId;
    label: string;
    disabled?: boolean;
}

const TABS: Tab[] = [
    { id: "overview", label: "Overview" },
    { id: "progress", label: "Progress" },
    { id: "workouts", label: "Workouts" },
    { id: "nutrition", label: "Nutrition", disabled: true }, // Futuro
    { id: "settings", label: "Settings" },
];

export const ClientDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    const clientId = parseInt(id || "0", 10);

    // Cargar todos los datos del cliente
    const {
        client,
        progressHistory,
        progressAnalytics,
        trainingPlans,
        trainingSessions,
        isLoading,
        hasError,
        clientError,
        refetchAll,
    } = useClientDetail({
        clientId,
        includeProgress: true,
        includePlans: true,
        includeSessions: true,
    });

    // Menu items para navbar
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    // Validación de ID
    if (!id || isNaN(clientId)) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">
                            ID de cliente inválido
                        </Alert>
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
    if (hasError || !client) {
        const errorMessage = clientError 
            ? typeof clientError === "string" 
                ? clientError 
                : typeof clientError === "object" && clientError !== null
                ? JSON.stringify(clientError)
                : String(clientError)
            : null;

        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">
                            Error al cargar los datos del cliente. Por favor, intenta de nuevo.
                            {errorMessage && (
                                <div className="mt-2 text-sm text-red-800">
                                    {errorMessage}
                                </div>
                            )}
                        </Alert>
                        <button
                            onClick={refetchAll}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Reintentar
                        </button>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <ClientOverviewTab client={client} />;
            case "progress":
                return (
                    <Suspense fallback={<LoadingSpinner size="lg" />}>
                        <ClientProgressTab
                            clientId={clientId}
                            client={client}
                            progressHistory={progressHistory}
                            progressAnalytics={progressAnalytics}
                        />
                    </Suspense>
                );
            case "workouts":
                return (
                    <ClientWorkoutsTab
                        clientId={clientId}
                        trainingPlans={trainingPlans}
                        trainingSessions={trainingSessions}
                    />
                );
            case "nutrition":
                return <ClientNutritionTab />;
            case "settings":
                return <ClientSettingsTab client={client} onDelete={() => navigate("/dashboard/clients")} />;
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
                <div className="min-h-screen bg-white -mt-16 md:-mt-18 lg:-mt-20 pt-4 lg:pt-6">
                    {/* Header con foto, nombre y actions */}
                    <ClientHeader client={client} onRefresh={refetchAll} />

                    {/* Tabs Navigation */}
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
                            <nav 
                                className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-blue-500 [&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-transparent" 
                                aria-label="Tabs" 
                                style={{ WebkitOverflowScrolling: 'touch' }}
                            >
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                        disabled={tab.disabled}
                                        className={`
                    py-3 sm:py-4 px-3 sm:px-2 lg:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0
                    ${activeTab === tab.id
                                            ? "border-transparent sm:border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }
                    ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                         `}
                                        aria-current={activeTab === tab.id ? "page" : undefined}
                                    >
                                        {tab.label}
                                        {tab.disabled && (
                                            <span className="ml-1 sm:ml-2 text-xs text-gray-400">(Próximamente)</span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pb-20">
                        {renderTabContent()}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};