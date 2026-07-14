/**
 * AthleteSessionSummaryPage.tsx — V06 resumen post-sesión (F2 + F3d-FE-01).
 * Celebración premium + nota IA condicional. Sin cambios en V01 dashboard.
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { PostSessionAiInsightCard } from "@/components/athlete/postSession/PostSessionAiInsightCard";
import { PostSessionCelebrationHero } from "@/components/athlete/postSession/PostSessionCelebrationHero";
import { PostSessionExercisesPanel } from "@/components/athlete/postSession/PostSessionExercisesPanel";
import { PostSessionHighlightsStrip } from "@/components/athlete/postSession/PostSessionHighlightsStrip";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import { cn } from "@/lib/utils";
import { useAthletePostSessionCelebration } from "@/hooks/athlete/useAthletePostSessionCelebration";
import { useAthleteSessionShare } from "@/hooks/athlete/useAthleteSessionShare";

export const AthleteSessionSummaryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();

    const {
        report,
        celebration,
        completionPercent,
        aiInsight,
        showAiInsight,
        isAiLoading,
        isLoading,
        isError,
    } = useAthletePostSessionCelebration(sessionId);

    const { canShare, isSharing, share } = useAthleteSessionShare(report);

    if (isLoading) {
        return <AthletePageLoading variant="session-summary" />;
    }

    if (isError || !report || !celebration) {
        return (
            <div className={`space-y-4 ${ATHLETE_PAGE_X} pb-24 pt-4`}>
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar el resumen</p>
                </Alert>
                <Button variant="secondary" onClick={() => navigate("/dashboard/sessions")}>
                    Mis sesiones
                </Button>
            </div>
        );
    }

    return (
        <div className={`flex min-h-full flex-col ${ATHLETE_PAGE_X} pt-4 lg:pb-8`}>
            <div className="flex-1 space-y-5">
                <PostSessionCelebrationHero
                    celebration={celebration}
                    completionPercent={completionPercent}
                    actualSets={report.total_actual_sets}
                    plannedSets={report.total_planned_sets}
                    canShare={canShare}
                    isSharing={isSharing}
                    onShare={() => void share()}
                />

                <NexiaPremiumDivider className="w-full" />

                <PostSessionHighlightsStrip highlights={report.highlights} />

                {showAiInsight && (
                    <PostSessionAiInsightCard insight={aiInsight} isLoading={isAiLoading} />
                )}

                <PostSessionExercisesPanel exercises={report.exercises} />
            </div>

            <AthleteFixedFooter size={report.has_feedback ? "double" : "single"}>
                <Button
                    variant="primary"
                    className={cn(ATHLETE_PRIMARY_CTA, "font-semibold")}
                    onClick={() => navigate("/dashboard")}
                >
                    Volver al inicio
                </Button>
                {report.has_feedback && (
                    <Button
                        variant="secondary"
                        className="min-h-touch-athlete w-full"
                        onClick={() => navigate("/dashboard/feedback")}
                    >
                        Ver mis notas
                    </Button>
                )}
            </AthleteFixedFooter>
        </div>
    );
};
