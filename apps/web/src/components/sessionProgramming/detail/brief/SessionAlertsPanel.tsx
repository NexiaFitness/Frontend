/**
 * SessionAlertsPanel — Avisos de sesión en detalle, dentro de SessionPanelShell.
 * Incluye CTA a la vista de revisión de alineación cuando hay bloque de periodización.
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import { useGetSessionCoherenceQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { SessionCoherence } from "@nexia/shared/types/trainingSessions";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { SessionPanelShell } from "@/components/sessionProgramming/SessionPanelShell";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";

export interface SessionAlertsPanelProps {
    sessionId: number;
    clientId: number;
    periodBlockId: number | null;
    embeddedCoherence: SessionCoherence | null;
    legacyInjuryNote: string | null;
    maxInjuries?: number;
    maxCoherenceWarnings?: number;
}

type AlertVariant = "error" | "warning" | "info";

function injuryVariant(injury: InjuryWithDetails): AlertVariant {
    if (injury.severity === "severe" || (injury.pain_level ?? 0) >= 4) return "error";
    return "warning";
}

function injuryHeadline(injury: InjuryWithDetails): string {
    const joint = injury.joint_name_es ?? injury.joint_name ?? null;
    const movement = injury.movement_name_es ?? injury.movement_name ?? null;
    if (joint && movement) return `${joint} · ${movement}`;
    return joint ?? movement ?? "Lesión sin detalle";
}

function injuryDetail(injury: InjuryWithDetails): string | null {
    const parts: string[] = [];
    if (injury.muscle_name_es) parts.push(injury.muscle_name_es);
    if (injury.pain_level != null) parts.push(`Dolor ${injury.pain_level}/5`);
    else if (injury.severity === "severe") parts.push("Severa");
    else if (injury.severity === "moderate") parts.push("Moderada");
    else if (injury.severity === "mild") parts.push("Leve");
    return parts.length ? parts.join(" · ") : null;
}

function InjuryAlert({ injury }: { injury: InjuryWithDetails }) {
    const detail = injuryDetail(injury);
    return (
        <Alert variant={injuryVariant(injury)}>
            <span className="font-medium">Lesión activa: </span>
            {injuryHeadline(injury)}
            {detail ? <span className="text-muted-foreground"> · {detail}</span> : null}
        </Alert>
    );
}

export const SessionAlertsPanel: React.FC<SessionAlertsPanelProps> = ({
    sessionId,
    clientId,
    periodBlockId,
    embeddedCoherence,
    legacyInjuryNote,
    maxInjuries = 3,
    maxCoherenceWarnings = 2,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { activeInjuries } = useClientInjuries({ clientId });

    const { data: fetchedCoherence } = useGetSessionCoherenceQuery(sessionId, {
        skip: !sessionId || !!embeddedCoherence,
    });
    const coherence = embeddedCoherence ?? fetchedCoherence ?? null;
    const coherenceWarnings = coherence?.coherence_warnings ?? [];

    const injuriesToShow = activeInjuries.slice(0, maxInjuries);
    const warningsToShow = coherenceWarnings.slice(0, maxCoherenceWarnings);
    const remainingInjuries = Math.max(0, activeInjuries.length - injuriesToShow.length);
    const remainingWarnings = Math.max(0, coherenceWarnings.length - warningsToShow.length);

    const showLegacyNote =
        activeInjuries.length === 0 && legacyInjuryNote && legacyInjuryNote.trim().length > 0;

    const hasAlerts =
        injuriesToShow.length > 0 || warningsToShow.length > 0 || showLegacyNote;
    const canReview = periodBlockId != null;

    if (!hasAlerts && !canReview) return null;

    const handleReview = () => {
        navigate(`/dashboard/session-programming/sessions/${sessionId}/review`, {
            state: returnToStateFromView(location),
        });
    };

    return (
        <SessionPanelShell
            title="Alineación con el plan"
            subtitle="Resumen de avisos de lesiones y coherencia. Revisa patrones, volumen, carga axial y seguridad frente al bloque activo."
            headerAccessory={
                canReview ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleReview}
                        className="shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                        Revisar alineación
                        <ChevronRight className="ml-0.5 h-4 w-4" aria-hidden />
                    </Button>
                ) : undefined
            }
            bodyClassName={hasAlerts ? "space-y-4" : "hidden p-0"}
        >
            {hasAlerts ? (
                <div className="space-y-2" role="region" aria-label="Avisos de la sesión">
                    {injuriesToShow.map((injury) => (
                        <InjuryAlert key={`injury-${injury.id}`} injury={injury} />
                    ))}

                    {remainingInjuries > 0 && (
                        <p className="text-xs italic text-muted-foreground px-1">
                            +{remainingInjuries} lesión{remainingInjuries === 1 ? "" : "es"} más en la
                            ficha del cliente
                        </p>
                    )}

                    {warningsToShow.map((w, i) => (
                        <Alert key={`coh-${i}`} variant="warning">
                            <span className="font-medium">Coherencia: </span>
                            {w.message}
                        </Alert>
                    ))}

                    {remainingWarnings > 0 && (
                        <p className="text-xs italic text-muted-foreground px-1">
                            +{remainingWarnings} aviso{remainingWarnings === 1 ? "" : "s"} de coherencia
                            más
                        </p>
                    )}

                    {showLegacyNote ? (
                        <Alert variant="info">
                            <span className="font-medium">Notas del perfil: </span>
                            {legacyInjuryNote!.trim()}
                        </Alert>
                    ) : null}
                </div>
            ) : null}
        </SessionPanelShell>
    );
};
