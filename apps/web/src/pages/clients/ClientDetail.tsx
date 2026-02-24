/**
 * ClientDetail.tsx — Página de detalle del cliente
 *
 * Contexto:
 * - Vista completa del cliente con 6 tabs (Ola 2 S03: tab unificado "Sesiones").
 * - Tabs: Resumen, Sesiones, Coherencia Diaria, Tests, Progreso, Lesiones.
 * - Layout: Header + Tabs + Content.
 *
 * @author Frontend Team
 * @since v3.1.0
 * @updated v6.0.0 - Integración de Breadcrumbs jerárquicos.
 * @updated v6.2.0 - Ola 2 S03: swap a 6 tabs; "Sesiones" reemplaza Programación de Sesiones + Entrenamientos.
 * @updated Fase 6 - Tab Planificación (planificación client-only o por plan asociado).
 */

import React, { Suspense, lazy } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useClientDetail } from "@nexia/shared/hooks/clients/useClientDetail";
// Tabs components - estáticos (carga inmediata)
import { ClientHeader } from "@/components/clients/detail/ClientHeader";
import { ClientOverviewTab } from "@/components/clients/detail/ClientOverviewTab";
import { ClientDailyCoherenceTab } from "@/components/clients/detail/ClientDailyCoherenceTab";
import { ClientTestingTab } from "@/components/clients/detail/ClientTestingTab";
import { ClientSessionsTab } from "@/components/clients/detail/ClientSessionsTab";
import { ClientInjuriesTab } from "@/components/clients/detail/ClientInjuriesTab/ClientInjuriesTab";
import { ClientPlanningTab } from "@/components/clients/detail/ClientPlanningTab";

// Lazy loading para tabs pesados que usan Recharts (carga bajo demanda)
const ClientProgressTab = lazy(() => 
    import("@/components/clients/detail/ClientProgressTab").then(module => ({
        default: module.ClientProgressTab
    }))
);

type TabId = "overview" | "sessions" | "daily-coherence" | "testing" | "progress" | "planning" | "injuries";

interface Tab {
    id: TabId;
    label: string;
    disabled?: boolean;
}

const TABS: Tab[] = [
    { id: "overview", label: "Resumen" },
    { id: "sessions", label: "Sesiones" },
    { id: "daily-coherence", label: "Coherencia Diaria" },
    { id: "testing", label: "Tests" },
    { id: "progress", label: "Progreso" },
    { id: "planning", label: "Planificación" },
    { id: "injuries", label: "Lesiones" },
];

export const ClientDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Tab navigation con query parameters
    const { activeTab, setActiveTab } = useTabNavigation<TabId>({
        validTabs: TABS.map((t) => t.id),
        defaultTab: "overview",
    });

    // S03: si la URL trae tab legacy, abrir "sessions" (enlaces antiguos)
    const [searchParams] = useSearchParams();
    React.useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "workouts" || tab === "session-programming") {
            setActiveTab("sessions");
        }
    }, [searchParams, setActiveTab]);

    const clientId = parseInt(id || "0", 10);

    // Cargar todos los datos del cliente
    const {
        client,
        progressHistory,
        progressAnalytics,
        trainingPlans,
        isLoadingPlans,
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

    // Breadcrumbs jerárquicos
    const breadcrumbItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { 
            label: client ? `${client.nombre} ${client.apellidos}` : "Detalle de Cliente", 
            active: true 
        },
    ];

    // Validación de ID
    if (!id || isNaN(clientId)) {
        return (
            <div className="p-6">
                <Alert variant="error">
                    ID de cliente inválido
                </Alert>
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

    // Error state
    if (hasError || !client) {
        const isForbiddenError = clientError && 
            typeof clientError === "object" && 
            clientError !== null &&
            "status" in clientError &&
            clientError.status === 403;

        const errorMessage = clientError 
            ? typeof clientError === "string" 
                ? clientError 
                : typeof clientError === "object" && clientError !== null
                ? JSON.stringify(clientError)
                : String(clientError)
            : null;

        return (
            <div className="p-6">
                <Alert variant="error">
                    {isForbiddenError ? (
                                <>
                                    <p className="font-semibold mb-2">No tienes acceso a este cliente</p>
                                    <p className="text-sm">Este cliente no está asignado a tu cuenta o no tienes permisos para verlo.</p>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold mb-2">Error al cargar los datos del cliente</p>
                                    <p className="text-sm mb-2">Por favor, intenta de nuevo.</p>
                                    {errorMessage && (
                                        <div className="mt-2 text-sm text-red-800 font-mono text-xs">{errorMessage}</div>
                                    )}
                                </>
                            )}
                        </Alert>
                        <div className="mt-4 flex gap-3">
                            {isForbiddenError ? (
                                <button
                                    onClick={() => navigate("/dashboard/clients")}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Volver a Clientes
                                </button>
                            ) : (
                                <button
                                    onClick={refetchAll}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Reintentar
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Ir al Dashboard
                            </button>
                        </div>
            </div>
        );
    }

    // Render tab content (6 tabs tras S03)
    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return (
                    <ClientOverviewTab
                        client={client}
                        clientId={clientId}
                        trainingPlans={trainingPlans ?? []}
                        isLoadingPlans={isLoadingPlans}
                    />
                );
            case "sessions":
                return <ClientSessionsTab clientId={clientId} />;
            case "daily-coherence":
                return <ClientDailyCoherenceTab clientId={clientId} />;
            case "testing":
                return <ClientTestingTab clientId={clientId} />;
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
            case "planning":
                return (
                    <ClientPlanningTab
                        clientId={clientId}
                        trainingPlans={trainingPlans ?? []}
                        isLoadingPlans={isLoadingPlans}
                    />
                );
            case "injuries":
                return <ClientInjuriesTab clientId={clientId} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen -mt-16 md:-mt-18 lg:-mt-20">
                    {/* Header con breadcrumbs integrados */}
                    <ClientHeader
                        client={client}
                        clientId={clientId}
                        onEditProfile={() => navigate(`/dashboard/clients/${clientId}/edit`)}
                        onAnthropometricData={() => setActiveTab("progress")}
                        breadcrumbItems={breadcrumbItems}
                    />

                    {/* Tabs Navigation */}
                    <div className="mt-6 px-4 sm:px-6 lg:px-8">
                        <div className="bg-card border border-border rounded-xl shadow px-2 sm:px-4 py-1.5 w-full">
                            <nav 
                                className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/70 px-1 sm:px-2 py-1 w-full justify-start lg:justify-center" 
                                aria-label="Tabs" 
                                style={{ WebkitOverflowScrolling: 'touch' }}
                            >
                                <style>{`
                                    nav[aria-label="Tabs"]::-webkit-scrollbar { height: 4px; }
                                    nav[aria-label="Tabs"]::-webkit-scrollbar-track { background: transparent; }
                                    nav[aria-label="Tabs"]::-webkit-scrollbar-thumb { background-color: hsl(var(--primary)) !important; border-radius: 2px; }
                                `}</style>
                                {TABS.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                            disabled={tab.disabled}
                                            className={`
                                                relative py-2 pb-3 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex-none min-w-[140px] text-center
                                                ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                                                ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
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
    );
};
