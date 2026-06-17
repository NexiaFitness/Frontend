/**
 * AthleteFeedbackHistoryPage.tsx — Historial feedback + respuestas entrenador (V12 F3a).
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { markTrainerResponsesSeen } from "@nexia/shared/utils/athlete/athleteFeedbackUtils";
import { FeedbackHistoryCard } from "@/components/athlete/FeedbackHistoryCard";
import { Button } from "@/components/ui/buttons";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { useAthleteFeedbackHistory } from "@/hooks/athlete/useAthleteFeedbackHistory";

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
        <div className="space-y-4 px-4 pb-24 pt-4 lg:px-8 lg:pb-8">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-touch-athlete shrink-0 px-2"
                    onClick={() => navigate("/dashboard")}
                    aria-label="Volver al inicio"
                >
                    <ArrowLeft className="size-5" aria-hidden />
                </Button>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Mis notas</h1>
                    <p className="text-sm text-muted-foreground">
                        Feedback enviado y respuestas de tu entrenador
                    </p>
                </div>
            </div>

            {sorted.length === 0 ? (
                <EmptyState
                    icon={<MessageSquare />}
                    title="Sin feedback todavía"
                    description="Tras completar una sesión podrás enviar sensaciones y ver la respuesta aquí."
                    action={
                        <Button
                            variant="secondary"
                            className="min-h-touch-athlete"
                            onClick={() => navigate("/dashboard/sessions")}
                        >
                            Ver sesiones
                        </Button>
                    }
                />
            ) : (
                <ul className="space-y-3">
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
