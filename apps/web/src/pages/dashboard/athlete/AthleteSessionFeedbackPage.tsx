/**
 * AthleteSessionFeedbackPage.tsx — V07 feedback post-sesión (F1).
 * Esfuerzo + fatiga visibles; resto colapsado. Contrato: 10_DECISIONES_PRODUCTO_F1.md
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useLayoutEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CollapsibleFormGroup } from "@/components/ui/forms/CollapsibleFormGroup";
import { AthleteRatingScale } from "@/components/athlete/feedback/AthleteRatingScale";
import { Button } from "@/components/ui/buttons";
import { Alert, useToast } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { AthleteSessionFeedbackHeader } from "@/components/athlete/feedback/AthleteSessionFeedbackHeader";
import {
    feedbackFormExpandsDetails,
    feedbackFormFocusesPain,
} from "@/components/athlete/feedback/athleteSessionFeedbackNavigation";
import {
    ATHLETE_FORM_FIELD_LABEL,
    ATHLETE_FORM_TEXTAREA,
    ATHLETE_INNER_DIVIDER,
    ATHLETE_PRIMARY_CTA,
    ATHLETE_SECTION_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { AUTH_LINK } from "@/components/auth/authFormPresentation";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import {
    useCreateSessionFeedbackMutation,
    useGetTrainingSessionQuery,
} from "@nexia/shared/api/trainingSessionsApi";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import {
    ATHLETE_PAGE,
    ATHLETE_STICKY_FOOTER_SPACER,
} from "@/components/athlete/layout/athleteLayoutClasses";
import { cn } from "@/lib/utils";
import { scrollDashboardMainToElementAfterPaint } from "@/lib/dashboardScroll";

export const AthleteSessionFeedbackPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();
    const { clientId } = useAthleteContext();
    const expandDetails = feedbackFormExpandsDetails(searchParams);
    const focusPain = feedbackFormFocusesPain(searchParams);
    const painRef = useRef<HTMLTextAreaElement>(null);

    const { data: session, isLoading } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId,
    });

    const [createFeedback, { isLoading: isSubmitting }] = useCreateSessionFeedbackMutation();

    const [effort, setEffort] = useState(7);
    const [fatigue, setFatigue] = useState(5);
    const [sleep, setSleep] = useState(7);
    const [motivation, setMotivation] = useState(7);
    const [pain, setPain] = useState("");
    const [notes, setNotes] = useState("");

    useLayoutEffect(() => {
        if (!focusPain || isLoading) return;
        return scrollDashboardMainToElementAfterPaint(() => painRef.current, {
            behavior: "auto",
            align: "start",
            offsetTop: 8,
            offsetBottom: 176,
        });
    }, [focusPain, isLoading]);

    const handleSubmit = async () => {
        if (!clientId) return;
        try {
            await createFeedback({
                sessionId,
                body: {
                    client_id: clientId,
                    perceived_effort: effort,
                    fatigue_level: fatigue,
                    sleep_quality: sleep,
                    motivation_level: motivation,
                    pain_or_discomfort: pain.trim() || null,
                    notes: notes.trim() || null,
                },
            }).unwrap();
            showToast("success", "Feedback enviado a tu entrenador");
            navigate("/dashboard");
        } catch {
            showToast("error", "No se pudo enviar el feedback");
        }
    };

    if (isLoading) {
        return <AthletePageLoading variant="session-feedback" />;
    }

    if (session && session.status !== "completed") {
        return <Navigate to={`/dashboard/sessions/${sessionId}`} replace />;
    }

    const painField = (
        <div>
            <label className={ATHLETE_FORM_FIELD_LABEL} htmlFor="athlete-feedback-pain">
                Dolor o molestias
            </label>
            <textarea
                id="athlete-feedback-pain"
                ref={painRef}
                value={pain}
                onChange={(e) => setPain(e.target.value)}
                rows={2}
                className={ATHLETE_FORM_TEXTAREA}
                placeholder="Opcional — zona, intensidad…"
            />
        </div>
    );

    const notesField = (
        <div>
            <label className={ATHLETE_FORM_FIELD_LABEL}>Notas</label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={ATHLETE_FORM_TEXTAREA}
                placeholder="Cuéntale cómo te sentiste en la sesión…"
            />
        </div>
    );

    const sleepField = (
        <AthleteRatingScale
            label="Calidad del sueño"
            value={sleep}
            onChange={setSleep}
            lowAnchor="Mala"
            highAnchor="Excelente"
        />
    );

    const motivationField = (
        <AthleteRatingScale
            label="Motivación"
            value={motivation}
            onChange={setMotivation}
            lowAnchor="Baja"
            highAnchor="Alta"
        />
    );

    const optionalDetailFields = focusPain
        ? (
              [
                  ["pain", painField],
                  ["notes", notesField],
                  ["sleep", sleepField],
                  ["motivation", motivationField],
              ] as const
          )
        : (
              [
                  ["sleep", sleepField],
                  ["motivation", motivationField],
                  ["pain", painField],
                  ["notes", notesField],
              ] as const
          );

    return (
        <div className={cn(ATHLETE_PAGE, "flex min-h-full flex-col")}>
            <AthleteSessionFeedbackHeader
                onBack={() => navigate(-1)}
                sessionName={session?.session_name}
            />

            <div
                className={cn(
                    "flex-1 space-y-4 pt-5",
                    ATHLETE_STICKY_FOOTER_SPACER.withSecondaryLink
                )}
            >
                <section className={cn(NEXIA_GLASS_CARD, "relative space-y-6 p-4 pt-5")}>
                    <NexiaGlassAccentRim />

                    <div className="relative space-y-5">
                        <p className={ATHLETE_SECTION_LABEL}>Sensaciones principales</p>
                        <AthleteRatingScale
                            label="Esfuerzo percibido"
                            value={effort}
                            onChange={setEffort}
                            lowAnchor="Fácil"
                            highAnchor="Máximo"
                        />
                        <AthleteRatingScale
                            label="Fatiga"
                            value={fatigue}
                            color="warning"
                            onChange={setFatigue}
                            lowAnchor="Fresco"
                            highAnchor="Agotado"
                        />
                    </div>

                    <div className={ATHLETE_INNER_DIVIDER} aria-hidden />

                    <CollapsibleFormGroup
                        title="Más detalles (opcional)"
                        defaultOpen={expandDetails}
                        className="relative border-0 pt-0"
                    >
                        <div className="space-y-5">
                            {optionalDetailFields.map(([key, field]) => (
                                <React.Fragment key={key}>{field}</React.Fragment>
                            ))}
                        </div>
                    </CollapsibleFormGroup>
                </section>

                {pain.trim().length > 0 && (
                    <Alert variant="warning">
                        <p className="text-sm">
                            Si el dolor persiste, contacta con tu entrenador antes de la próxima
                            sesión.
                        </p>
                    </Alert>
                )}
            </div>

            <AthleteFixedFooter size="withSecondaryLink">
                <Button
                    variant="primary"
                    className={ATHLETE_PRIMARY_CTA}
                    disabled={isSubmitting || !clientId}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? "Enviando…" : "Enviar feedback"}
                </Button>
                <button
                    type="button"
                    className={cn(AUTH_LINK, "w-full py-2 text-center")}
                    onClick={() => navigate("/dashboard")}
                >
                    Omitir por ahora
                </button>
            </AthleteFixedFooter>
        </div>
    );
};
