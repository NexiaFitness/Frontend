/**
 * TrainerDashboard.tsx — Panel principal del entrenador (premium).
 *
 * Doc: DESIGN_PREMIUM.md · trainerDashboardPresentation.ts
 */

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Users, TrendingUp, Smile, ClipboardCheck } from "lucide-react";
import { CompleteProfileBanner, EmailVerificationBanner, GreetingHeader } from "@/components/dashboard/shared";
import { CompleteProfileModal } from "@/components/dashboard/modals";
import {
    KPICard,
    PriorityAlertsWidget,
    TodaySessionsWidget,
    ClientListWidget,
    BillingWidget,
    RecentActivityWidget,
} from "@/components/dashboard/trainer/widgets";
import {
    TRAINER_DASHBOARD_ASIDE,
    TRAINER_DASHBOARD_COPY,
    TRAINER_DASHBOARD_ERROR,
    TRAINER_DASHBOARD_ERROR_TEXT,
    TRAINER_DASHBOARD_GLOW,
    TRAINER_DASHBOARD_KPI_GRID,
    TRAINER_DASHBOARD_LAYOUT,
    TRAINER_DASHBOARD_MAIN,
    TRAINER_DASHBOARD_PAGE,
    TRAINER_DASHBOARD_PAIR_ROW,
    TRAINER_DASHBOARD_STACK,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    useClientStats,
    useCompleteProfileModal,
    useClientImprovement,
    useClientSatisfaction,
    usePlanAdherence,
} from "@nexia/shared";
import { baseApi } from "@nexia/shared/api/baseApi";
import type { RootState, AppDispatch } from "@nexia/shared/store";
import { cn } from "@/lib/utils";

export const TrainerDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const {
        getTotalClients,
        isLoading: isLoadingStats,
        isError: isErrorStats,
    } = useClientStats();

    const clientImprovement = useClientImprovement();
    const clientSatisfaction = useClientSatisfaction();
    const planAdherence = usePlanAdherence();

    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
    const { isProfileComplete } = useCompleteProfileModal();

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(baseApi.util.resetApiState());
        }
    }, [isAuthenticated, dispatch]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className={cn(TRAINER_DASHBOARD_PAGE, "relative")}>
            <div className={TRAINER_DASHBOARD_GLOW} aria-hidden />

            <div className={TRAINER_DASHBOARD_STACK}>
                <GreetingHeader userName={user?.nombre} />

                <EmailVerificationBanner user={user} />
                <CompleteProfileBanner user={user} isProfileComplete={isProfileComplete} />

                <div className={TRAINER_DASHBOARD_KPI_GRID}>
                    <KPICard
                        value={getTotalClients()}
                        trend="+8%"
                        label="Total de Clientes"
                        description="vs mes anterior"
                        icon={Users}
                        color="primary"
                        isLoading={isLoadingStats}
                    />
                    <KPICard
                        value={clientImprovement.value}
                        trend={clientImprovement.trend}
                        label={clientImprovement.label}
                        description={clientImprovement.description}
                        icon={TrendingUp}
                        color="success"
                        isLoading={clientImprovement.isLoading}
                    />
                    <KPICard
                        value={clientSatisfaction.value}
                        trend={clientSatisfaction.trend}
                        label="Satisfacción del Cliente"
                        description="feedback post-sesión"
                        icon={Smile}
                        color="info"
                        isLoading={clientSatisfaction.isLoading}
                    />
                    <KPICard
                        value={`${planAdherence.value}%`}
                        trend={planAdherence.trend}
                        label="Adherencia al Plan"
                        description="planificado vs ejecutado"
                        icon={ClipboardCheck}
                        color="primary"
                        isLoading={planAdherence.isLoading}
                    />
                </div>

                {isErrorStats ? (
                    <div className={TRAINER_DASHBOARD_ERROR}>
                        <NexiaGlassAccentRim />
                        <p className={TRAINER_DASHBOARD_ERROR_TEXT}>{TRAINER_DASHBOARD_COPY.statsError}</p>
                    </div>
                ) : null}

                <div className={TRAINER_DASHBOARD_PAIR_ROW}>
                    <PriorityAlertsWidget />
                    <RecentActivityWidget />
                </div>

                <div className={TRAINER_DASHBOARD_LAYOUT}>
                    <div className={TRAINER_DASHBOARD_MAIN}>
                        <TodaySessionsWidget />
                    </div>

                    <aside className={TRAINER_DASHBOARD_ASIDE}>
                        <ClientListWidget />
                        <BillingWidget />
                    </aside>
                </div>
            </div>

            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </div>
    );
};
