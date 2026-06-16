/**
 * AthleteSessionFeedbackPage.tsx — V07 feedback post-sesión (F1).
 * Esfuerzo + fatiga visibles; resto colapsado. Contrato: 10_DECISIONES_PRODUCTO_F1.md
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CollapsibleFormGroup } from "@/components/ui/forms/CollapsibleFormGroup";
import { Slider } from "@/components/ui/forms/Slider";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner, useToast } from "@/components/ui/feedback";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import {
    useCreateSessionFeedbackMutation,
    useGetTrainingSessionQuery,
} from "@nexia/shared/api/trainingSessionsApi";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";

export const AthleteSessionFeedbackPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { clientId } = useAthleteContext();

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
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className={`flex min-h-full flex-col ${ATHLETE_PAGE_X} pt-4 lg:pb-8`}>
            <header className="mb-6 space-y-1">
                <h1 className="text-xl font-bold text-foreground">¿Cómo fue la sesión?</h1>
                <p className="text-sm text-muted-foreground">
                    {session?.session_name ?? "Tu entrenamiento"} · Tu entrenador verá esto al
                    revisar tu ficha
                </p>
            </header>

            <div className="flex-1 space-y-6">
                <Slider
                    label="Esfuerzo percibido"
                    value={effort}
                    min={1}
                    max={10}
                    onChange={setEffort}
                />
                <Slider
                    label="Fatiga"
                    value={fatigue}
                    min={1}
                    max={10}
                    color="warning"
                    onChange={setFatigue}
                />

                <CollapsibleFormGroup title="Más detalles (opcional)" defaultOpen={false}>
                    <div className="space-y-4 pt-2">
                        <Slider label="Calidad del sueño" value={sleep} min={1} max={10} onChange={setSleep} />
                        <Slider
                            label="Motivación"
                            value={motivation}
                            min={1}
                            max={10}
                            onChange={setMotivation}
                        />
                        <div>
                            <label className="mb-1 block text-sm font-medium text-foreground">
                                Dolor o molestias
                            </label>
                            <textarea
                                value={pain}
                                onChange={(e) => setPain(e.target.value)}
                                rows={2}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Opcional"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-foreground">
                                Notas
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Opcional"
                            />
                        </div>
                    </div>
                </CollapsibleFormGroup>

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
                    className="min-h-touch-athlete w-full"
                    disabled={isSubmitting || !clientId}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? "Enviando…" : "Enviar feedback"}
                </Button>
                <button
                    type="button"
                    className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => navigate("/dashboard")}
                >
                    Omitir por ahora
                </button>
            </AthleteFixedFooter>
        </div>
    );
};
