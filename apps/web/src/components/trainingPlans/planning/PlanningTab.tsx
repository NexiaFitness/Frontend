/**
 * PlanningTab.tsx — Tab de Planificación para Training Plan Detail
 *
 * Contexto:
 * - Tab principal de planificación dentro de TrainingPlanDetail
 * - Wrapper con 3 sub-tabs: Anual, Mensual, Semanal
 * - Usa componentes EDITABLES (YearlyPlanningDashboardEditable, etc.)
 * - Patrón idéntico a ClientWorkoutsTab pero orientado a planId
 *
 * Responsabilidades:
 * - Gestionar navegación entre sub-tabs (yearly, monthly, weekly)
 * - Renderizar dashboards editables según sub-tab activo
 * - Pasar planId a cada dashboard editable
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import React from "react";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { useSubTabNavigation } from "@/hooks/useSubTabNavigation";
import {
    YearlyPlanningDashboardEditable,
    MonthlyPlanningDashboardEditable,
    WeeklyPlanningDashboardEditable,
} from "./";

export interface PlanningTabProps {
    planId: number;
    plan: TrainingPlan;
}

type PlanningSubTab = "yearly" | "monthly" | "weekly";

const PLANNING_SUBTABS: Array<{ id: PlanningSubTab; label: string }> = [
    { id: "yearly", label: "Planning Anual" },
    { id: "monthly", label: "Planning Mensual" },
    { id: "weekly", label: "Planning Semanal" },
];

export const PlanningTab: React.FC<PlanningTabProps> = ({ planId, plan: _plan }) => {
    // Sub-tab navigation con query parameters
    const { activeSubTab, setActiveSubTab } = useSubTabNavigation<PlanningSubTab>({
        validSubTabs: PLANNING_SUBTABS.map((t) => t.id),
        defaultSubTab: "yearly",
    });

    // Render sub-tab content
    const renderSubTabContent = () => {
        switch (activeSubTab) {
            case "yearly":
                return <YearlyPlanningDashboardEditable planId={planId} />;
            case "monthly":
                return <MonthlyPlanningDashboardEditable planId={planId} />;
            case "weekly":
                return <WeeklyPlanningDashboardEditable planId={planId} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* TÍTULO PRINCIPAL - Planificación */}
            <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Planificación
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Distribución de cualidades físicas, carga de entrenamiento y progresión temporal
                </p>
            </div>

            {/* Sub-tabs Navigation */}
            <nav aria-label="Tabs planificación" className="flex gap-1 border-b border-gray-200">
                {PLANNING_SUBTABS.map((subTab) => {
                    const isActive = activeSubTab === subTab.id;
                    return (
                        <button
                            key={subTab.id}
                            onClick={() => setActiveSubTab(subTab.id)}
                            className={`
                                relative py-2 pb-3 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex-none min-w-[140px] text-center
                                ${isActive
                                    ? "text-[#4A67B3]"
                                    : "text-gray-500 hover:text-gray-700"
                                }
                            `}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {subTab.label}
                            {isActive && (
                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#4A67B3]"></span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Sub-tab Content */}
            <div>{renderSubTabContent()}</div>
        </div>
    );
};

