/**
 * SessionAlertsRow.tsx — Tiras finas de aviso bajo el SessionContextStrip.
 *
 * Renderiza una pila vertical de líneas (NO cards) solo si hay algo accionable:
 *  - Una línea por lesión activa estructurada (máx 3).
 *  - Una línea por warning de coherencia (máx 2).
 *  - Una línea fallback con `lesiones_relevantes` (texto del perfil legacy)
 *    cuando no hay lesiones estructuradas.
 *
 * Si no hay datos, el componente devuelve `null` y desaparece sin reservar
 * espacio. Cada línea es un flex row con icono + texto + acento izquierdo
 * de 2px del color semántico, sin sombras ni padding generoso: queremos
 * que pase desapercibido cuando no hay nada y avise sin gritar cuando sí.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import { useGetSessionCoherenceQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { SessionCoherence } from "@nexia/shared/types/trainingSessions";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SessionAlertsRowProps {
    sessionId: number;
    clientId: number;
    /** Coherencia embebida en la sesión (Fase 3 BE). Si viene, no se hace fetch extra. */
    embeddedCoherence: SessionCoherence | null;
    /** Texto libre del perfil `lesiones_relevantes` para fallback legacy. */
    legacyInjuryNote: string | null;
    /** Máximo de lesiones renderizadas como tira (por defecto 3). */
    maxInjuries?: number;
    /** Máximo de warnings de coherencia renderizados (por defecto 2). */
    maxCoherenceWarnings?: number;
}

// ---------------------------------------------------------------------------
// Helpers visuales
// ---------------------------------------------------------------------------

type AlertTone = "danger" | "warning" | "neutral";

function injuryTone(injury: InjuryWithDetails): AlertTone {
    if (injury.severity === "severe" || (injury.pain_level ?? 0) >= 4) return "danger";
    if (injury.severity === "moderate" || (injury.pain_level ?? 0) === 3) return "warning";
    return "warning";
}

const TONE_BORDER: Record<AlertTone, string> = {
    danger: "border-l-destructive",
    warning: "border-l-[hsl(var(--warning))]",
    neutral: "border-l-border",
};

const TONE_ICON: Record<AlertTone, string> = {
    danger: "text-destructive",
    warning: "text-[hsl(var(--warning))]",
    neutral: "text-muted-foreground",
};

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

// ---------------------------------------------------------------------------
// Sub-componente: tira individual
// ---------------------------------------------------------------------------

function AlertLine({
    tone,
    icon,
    label,
    headline,
    detail,
}: {
    tone: AlertTone;
    icon: React.ReactNode;
    label: string;
    headline: string;
    detail?: string | null;
}) {
    return (
        <li
            className={cn(
                "flex items-center gap-3 rounded-r-md border-l-2 bg-card/30 px-3 py-2",
                TONE_BORDER[tone]
            )}
        >
            <span className={cn("shrink-0", TONE_ICON[tone])} aria-hidden>
                {icon}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80 shrink-0 hidden sm:inline">
                {label}
            </span>
            <span className="min-w-0 flex-1 text-sm text-foreground truncate">
                <span className="font-medium">{headline}</span>
                {detail ? (
                    <span className="text-muted-foreground"> · {detail}</span>
                ) : null}
            </span>
        </li>
    );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export const SessionAlertsRow: React.FC<SessionAlertsRowProps> = ({
    sessionId,
    clientId,
    embeddedCoherence,
    legacyInjuryNote,
    maxInjuries = 3,
    maxCoherenceWarnings = 2,
}) => {
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

    const hasAny =
        injuriesToShow.length > 0 || warningsToShow.length > 0 || showLegacyNote;

    if (!hasAny) return null;

    return (
        <ul aria-label="Avisos de la sesión" className="space-y-1.5">
            {injuriesToShow.map((injury) => (
                <AlertLine
                    key={`injury-${injury.id}`}
                    tone={injuryTone(injury)}
                    icon={<ShieldAlert className="h-4 w-4" />}
                    label="Lesión"
                    headline={injuryHeadline(injury)}
                    detail={injuryDetail(injury)}
                />
            ))}

            {remainingInjuries > 0 && (
                <li className="px-3 text-[11px] italic text-muted-foreground">
                    +{remainingInjuries} lesión{remainingInjuries === 1 ? "" : "es"} más sin mostrar
                </li>
            )}

            {warningsToShow.map((w, i) => (
                <AlertLine
                    key={`coh-${i}`}
                    tone="warning"
                    icon={<AlertTriangle className="h-4 w-4" />}
                    label="Coherencia"
                    headline={w.message}
                />
            ))}

            {remainingWarnings > 0 && (
                <li className="px-3 text-[11px] italic text-muted-foreground">
                    +{remainingWarnings} aviso{remainingWarnings === 1 ? "" : "s"} de coherencia más
                </li>
            )}

            {showLegacyNote && (
                <AlertLine
                    tone="neutral"
                    icon={<Info className="h-4 w-4" />}
                    label="Nota"
                    headline="Notas del perfil"
                    detail={legacyInjuryNote!.trim()}
                />
            )}
        </ul>
    );
};
