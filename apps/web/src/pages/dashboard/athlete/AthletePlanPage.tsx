/**
 * AthletePlanPage.tsx — Mi plan lectura (V08).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { AthletePlanOverview } from "@/components/athlete/plan/AthletePlanOverview";
import { AthleteEmptyState } from "@/components/athlete/empty/AthleteEmptyState";
import { Alert } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { Button } from "@/components/ui/buttons";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import { useAthletePlan } from "@/hooks/athlete/useAthletePlan";
import { ATHLETE_PAGE } from "@/components/athlete/layout/athleteLayoutClasses";

export const AthletePlanPage: React.FC = () => {
    const navigate = useNavigate();
    const plan = useAthletePlan();

    if (plan.isLoading) {
        return <AthletePageLoading variant="plan" />;
    }

    if (plan.isError) {
        return (
            <div className={ATHLETE_PAGE}>
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar tu plan</p>
                    <p className="mt-1 text-muted-foreground">Inténtalo de nuevo más tarde.</p>
                </Alert>
            </div>
        );
    }

    if (!plan.summary?.has_active_plan) {
        return (
            <div className={ATHLETE_PAGE}>
                <AthleteEmptyState
                    variant="plan"
                    action={
                        <Button
                            variant="primary"
                            className={ATHLETE_PRIMARY_CTA}
                            onClick={() => navigate("/dashboard")}
                        >
                            Volver al inicio
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className={ATHLETE_PAGE}>
            <AthletePlanOverview viewModel={plan} />
        </div>
    );
};
