/**
 * ClientDetail.tsx — Página de detalle del cliente
 *
 * Contexto:
 * - Vista completa del cliente con 7 tabs.
 * - Tabs: Resumen, Sesiones, Coherencia Diaria, Tests, Progreso, Planificación, Lesiones.
 * - Layout: Header + TabsBar + Content.
 *
 * Navegación de planes:
 * - "Ver plan" desde cualquier tab navega a ?tab=planning&plan=:id (detalle inline).
 * - "Crear plan" navega a /training-plans/create?clientId=:id; al crear vuelve aquí.
 * - El detalle de plan (sesiones, planificación, hitos, gráficos) vive en ClientPlanningTab.
 *
 * @author Frontend Team
 * @since v3.1.0
 * @updated v6.2.0 - Tab unificado "Sesiones".
 * @updated 2026-03-31 - Eliminado PlanDetailDrawer; detalle de plan inline en tab Planificación.
 */

import React, { Suspense, lazy, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useClientDetail } from "@nexia/shared/hooks/clients/useClientDetail";
import { useGetActivePlanByClientQuery } from "@nexia/shared/api/trainingPlansApi";
import { TabsBar } from "@/components/ui/tabs";
// Tabs components - estáticos (carga inmediata)
import { ClientHeader } from "@/components/clients/detail/ClientHeader";
import { ClientOverviewTab } from "@/components/clients/detail/ClientOverviewTab";
import { ClientDailyCoherenceTab } from "@/components/clients/detail/ClientDailyCoherenceTab";
import { ClientTestingTab } from "@/components/clients/detail/ClientTestingTab";
import { ClientSessionsTab } from "@/components/clients/detail/ClientSessionsTab";
import { ClientInjuriesTab } from "@/components/clients/detail/ClientInjuriesTab/ClientInjuriesTab";
import { ClientPlanningTab } from "@/components/clients/detail/ClientPlanningTab";
import { SelectTemplateModal } from "@/components/clients/detail/modals/SelectTemplateModal";
import { AssignTemplateModal } from "@/components/trainingPlans/AssignTemplateModal";

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
    const [searchParams, setSearchParams] = useSearchParams();

    const planningFocusPlanId = React.useMemo(() => {
        const raw = searchParams.get("plan");
        if (raw == null || raw === "") return null;
        const n = parseInt(raw, 10);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [searchParams]);
    React.useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "workouts" || tab === "session-programming") {
            setActiveTab("sessions");
        }
    }, [searchParams, setActiveTab]);

    // Navega al tab Planificación con el plan seleccionado abierto inline
    const handleViewPlan = useCallback((planId: number) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("tab", "planning");
            next.set("plan", String(planId));
            next.delete("planTab");
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const clientId = parseInt(id || "0", 10);

    // Cargar todos los datos del cliente
    const {
        client,
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

    // Fase 4.1: plan activo para CTA "Planificar" (si hay plan → tab Planificación; si no → modal crear plan)
    const { data: activePlan } = useGetActivePlanByClientQuery(clientId, {
        skip: !clientId || clientId <= 0,
    });
    const hasActivePlan = activePlan != null && activePlan.id != null;

    const location = useLocation();

    const handlePlanificar = useCallback(() => {
        if (hasActivePlan) {
            setActiveTab("planning");
        } else {
            navigate(`/dashboard/training-plans/create?clientId=${clientId}`, {
                state: { from: location.pathname },
            });
        }
    }, [hasActivePlan, setActiveTab, navigate, clientId, location.pathname]);

    // Modales de planificación: Seleccionar plantilla → Asignar plantilla al cliente
    const [selectTemplateModalOpen, setSelectTemplateModalOpen] = useState(false);
    const [assignTemplateModalOpen, setAssignTemplateModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");



    const handleOpenUseTemplate = useCallback(() => {
        setSelectTemplateModalOpen(true);
    }, []);

    const handleTemplateSelected = useCallback((templateId: number, templateName: string) => {
        setSelectedTemplateId(templateId);
        setSelectedTemplateName(templateName);
        setSelectTemplateModalOpen(false);
        setAssignTemplateModalOpen(true);
    }, []);

    const handleAssignTemplateSuccess = useCallback(() => {
        setAssignTemplateModalOpen(false);
        setSelectedTemplateId(null);
        setSelectedTemplateName("");
        refetchAll();
        setActiveTab("planning");
    }, [refetchAll, setActiveTab]);

    const clientName = client ? `${client.nombre} ${client.apellidos}` : undefined;

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
            <Alert
                variant="error"
                action={
                    <>
                        {isForbiddenError ? (
                            <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/clients")}>
                                Volver a Clientes
                            </Button>
                        ) : (
                            <Button variant="outline-destructive" size="sm" onClick={refetchAll}>
                                Reintentar
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                            Ir al Dashboard
                        </Button>
                    </>
                }
            >
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
                        onOpenCreatePlan={() => navigate(`/dashboard/training-plans/create?clientId=${clientId}`, {
                            state: { from: location.pathname },
                        })}
                        onOpenUseTemplate={handleOpenUseTemplate}
                        onViewPlan={handleViewPlan}
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
                        />
                    </Suspense>
                );
            case "planning":
                return (
                    <ClientPlanningTab
                        clientId={clientId}
                        trainingPlans={trainingPlans ?? []}
                        isLoadingPlans={isLoadingPlans}
                        focusPlanId={planningFocusPlanId}
                        onOpenCreatePlan={() => navigate(`/dashboard/training-plans/create?clientId=${clientId}`, {
                            state: { from: location.pathname },
                        })}
                        onOpenUseTemplate={handleOpenUseTemplate}
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
                hasActivePlan={hasActivePlan}
                onPlanificar={handlePlanificar}
                onOpenUseTemplate={handleOpenUseTemplate}
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

            <SelectTemplateModal
                open={selectTemplateModalOpen}
                onClose={() => setSelectTemplateModalOpen(false)}
                onSelect={handleTemplateSelected}
            />
            <AssignTemplateModal
                open={assignTemplateModalOpen}
                onClose={() => {
                    setAssignTemplateModalOpen(false);
                    setSelectedTemplateId(null);
                    setSelectedTemplateName("");
                }}
                templateId={selectedTemplateId}
                templateName={selectedTemplateName}
                clientId={clientId}
                clientName={clientName}
                onSuccess={handleAssignTemplateSuccess}
            />

        </div>
    );
};
