/**
 * AthleteSessionFeedbackPage.tsx — V07 feedback post-sesion (F1) + valoracion de sesion (D3).
 * Contexto: checkout del atleta tras completar una sesion. Recoge sensaciones fisiologicas
 * (esfuerzo, fatiga, sueno, motivacion, dolor/notas) y, como primer paso, una valoracion
 * de satisfaccion 1-5 que alimenta ClientRating en el dashboard del entrenador.
 * Contratos: 10_DECISIONES_PRODUCTO_F1.md, DESIGN_MOBILE_FIRST_ATLETA.md, agent.md §5/§11.
 * @author Frontend Team
 * @since v6.2.0
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
    useGetPostSessionReportQuery,
    useGetTrainingSessionQuery,
} from "@nexia/shared/api/trainingSessionsApi";
import { useCreateClientRatingMutation } from "@nexia/shared/api/clientsApi";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import {
    ATHLETE_PAGE,
    ATHLETE_STICKY_FOOTER_SPACER,
} from "@/components/athlete/layout/athleteLayoutClasses";
import { cn } from "@/lib/utils";
import { scrollDashboardMainToElementAfterPaint } from "@/lib/dashboardScroll";

// ---------------------------------------------------------------------------
// Satisfaccion 1-5: etiquetas descriptivas por valor seleccionado.
// ---------------------------------------------------------------------------
const SATISFACTION_LABELS: Record<number, string> = {
    1: "Muy mala",
    2: "Mala",
    3: "Regular",
    4: "Buena",
    5: "Excelente",
};

export const AthleteSessionFeedbackPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();
    const { clientId } = useAthleteContext();
    const expandDetails = feedbackFormExpandsDetails(searchParams);
    const focusPain = feedbackFormFocusesPain(searchParams);
    const fromFinish = searchParams.get("from") === "finish";
    const summaryPath = `/dashboard/sessions/${sessionId}/summary`;
    const painRef = useRef<HTMLTextAreaElement>(null);

    const { data: session, isLoading: isLoadingSession } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId,
    });
    const { data: report, isLoading: isLoadingReport } = useGetPostSessionReportQuery(sessionId, {
        skip: !sessionId,
    });
    const isLoading = isLoadingSession || isLoadingReport;

    const [createFeedback, { isLoading: isSubmitting }] = useCreateSessionFeedbackMutation();
    const [createRating] = useCreateClientRatingMutation();

    // Sensaciones fisiologicas
    const [effort, setEffort] = useState(7);
    const [fatigue, setFatigue] = useState(5);
    const [sleep, setSleep] = useState(7);
    const [motivation, setMotivation] = useState(7);
    const [pain, setPain] = useState("");
    const [notes, setNotes] = useState("");

    // Valoracion de sesion 1-5 (opcional — null = no valorada)
    const [satisfactionRating, setSatisfactionRating] = useState<number | null>(null);

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

            // Enviar valoracion de sesion si el atleta la selecciono.
            // Un 409 (ya existe rating para esta sesion) se ignora — no es un error de usuario.
            if (satisfactionRating !== null) {
                try {
                    await createRating({
                        clientId,
                        data: {
                            client_id: clientId,
                            rating: satisfactionRating,
                            session_id: sessionId,
                            rating_type: "session",
                        },
                    }).unwrap();
                } catch {
                    // Rating duplicado u otro error — no bloquea el flujo.
                }
            }

            showToast("success", "Feedback enviado a tu entrenador");
            navigate(summaryPath);
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

    if (report?.has_feedback) {
        return <Navigate to={summaryPath} replace />;
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
                onBack={() => (fromFinish ? navigate(summaryPath) : navigate(-1))}
                sessionName={session?.session_name}
            />

            <div
                className={cn(
                    "flex-1 space-y-4 pt-5",
                    ATHLETE_STICKY_FOOTER_SPACER.withSecondaryLink
                )}
            >
                {/* Seccion de valoracion de sesion (D3) */}
                <section className={cn(NEXIA_GLASS_CARD, "relative p-4 pt-5")}>
                    <NexiaGlassAccentRim />
                    <div className="relative space-y-3">
                        <div className="flex items-baseline justify-between gap-2">
                            <p className={ATHLETE_SECTION_LABEL}>
                                ¿Qué tal ha ido la sesión?
                            </p>
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/55">
                                opcional
                            </span>
                        </div>

                        {/* Picker 1-5 con touch target >= 48 px (gym spec) */}
                        <div
                            role="radiogroup"
                            aria-label="Valoración de la sesión del 1 al 5"
                            className="flex gap-1.5"
                        >
                            {([1, 2, 3, 4, 5] as const).map((v) => {
                                const isSelected = satisfactionRating === v;
                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        aria-label={`${v} — ${SATISFACTION_LABELS[v]}`}
                                        onClick={() =>
                                            setSatisfactionRating(isSelected ? null : v)
                                        }
                                        className={cn(
                                            "relative flex h-12 min-w-0 flex-1 items-center justify-center rounded-lg",
                                            "text-sm font-semibold tabular-nums transition-all duration-150",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                            "motion-safe:active:scale-[0.92] motion-reduce:active:scale-100",
                                            isSelected
                                                ? "border border-primary/40 bg-primary/20 text-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.5)]"
                                                : "bg-surface-2 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {v}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground/55">
                            <span>Mala</span>
                            <span>Excelente</span>
                        </div>

                        {/* Etiqueta descriptiva animada al seleccionar */}
                        <div className="h-4">
                            {satisfactionRating !== null && (
                                <p className="text-center text-xs font-medium text-primary/80">
                                    {SATISFACTION_LABELS[satisfactionRating]}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Sensaciones principales */}
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
                    onClick={() => navigate(summaryPath)}
                >
                    Ver mi resumen
                </button>
            </AthleteFixedFooter>
        </div>
    );
};
