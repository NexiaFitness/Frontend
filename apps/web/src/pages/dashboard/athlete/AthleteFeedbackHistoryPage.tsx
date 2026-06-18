/**
 * AthleteFeedbackHistoryPage.tsx — Historial feedback + respuestas entrenador (V12 F3a).
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { markTrainerResponsesSeen } from "@nexia/shared/utils/athlete/athleteFeedbackUtils";
import { FeedbackHistoryCard } from "@/components/athlete/FeedbackHistoryCard";
import { AthleteFeedbackHistoryHeader } from "@/components/athlete/feedback/AthleteFeedbackHistoryHeader";
import { Button } from "@/components/ui/buttons";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import { ATHLETE_PAGE } from "@/components/athlete/layout/athleteLayoutClasses";
import { useAthleteFeedbackHistory } from "@/hooks/athlete/useAthleteFeedbackHistory";
import { cn } from "@/lib/utils";

export const AthleteFeedbackHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { sorted, isLoading, getSessionName } = useAthleteFeedbackHistory(50);

    useEffect(() => {
        if (sorted.length > 0) {
            markTrainerResponsesSeen(sorted);
        }
    }, [sorted]);

    if (isLoading) {
        return <AthletePageLoading variant="feedback-history" />;
    }

    return (
        <div className={cn(ATHLETE_PAGE, "space-y-5")}>
            <AthleteFeedbackHistoryHeader onBack={() => navigate("/dashboard")} />

            {sorted.length === 0 ? (
                <EmptyState
                    icon={<MessageSquare />}
                    title="Sin feedback todavía"
                    description="Tras completar una sesión podrás enviar sensaciones y ver la respuesta aquí."
                    action={
                        <Button
                            variant="primary"
                            className={ATHLETE_PRIMARY_CTA}
                            onClick={() => navigate("/dashboard/sessions")}
                        >
                            Ver sesiones
                        </Button>
                    }
                />
            ) : (
                <ul className="space-y-4">
                    {sorted.map((item) => (
                        <li key={item.id}>
                            <FeedbackHistoryCard
                                item={item}
                                sessionName={getSessionName(item.training_session_id)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
