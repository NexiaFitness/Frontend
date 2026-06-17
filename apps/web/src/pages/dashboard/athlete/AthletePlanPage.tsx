/**
 * AthletePlanPage.tsx — Mi plan lectura (V08).
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { AthletePlanOverview } from "@/components/athlete/AthletePlanOverview";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { Button } from "@/components/ui/buttons";
import { useAthletePlan } from "@/hooks/athlete/useAthletePlan";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";

export const AthletePlanPage: React.FC = () => {
    const navigate = useNavigate();
    const { summary, planGoalLabel, isLoading, isError } = useAthletePlan();

    if (isLoading) {
        return <AthletePageLoading variant="plan" />;
    }

    if (isError) {
        return (
            <div className="space-y-4 px-4 pb-24 pt-4">
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar tu plan</p>
                    <p className="mt-1 text-muted-foreground">Inténtalo de nuevo más tarde.</p>
                </Alert>
            </div>
        );
    }

    if (!summary?.has_active_plan) {
        return (
            <div className="px-4 pb-24 pt-4 lg:px-8">
                <EmptyState
                    icon={<ClipboardList />}
                    title="Sin plan activo"
                    description="Tu entrenador configurará tu periodización aquí cuando esté lista."
                    action={
                        <Button
                            variant="secondary"
                            className="min-h-touch-athlete"
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
        <div className="px-4 pb-24 pt-4 lg:px-8 lg:pb-8">
            <AthletePlanOverview summary={summary} planGoalLabel={planGoalLabel} />
        </div>
    );
};
