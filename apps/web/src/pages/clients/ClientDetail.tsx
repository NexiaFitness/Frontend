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
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useClientDetail } from "@nexia/shared/hooks/clients/useClientDetail";
import { TabsBar } from "@/components/ui/tabs";
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
            <div className="space-y-8">
                <Alert variant="error">ID de cliente inválido</Alert>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
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

        const errorMessage =
            clientError
                ? typeof clientError === "string"
                    ? clientError
                    : typeof clientError === "object" && clientError !== null
                      ? JSON.stringify(clientError)
                      : String(clientError)
                : null;

        return (
            <div className="space-y-8">
                <Alert variant="error">
                    {isForbiddenError ? (
                        <>
                            <p className="mb-2 font-semibold text-foreground">No tienes acceso a este cliente</p>
                            <p className="text-sm text-muted-foreground">
                                Este cliente no está asignado a tu cuenta o no tienes permisos para verlo.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="mb-2 font-semibold text-foreground">Error al cargar los datos del cliente</p>
                            <p className="mb-2 text-sm text-muted-foreground">Por favor, intenta de nuevo.</p>
                            {errorMessage && (
                                <div className="mt-2 font-mono text-label text-destructive">{errorMessage}</div>
                            )}
                        </>
                    )}
                </Alert>
                <div className="flex flex-wrap gap-3">
                    {isForbiddenError ? (
                        <Button variant="primary" onClick={() => navigate("/dashboard/clients")}>
                            Volver a Clientes
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={refetchAll}>
                            Reintentar
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>
                        Ir al Dashboard
                    </Button>
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
        <div className="space-y-8">
            <ClientHeader
                client={client}
                clientId={clientId}
                onEditProfile={() => navigate(`/dashboard/clients/${clientId}/edit`)}
                breadcrumbItems={breadcrumbItems}
            />

            {/* Tabs — barra de pestañas según spec (TabsBar reutilizable) */}
            <TabsBar
                items={TABS}
                value={activeTab}
                onChange={(id) => setActiveTab(id as TabId)}
                ariaLabel="Tabs del cliente"
            />

            {/* Tab Content — espacio vertical según spec (pb-8 ya en main) */}
            <div className="pt-2 pb-8">
                {renderTabContent()}
            </div>
        </div>
    );
};
