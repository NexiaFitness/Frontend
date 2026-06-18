/**
 * AthleteFeedbackHistoryHeader.tsx — Cabecera premium historial notas (V12).
 */

import React from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { ATHLETE_DIVIDER } from "@/components/athlete/account/athleteSettingsPresentation";

export interface AthleteFeedbackHistoryHeaderProps {
    onBack: () => void;
}

export const AthleteFeedbackHistoryHeader: React.FC<AthleteFeedbackHistoryHeaderProps> = ({
    onBack,
}) => {
    return (
        <header className="space-y-4">
            <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-touch-athlete items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
                <ArrowLeft className="size-4" aria-hidden />
                Volver
            </button>

            <div className="flex items-start gap-3">
                <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary backdrop-blur-sm"
                    aria-hidden
                >
                    <MessageSquare className="size-5" />
                </span>
                <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Mis notas
                    </h1>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Feedback enviado y respuestas de tu entrenador
                    </p>
                </div>
            </div>

            <div className={`w-full ${ATHLETE_DIVIDER}`} aria-hidden />
        </header>
    );
};
