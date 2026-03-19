/**
 * TrainingPlanDetailPanel.tsx — Contenido del panel lateral de detalle de plan
 *
 * Contexto:
 * - U4 paso 1.5: se muestra dentro del SidePanel cuando "Ver plan" desde ClientPlansSection
 * - Reutiliza SessionsTab, PlanningTab, MilestonesTab, ChartsTab
 * - Sin tab "Volver al Cliente" (el cierre del drawer es el retorno)
 *
 * Responsabilidades:
 * - Cargar datos del plan con RTK Query
 * - Header compacto: breadcrumb Cliente > Planificación > [Plan], botón Cerrar
 * - Tabs: Sesiones, Planificación, Hitos, Gráficos
 *
 * @author Frontend Team
 * @since U4 paso 1.5
 */

import React, { useState, Suspense, lazy } from "react";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    MilestonesTab,
    SessionsTab,
    PlanningTab,
} from "@/components/trainingPlans";

const ChartsTab = lazy(() =>
    import("@/components/trainingPlans").then((module) => ({
        default: module.ChartsTab,
    }))
);

type TabId = "sessions" | "planning" | "milestones" | "charts";

const TABS: { id: TabId; label: string }[] = [
    { id: "sessions", label: "Sesiones" },
    { id: "planning", label: "Planificación" },
    { id: "milestones", label: "Hitos" },
    { id: "charts", label: "Gráficos" },
];

export interface TrainingPlanDetailPanelProps {
    planId: number;
    clientId: number;
    onClose: () => void;
}

export const TrainingPlanDetailPanel: React.FC<TrainingPlanDetailPanelProps> = ({
    planId,
    clientId,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<TabId>("sessions");

    const { data: plan, isLoading, isError, error, refetch } = useGetTrainingPlanQuery(planId, {
        skip: !planId || isNaN(planId),
    });

    const { data: client } = useGetClientQuery(clientId, {
        skip: !clientId,
    });

    const clientLabel = client
        ? `${client.nombre} ${client.apellidos}`
        : "Cliente";

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        {
            label: clientLabel,
            path: `/dashboard/clients/${clientId}`,
        },
        {
            label: "Planificación",
            path: `/dashboard/clients/${clientId}?tab=planificacion`,
        },
        ...(plan ? [{ label: plan.name, active: true } as BreadcrumbItem] : []),
    ];

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError || !plan) {
        const isNotFound = error && "status" in error && (error as { status: number }).status === 404;
        return (
            <div className="flex flex-col gap-4 p-6">
                <Alert
                    variant="error"
                    action={
                        <>
                            {!isNotFound && (
                                <Button variant="outline-destructive" size="sm" onClick={() => refetch()}>
                                    Reintentar
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={onClose}>
                                Cerrar
                            </Button>
                        </>
                    }
                >
                    {isNotFound
                        ? "El plan no existe o ha sido eliminado."
                        : "Error al cargar el plan. Intenta de nuevo."}
                </Alert>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "sessions":
                return <SessionsTab planId={planId} />;
            case "planning":
                return (
                    <PlanningTab
                        planId={planId}
                        clientId={plan.client_id ?? null}
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
        <div className="flex h-full flex-col overflow-hidden">
            {/* Header: breadcrumb + cerrar */}
            <div className="shrink-0 border-b border-border bg-card px-4 py-3 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Breadcrumbs items={breadcrumbItems} className="min-w-0" />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="shrink-0"
                        aria-label="Cerrar panel"
                    >
                        Cerrar
                    </Button>
                </div>
                <h2
                    className={`mt-2 ${TYPOGRAPHY.sectionTitle} text-foreground`}
                    id="plan-detail-panel-title"
                >
                    {plan.name}
                </h2>
            </div>

            {/* Tabs */}
            <div className="shrink-0 border-b border-border bg-surface px-4 py-2 sm:px-6">
                <nav
                    className="flex gap-2 overflow-x-auto"
                    aria-label="Tabs del plan"
                >
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                                    ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }
                                `}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};
